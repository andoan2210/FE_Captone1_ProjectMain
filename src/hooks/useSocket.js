import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

/**
 * Custom hook quản lý kết nối Socket.IO
 * - Tự động connect với token từ localStorage
 * - Tự động disconnect khi unmount
 * - Expose: socket instance, joinConversation, sendMessage
 */
export function useSocket({ onMessage, onError, onConnect } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      if (onConnect) onConnect(socket);
    });

    socket.on('message', (msg) => {
      if (onMessage) onMessage(msg);
    });

    socket.on('error', (errMsg) => {
      console.warn('[Socket] Error from server:', errMsg);
      if (onError) onError(errMsg);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ mount 1 lần

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('joinConversation', { conversationId });
    }
  }, []);

  const sendMessage = useCallback((conversationId, content) => {
    if (socketRef.current && conversationId && content) {
      socketRef.current.emit('message', { conversationId, content });
    }
  }, []);

  return { socketRef, joinConversation, sendMessage };
}
