import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { store } from "../../../core/store/store";


let globalSocket = null;
let currentListingId = null;

export function useChatSocket(listingId, handlers = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const socketRef = useRef(null);
  const isJoiningRef = useRef(false);
  const { userInfo, accessToken } = useSelector((state) => state.auth);
  
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // console.log("🔍 [useChatSocket] Effect triggered for listing:", listingId, "User ID:", userInfo?._id);
    
    if (!listingId || !userInfo) {
      return;
    }

    let isComponentMounted = true;

    const setupSocket = () => {
      const currentToken = accessToken;

      if (!currentToken) {
        // console.warn("No access token found");
        return;
      }

      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '')
        || "http://localhost:5001";

      // Reuse existing socket if it's connected and authenticated
      if (globalSocket?.connected && globalSocket?.auth?.token === currentToken) {
        socketRef.current = globalSocket;
        // console.log("Reusing existing socket connection");
      } else {
        // Disconnect old socket if it exists but is incompatible
        if (globalSocket) {
          console.log("🔌 Replacing stale socket");
          globalSocket.removeAllListeners();
          globalSocket.disconnect();
          globalSocket = null;
        }

        console.log("🔌 Creating new socket connection to:", SOCKET_URL);
        globalSocket = io(SOCKET_URL, {
          withCredentials: true,
          transports: ["websocket", "polling"],
          auth: {
            token: currentToken,
            userId: userInfo._id || userInfo.id,
            userName: userInfo.name
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });
        socketRef.current = globalSocket;
      }

      const socket = globalSocket;

      // Listeners using handlersRef for fresh callbacks
      const onConnect = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        toast.dismiss();
        joinRoom(socket, listingId, userInfo);
      };

      const onDisconnect = (reason) => {
        setIsConnected(false);
        setIsRoomJoined(false);
        isJoiningRef.current = false;
      };

      const onJoinSuccess = ({ listingId: joinedRoom }) => {
        if (joinedRoom === listingId) {
          setIsRoomJoined(true);
          isJoiningRef.current = false;
        }
      };

      const onReceiveMessage = (msg) => {
        handlersRef.current.onMessage?.(msg);
      };

      const onUserTyping = (data) => {
        handlersRef.current.onTyping?.(data);
      };

      const onError = (err) => {
        toast.error(err.message || "Socket error");
      };

      // Attach
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("joinSuccess", onJoinSuccess);
      socket.on("receiveMessage", onReceiveMessage);
      socket.on("userTyping", onUserTyping);
      socket.on("error", onError);

      // Join if already connected
      if (socket.connected) {
        onConnect();
      }

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("joinSuccess", onJoinSuccess);
        socket.off("receiveMessage", onReceiveMessage);
        socket.off("userTyping", onUserTyping);
        socket.off("error", onError);
      };
    };

    const joinRoom = (socket, roomId, user) => {
      if (isJoiningRef.current || isRoomJoined) return;
      isJoiningRef.current = true;
      socket.emit("joinRoom", {
        listingId: roomId,
        userId: user._id || user.id,
        userName: user.name
      });
    };

    const cleanupListeners = setupSocket();

    return () => {
      setIsRoomJoined(false);
      isJoiningRef.current = false;

      if (cleanupListeners) cleanupListeners();

      if (globalSocket && globalSocket.connected) {
        globalSocket.emit("leaveRoom", { listingId });
      }
      
      socketRef.current = null;
    };
  }, [listingId, userInfo?._id, accessToken]); 

  // Send message
  const sendMessage = useCallback((text) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;

      if (!socket) {
        console.error("Socket not initialized");
        toast.error("Connection not established");
        reject(new Error("Socket not initialized"));
        return;
      }

      if (!socket.connected) {
        console.error("Socket not connected");
        toast.error("Not connected. Please wait...");
        reject(new Error("Not connected"));
        return;
      }

      if (!isRoomJoined) {
        console.error("Room not joined");
        toast.error("Joining chat room...");
        reject(new Error("Room not joined"));
        return;
      }



      const messageData = {
        listingId,
        text,
        senderId: userInfo._id || userInfo.id,
        senderName: userInfo.name,
      };

      // Set a timeout in case callback never fires
      const timeoutId = setTimeout(() => {
        console.warn("Message send timeout");
        reject(new Error("Message send timeout"));
      }, 10000);

      socket.emit("sendMessage", messageData, (response) => {
        clearTimeout(timeoutId);

        if (response?.error) {
          console.error("Send failed:", response.error);
          toast.error("Failed to send message");
          reject(new Error(response.error));
        } else {
          // console.log("Message sent successfully");
          resolve(response);
        }
      });
    });
  }, [listingId, userInfo, isRoomJoined]);

  // Send typing indicator
  const sendTyping = useCallback((userName) => {
    if (!socketRef.current?.connected || !isRoomJoined) return;

    socketRef.current.emit("typing", {
      listingId,
      userId: userInfo._id || userInfo.id,
      userName: userName || userInfo.name
    });
  }, [listingId, userInfo, isRoomJoined]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socketRef.current?.connected || !isRoomJoined) return;

    socketRef.current.emit("stopTyping", {
      listingId,
      userId: userInfo._id || userInfo.id
    });
  }, [listingId, userInfo, isRoomJoined]);

  return {
    sendMessage,
    isConnected: isConnected && isRoomJoined,
    sendTyping,
    stopTyping,
    reconnectAttempts
  };
}

// Cleanup function to disconnect socket when app unmounts
export const disconnectSocket = () => {
  if (globalSocket) {
    console.log("Disconnecting global socket");
    globalSocket.removeAllListeners();
    globalSocket.disconnect();
    globalSocket = null;
    currentListingId = null;
  }
};