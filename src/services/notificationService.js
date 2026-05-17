import api from "./api";

const notificationService = {
  /**
   * Lấy danh sách thông báo (phân trang cursor-based)
   * GET /api/notification?cursor=&limit=
   */
  getNotifications: async (cursor = null, limit = 20) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const res = await api.get("/notification", { params });
    return res.data; // { data: [...], nextCursor: ... }
  },

  /**
   * Lấy số thông báo chưa đọc
   * GET /api/notification/unread-count
   */
  getUnreadCount: async () => {
    const res = await api.get("/notification/unread-count");
    return res.data; // { unreadCount: number }
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   * PATCH /api/notification/:id/read
   */
  markAsRead: async (notificationId) => {
    const res = await api.patch(`/notification/${notificationId}/read`);
    return res.data;
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * PATCH /api/notification/read-all
   */
  markAllAsRead: async () => {
    const res = await api.patch("/notification/read-all");
    return res.data;
  },

  /**
   * Xóa 1 thông báo
   * DELETE /api/notification/:id
   */
  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/notification/${notificationId}`);
    return res.data;
  },
};

export default notificationService;
