import api from "./api";

const chatbotService = {
  /**
   * Gửi câu hỏi cho AI Chatbot
   * POST /api/chatbot/chat
   * @param {string} question
   * @param {Array} conversationHistory - lịch sử hội thoại (Content[] cho Gemini)
   * @returns {{ answer: string, suggestedProducts: Array }}
   */
  sendMessage: async (question, conversationHistory = []) => {
    const res = await api.post("/chatbot/chat", {
      question,
      conversationHistory,
    });
    return res.data;
  },

  /**
   * Lấy lịch sử tin nhắn chatbot của user hiện tại
   * GET /api/chatbot/messages
   * @returns {ChatMessage[]}
   */
  getMessages: async () => {
    const res = await api.get("/chatbot/messages");
    return res.data;
  },

  /**
   * Đồng bộ dữ liệu sản phẩm vào AI (Ingest)
   * GET /api/chatbot/ingest
   */
  ingestData: async () => {
    const res = await api.get("/chatbot/ingest");
    return res.data;
  },

  /**
   * Xóa toàn bộ lịch sử chat của user
   * DELETE /api/chatbot/messages
   */
  clearHistory: async () => {
    const res = await api.delete("/chatbot/messages");
    return res.data;
  },
};

export default chatbotService;
