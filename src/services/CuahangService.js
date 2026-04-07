import api from './api';

export const CuahangService = {
  getMyStore: async () => {
    const response = await api.get('/api/store/me');
    return response.data;
  },

  updateMyStore: async (dto, logo) => {
    const formData = new FormData();
    if (dto.storeName) formData.append('storeName', dto.storeName);
    if (logo) formData.append('logo', logo);
    if (dto.description !== undefined) formData.append('description', dto.description);

    const response = await api.patch('/api/store/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getTopStores: async (limit = 5) => {
    const response = await api.get('/api/store/top-store', { params: { limit } });
    return response.data;
  },

  getStoreByProduct: async (productId) => {
    const response = await api.get(`/api/store/getshopbyproduct/${productId}`);
    return response.data;
  },
};