import api from './api';

export const CategoryService = {
  // Lấy danh sách danh mục (mặc định lấy nhiều limit)
  getAllCategories: async (limit = 100) => {
    const response = await api.get(`/api/category?limit=${limit}`);
    return response.data;
  }
};
