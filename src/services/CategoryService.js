import api from './api';

export const CategoryService = {
  // Lấy danh sách danh mục (mặc định lấy nhiều limit)
  getAllCategories: async (limit = 100) => {
    const response = await api.get(`/category?limit=${limit}`);
    return response.data;
  },

  getAllCategoriesAdmin: async () => {
    const response = await api.get('/category/admin/all');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/category', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/category/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
  }
};
