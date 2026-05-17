import api from "./api";

const chatService = {
  /**
   * Bắt đầu cuộc trò chuyện với shop
   * POST /api/chat/start-chat
   * @param {number} shopId
   * @returns {{ ConversationId: number }}
   */
  startChat: async (shopId) => {
    const res = await api.post("/chat/start-chat", { shopId });
    return res.data;
  },

  /**
   * Lấy danh sách cuộc trò chuyện của user hiện tại
   * GET /api/chat/list-conversations
   */
  getConversations: async () => {
    const res = await api.get("/chat/list-conversations");
    return res.data;
  },

  /**
   * Lấy tin nhắn của một cuộc trò chuyện (có phân trang cursor)
   * GET /api/chat/messages/:conversationId?cursor=&limit=
   * @param {number} conversationId
   * @param {number|null} cursor
   * @param {number} limit
   */
  getMessages: async (conversationId, cursor = null, limit = 6) => {
    const params = { limit };
    if (cursor) params.cursor = cursor;
    const res = await api.get(`/chat/messages/${conversationId}`, {
      params,
    });
    return res.data; // { data: [...], nextCursor: ... }
  },

  /**
   * Tải lên hình ảnh trong đoạn hội thoại
   * POST /api/chat/upload
   * @param {File} file
   * @returns {{ imageUrl: string }}
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("chatimage", file); 
    const res = await api.post("/chat/send-image", formData); 
    return { imageUrl: res.data.url }; 
  },
};

export default chatService;
