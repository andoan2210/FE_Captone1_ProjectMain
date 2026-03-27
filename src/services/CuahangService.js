// Cửa hàng
import axios from 'axios';

// Dùng /api prefix để request đi qua Vite proxy → http://localhost:8080
// Tránh CORS vì browser không cho phép gọi thẳng cross-origin
const api = axios.create({
  baseURL: '/api/store',
});

// Tự động gắn Bearer token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const CuahangService = {
  /**
   * GET /store/me
   * Lấy thông tin cửa hàng của người dùng đang đăng nhập (Shop Owner).
   * BE trả về: { message, data: { storeId, ownerId, storeName, description, logoUrl, isActive, isDeleted, createdAt } }
   */
  getMyStore: async () => {
    const response = await api.get('/me');
    return response.data; // { message, data: {...} }
  },

  /**
   * PATCH /store/me  (multipart/form-data)
   * Cập nhật thông tin cửa hàng.
   * @param {object} dto   - { storeName?, description? }
   * @param {File}   logo  - File ảnh logo (tùy chọn)
   * BE trả về: { message: 'Update store information successfully' }
   */
  updateMyStore: async (dto, logo) => {
    const formData = new FormData();

    if (dto.storeName) formData.append('storeName', dto.storeName);
    if (dto.description !== undefined) formData.append('description', dto.description);
    if (logo) formData.append('logo', logo);

    const response = await api.patch('/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { message }
  },

  /**
   * GET /store/top-store?limit=N
   * Lấy danh sách cửa hàng bán chạy nhất.
   * BE trả về: [{ id, name, logo, sold }]
   */
  getTopStores: async (limit = 5) => {
    const response = await api.get('/top-store', { params: { limit } });
    return response.data;
  },
};