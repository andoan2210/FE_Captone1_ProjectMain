import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import notificationService from "../services/notificationService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

/**
 * Custom hook quản lý thông báo real-time
 * - Kết nối WebSocket namespace /notifications
 * - Tự động fetch unread count khi mount
 * - Lắng nghe event newNotification để cập nhật real-time
 */
export function useNotification() {
  const socketRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch unread count lần đầu
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("[Notification] Lỗi lấy unread count:", err);
    }
  }, []);

  // Fetch danh sách notifications
  const fetchNotifications = useCallback(async (cursor = null) => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(cursor, 10);
      if (cursor) {
        setNotifications((prev) => [...prev, ...data.data]);
      } else {
        setNotifications(data.data);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("[Notification] Lỗi lấy notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load thêm (phân trang)
  const loadMore = useCallback(() => {
    if (nextCursor && !loading) {
      fetchNotifications(nextCursor);
    }
  }, [nextCursor, loading, fetchNotifications]);

  // Đánh dấu đã đọc 1 thông báo
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.NotificationId === notificationId ? { ...n, IsRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[Notification] Lỗi markAsRead:", err);
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, IsRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("[Notification] Lỗi markAllAsRead:", err);
    }
  }, []);

  // Xóa thông báo
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deleted = notifications.find((n) => n.NotificationId === notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.NotificationId !== notificationId)
      );
      if (deleted && !deleted.IsRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("[Notification] Lỗi deleteNotification:", err);
    }
  }, [notifications]);

  // Kết nối WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("[Notification WS] Initializing connection...");
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Notification WS] Connected:", socket.id);
    });

    socket.on("newNotification", (notification) => {
      console.log("[Notification WS] New notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("error", (errMsg) => {
      console.warn("[Notification WS] Error:", errMsg);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Notification WS] Disconnected:", reason);
    });

    // Fetch unread count khi kết nối
    fetchUnreadCount();

    return () => {
      console.log("[Notification WS] Cleaning up...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    unreadCount,
    notifications,
    loading,
    nextCursor,
    fetchNotifications,
    fetchUnreadCount,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
