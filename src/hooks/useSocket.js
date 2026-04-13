import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

/**
 * Custom hook quản lý kết nối Socket.IO
 * - Tự động connect với token từ localStorage
 * - Tự động disconnect khi unmount
 * - Expose: socket instance, joinConversation, sendMessage
 */
export function useSocket({ onMessage, onError, onConnect } = {}) {
  const socketRef = useRef(null);
  
  // Dùng refs để tránh stale closure cho các callback
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);

  // Cập nhật refs mỗi khi callback thay đổi từ component cha
  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
    onConnectRef.current = onConnect;
  }, [onMessage, onError, onConnect]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("[Socket] Initializing connection...");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      if (onConnectRef.current) onConnectRef.current(socket);
    });

    socket.on("message", (msg) => {
      console.log("[Socket] New message received:", msg);
      if (onMessageRef.current) onMessageRef.current(msg);
    });

    socket.on("error", (errMsg) => {
      console.warn("[Socket] Error from server:", errMsg);
      if (onErrorRef.current) onErrorRef.current(errMsg);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    return () => {
      console.log("[Socket] Cleaning up connection...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // chỉ mount 1 lần

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      console.log("[Socket] Joining room:", conversationId);
      socketRef.current.emit("joinConversation", { conversationId });
    }
  }, []);

  const sendMessage = useCallback((conversationId, content) => {
    if (socketRef.current && conversationId && content) {
      console.log("[Socket] Sending message to:", conversationId);
      socketRef.current.emit("message", { conversationId, content });
    }
  }, []);

  return { socketRef, joinConversation, sendMessage };
}
