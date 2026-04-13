import api from './api';

export const VoucherService = {
  getAllVouchers: async (params = {}) => {
    const res = await api.get('/voucher/my/list', { params });
    return res.data; // Back-end returns { message, data: { items: [], pagination: {} } }
  },

  saveVoucher: async (data, isEdit = false, id = null) => {
    if (isEdit && id) {
      return (await api.patch(`/voucher/${id}`, data)).data;
    }
    return (await api.post('/voucher', data)).data;
  },

  deleteVoucher: async (id) => {
    return (await api.delete(`/voucher/${id}`)).data;
  },

  getVoucherStats: async (filters = {}) => {
    try {
      const { status, search } = filters;
      // Gọi API với limit 100 thay vì 1000 để tránh lỗi 400 Bad Request từ giới hạn quá lớn của server
      const resData = await VoucherService.getAllVouchers({ page: 1, limit: 100, status, search });
      const items = resData?.data?.items || [];
      const totalVouchers = resData?.data?.pagination?.totalItems || items.length;
      
      const now = new Date();
      const expiringThisMonth = items.filter(v => {
          if (!v.expiredDate) return false;
          const d = new Date(v.expiredDate);
          return d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear();
      }).length;
      
      const active = items.filter(v => v.isActive).length;
      
      return {
          totalVouchers,
          active,
          usedCount: 0, // Should be calculated if backend returns usage
          expiringThisMonth
      };
    } catch (error) {
      console.error("Lỗi khi lấy Voucher Stats:", error);
      return {
          totalVouchers: 0,
          active: 0,
          usedCount: 0,
          expiringThisMonth: 0
      };
    }
  }
};
