import api from "./api";

export const TryonService = {
  /**
   * Gọi API thử đồ AI
   * @param {File} file - File ảnh người dùng
   * @param {number} productId - ID của sản phẩm để thử
   * @param {string} thumbnailUrl - URL thumbnail của sản phẩm
   * @param {Array} productIds - Danh sách tất cả ProductID
   * @returns {Object} { imageUrl: string }
   */
  tryon: async (file, productId, thumbnailUrl, productIds = []) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    // Gửi thumbnail URL của sản phẩm
    if (thumbnailUrl) {
      formData.append("thumbnailUrl", thumbnailUrl);
    }

    // Gửi danh sách tất cả ProductID
    if (productIds && productIds.length > 0) {
      formData.append("productIds", JSON.stringify(productIds));
    }

    // Debug log
    console.log("🚀 Tryon API Request:", {
      productId,
      thumbnailUrl,
      productIdsCount: productIds.length,
    });

    const response = await api.post("/tryon/try", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Lấy lịch sử thử đồ
   * @param {number} page - Số trang (mặc định 1)
   * @param {number} limit - Số lượng items mỗi trang (mặc định 10)
   * @returns {Object} { data: Array, meta: { total, page, limit, totalPages } }
   */
  getTryonHistory: async (page = 1, limit = 10) => {
    const response = await api.get("/tryon/history-tryon", {
      params: { page, limit },
    });
    return response.data;
  },
};

export default TryonService;
