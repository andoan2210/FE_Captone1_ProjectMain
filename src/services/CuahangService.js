// Cửa hàng
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/shop-owner/store';

// Tạo một instance axios với interceptor để tự động chèn token
const api = axios.create({
  baseURL: API_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const CuahangService = {
  getStoreStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.warn("Mocking getStoreStats", error.message);
      return { totalProducts: '1,245', totalOrders: '842', totalVouchers: '45', activeStatus: true };
    }
  },

  getStoreInfo: async () => {
    try {
      const response = await api.get('/info');
      return response.data;
    } catch (error) {
      console.warn("Mocking getStoreInfo", error.message);
      return {
        storeId: 'STR-892415',
        name: 'TechStore Official',
        description: 'Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá cả hợp lý nhất thị trường.',
        isActive: true,
        logoUrl: '',
        ownerName: 'Nguyễn Văn Admin',
        createdAt: new Date().toISOString()
      };
    }
  },

  updateStoreInfo: async (storeData) => {
    try {
      const response = await api.put('/info', storeData);
      return response.data;
    } catch (error) {
      console.warn("Mocking updateStoreInfo", error.message);
      return new Promise(resolve => setTimeout(() => resolve({ success: true, data: storeData }), 500));
    }
  },

  uploadStoreLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn("Mocking uploadStoreLogo", error.message);
      // Return a fake URL from the file blob
      return new Promise(resolve => setTimeout(() => resolve({ logoUrl: URL.createObjectURL(file) }), 500));
    }
  },
};
