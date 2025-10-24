import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { store } from "../../../core/store/store";

export function useChatSocket(listingId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!listingId) {
      console.warn("Waiting for listingId...");
      return;
    }

    let socket;

    const connectSocket = () => {
      const currentToken = store.getState().auth.accessToken;


      const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') 
        || "https://medilink-od6x.onrender.com";

      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        auth: { token: currentToken },
        reconnection: true, // Enable automatic reconnection
        reconnectionDelay: 1000, // Wait 1s before reconnecting
        reconnectionAttempts: 5, // Try 5 times before giving up
      });

      socketRef.current = socket;

      socket.emit("joinRoom", { listingId });

      socket.on("receiveMessage", (message) => {
        if (typeof onMessage === "function") onMessage(message);
      });

      socket.on("connect", () => {
        // console.log("Socket connected");
      });

      socket.on("disconnect", (reason) => {
        // console.log(" Socket disconnected:", reason);
      });

      socket.on("error", (err) => {
        // console.error(" Socket error:", err.message);
      });

      //  Detect JWT expiration and reconnect automatically
      socket.on("connect_error", (err) => {
        if (err.message?.includes("jwt expired")) {
          console.warn(" JWT expired — reconnecting with fresh token...");
          socket.disconnect();

          // wait a moment so Axios refresh can run and update Redux
          setTimeout(() => {
            connectSocket();
          }, 1000);
        } else {
          console.error("Socket connection error:", err.message);
        }
      });
    };

    connectSocket();

    return () => {
        socket.removeAllListeners();
      socket?.disconnect();
    };
  }, [listingId, onMessage]);

  const sendMessage = (text) => {
    if (!socketRef.current || !listingId) return;
    socketRef.current.emit("sendMessage", { listingId, text });
  };

  return { sendMessage };
}
