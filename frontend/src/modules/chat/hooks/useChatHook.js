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
  const { userInfo } = useSelector((state) => state.auth);

  const { onMessage, onTyping, onUserJoined, onUserLeft } = handlers;

  useEffect(() => {
    if (!listingId || !userInfo) {
      console.warn("Waiting for listingId or userInfo...");
      return;
    }

    let isComponentMounted = true;

    const setupSocket = () => {
      const currentToken = store.getState().auth.accessToken;

      if (!currentToken) {
        console.error("No access token found");
        return;
      }

      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '')
        || "http://localhost:5001";

      // Reuse existing socket if it's connected and authenticated
      if (globalSocket?.connected && globalSocket?.auth?.token === currentToken) {
        // console.log("Reusing existing socket connection");
        socketRef.current = globalSocket;

        // Leave old room if different
        if (currentListingId && currentListingId !== listingId) {
          // console.log("Leaving old room:", currentListingId);
          globalSocket.emit("leaveRoom", { listingId: currentListingId });
        }

        // Join new room
        joinRoom(globalSocket, listingId, userInfo);
        currentListingId = listingId;
        return;
      }

      // Disconnect old socket if exists
      if (globalSocket) {
        console.log("🔌 Disconnecting old socket");
        globalSocket.removeAllListeners();
        globalSocket.disconnect();
        globalSocket = null;
      }

      console.log("🔌 Creating new socket connection to:", SOCKET_URL);

      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: {
          token: currentToken,
          userId: userInfo._id || userInfo.id,
          userName: userInfo.name
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true,
      });

      globalSocket = socket;
      socketRef.current = socket;
      currentListingId = listingId;

      // Connection events
      socket.on("connect", () => {
        if (!isComponentMounted) return;
        console.log("Socket connected:", socket.id);
        setIsConnected(true);
        setReconnectAttempts(0);
        toast.dismiss(); // Clear any error toasts

        // Join room after connection
        joinRoom(socket, listingId, userInfo);
      });

      socket.on("disconnect", (reason) => {
        if (!isComponentMounted) return;
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        setIsRoomJoined(false);
        isJoiningRef.current = false;
      });

      socket.on("reconnect_attempt", (attemptNumber) => {
        if (!isComponentMounted) return;
        console.log("Reconnect attempt:", attemptNumber);
        setReconnectAttempts(attemptNumber);

        if (attemptNumber === 1) {
          toast.loading("Reconnecting...", { id: "reconnecting" });
        }
      });

      socket.on("reconnect", (attemptNumber) => {
        if (!isComponentMounted) return;
        console.log("Reconnected after", attemptNumber, "attempts");
        toast.dismiss("reconnecting");
        toast.success("Reconnected!", { duration: 2000 });

        // Rejoin room after reconnection
        joinRoom(socket, listingId, userInfo);
      });

      socket.on("reconnect_failed", () => {
        if (!isComponentMounted) return;
        console.error("Reconnection failed");
        toast.dismiss("reconnecting");
        toast.error("Connection lost. Please refresh the page.");
      });

      // Room events
      socket.on("joinSuccess", ({ listingId: joinedRoom, chatId }) => {
        if (!isComponentMounted) return;
        console.log("Successfully joined room:", joinedRoom);
        setIsRoomJoined(true);
        isJoiningRef.current = false;
      });

      // Message events
      socket.on("receiveMessage", (message) => {
        if (!isComponentMounted) return;
        console.log("Message received:", message);
        if (typeof onMessage === "function") {
          onMessage(message);
        }
      });

      // Typing events
      socket.on("userTyping", (data) => {
        if (!isComponentMounted) return;
        if (typeof onTyping === "function") {
          onTyping(data);
        }
      });

      socket.on("userStoppedTyping", (data) => {
        if (!isComponentMounted) return;
        // Handle stop typing if needed
      });

      // User events
      socket.on("userJoined", (data) => {
        if (!isComponentMounted) return;
        console.log("👤 User joined:", data.userName);
        if (typeof onUserJoined === "function") {
          onUserJoined(data);
        }
      });

      socket.on("userLeft", (data) => {
        if (!isComponentMounted) return;
        if (typeof onUserLeft === "function") {
          onUserLeft(data);
        }
      });

      // Error events
      socket.on("error", (err) => {
        if (!isComponentMounted) return;
        console.error("Socket error:", err);
        toast.error(err.message || "Socket error occurred");
      });

      socket.on("connect_error", (err) => {
        if (!isComponentMounted) return;
        console.error("Connection error:", err.message);

        if (err.message?.includes("jwt") || err.message?.includes("token")) {
          console.warn("Token issue, will retry...");
          // Let socket.io handle reconnection
        }
      });
    };

    // Helper function to join room
    const joinRoom = (socket, roomId, user) => {
      if (isJoiningRef.current) {
        console.log("⏳ Already joining room, skipping...");
        return;
      }

      isJoiningRef.current = true;
      // console.log("Joining room:", roomId);

      socket.emit("joinRoom", {
        listingId: roomId,
        userId: user._id || user.id,
        userName: user.name
      });
    };

    setupSocket();

    // Cleanup
    return () => {
      // console.log("Cleaning up chat hook for listing:", listingId);
      isComponentMounted = false;
      setIsRoomJoined(false);
      isJoiningRef.current = false;

      // Don't disconnect global socket, just leave the room
      if (globalSocket && currentListingId === listingId) {
        console.log("Leaving room:", listingId);
        globalSocket.emit("leaveRoom", { listingId });
        currentListingId = null;
      }
    };
  }, [listingId, userInfo?._id]); // Only re-run when these change

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
          console.log("Message sent successfully");
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