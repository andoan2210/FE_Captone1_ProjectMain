import api from './api';

const userService = {
  // --- AUTH SECTION ---
  
  // Đăng ký tài khoản mới
  register: async (name, email, password) => {
    try {
      const response = await api.post('/users', { name, email, password });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { username: email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Làm mới token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  // --- USER PROFILE SECTION ---

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

  // Cập nhật hồ sơ người dùng (Hỗ trợ avatar qua FormData)
  updateUserProfile: async (updateData, avatarFile = null) => {
    try {
      const formData = new FormData();
      
      // Thêm các trường text vào FormData
      if (updateData.fullName) formData.append('fullName', updateData.fullName);
      if (updateData.phone) formData.append('phone', updateData.phone);
      if (updateData.dateOfBirth) {
        // Chuyển về định dạng YYYY-MM-DD nếu là đối tượng Date hoặc string
        const dob = updateData.dateOfBirth instanceof Date 
          ? updateData.dateOfBirth.toISOString().split('T')[0] 
          : updateData.dateOfBirth;
        formData.append('dateOfBirth', dob);
      }
      if (updateData.gender) formData.append('gender', updateData.gender);
      
      // Thêm file avatar nếu có
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.patch('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Đổi mật khẩu (khi đã đăng nhập)
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/users/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // --- ACCOUNT VERIFICATION & RECOVERY ---

  // Quên mật khẩu - Gửi mã xác nhận
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error forgot password request:', error);
      throw error;
    }
  },

  // Xác nhận mã quên mật khẩu
  verifyForgotPasswordCode: async (email, code) => {
    try {
      const response = await api.post('/users/verify-forgot-password-code', { email, code });
      return response.data;
    } catch (error) {
      console.error('Error verifying forgot password code:', error);
      throw error;
    }
  },

  // Thay đổi mật khẩu mới (sau khi xác nhận mã)
  changeForgotPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/users/change-forgot-password', { email, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing forgot password:', error);
      throw error;
    }
  },

  // Xác thực email đăng ký
  verifyEmail: async (email, code) => {
    try {
      const response = await api.post('/users/verify-email', { email, code });
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  // Gửi lại mã xác thực
  resendVerificationCode: async (email) => {
    try {
      const response = await api.post('/users/resend-code', { email });
      return response.data;
    } catch (error) {
      console.error('Error resending verification code:', error);
      throw error;
    }
  },

  // --- ADDRESS SECTION ---

  getAddresses: async () => {
    try {
      const response = await api.get('/address');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await api.post('/address', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async (id, addressData) => {
    try {
      const response = await api.patch(`/address/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (id) => {
    try {
      const response = await api.delete(`/address/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // --- PAYMENT SECTION ---

  addPayment: async (paymentData) => {
    try {
      const response = await api.post('/payment-method', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  getPayments: async () => {
    try {
      const response = await api.get('/payment-method');
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  deletePayment: async (id) => {
    try {
      const response = await api.delete(`/payment-method/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

export default userService;
