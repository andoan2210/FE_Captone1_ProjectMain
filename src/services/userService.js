import api from './api';

const userService = {
  // Lấy thông tin hồ sơ người dùng
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Cập nhật hồ sơ người dùng
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Quản lý địa chỉ
  getAddresses: async () => {
    try {
      const response = await api.get('/address');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  addAddress: async (address) => {
    try {
      const response = await api.post('/address', address);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async (id, address) => {
    try {
      const response = await api.patch(`/address/${id}`, address);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/address/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Quản lý phương thức thanh toán
  addPayment: async (payment) => {
    try {
      const response = await api.post('/users/payments', payment);
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  deletePayment: async (paymentId) => {
    try {
      const response = await api.delete(`/users/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

export default userService;
