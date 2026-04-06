import api from './api';

export const CategoryService = {
  // Lấy danh sách danh mục (mặc định lấy nhiều limit)
  getAllCategories: async (limit = 100) => {
    try {
      const response = await api.get(`/api/category?limit=${limit}`);
      const data = response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Lỗi tải danh mục:', err);
      return [];
    }
  }
};
