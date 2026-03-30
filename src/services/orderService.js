import api from './api';

// Hàm hỗ trợ format tiền tệ
const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
};

// Hàm hỗ trợ format ngày tháng
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
};

// Ánh xạ trạng thái từ BE sang FE
const mapStatus = (beStatus) => {
  const statusLower = (beStatus || '').toLowerCase();
  const mapping = {
    'pending': { label: 'Chờ xử lý', type: 'pending' },
    'processing': { label: 'Đang xử lý', type: 'pending' },
    'shipping': { label: 'Đang giao', type: 'shipping' },
    'completed': { label: 'Hoàn thành', type: 'completed' },
    'delivered': { label: 'Đã giao', type: 'completed' },
    'cancelled': { label: 'Đã hủy', type: 'cancelled' },
    'refunded': { label: 'Đã hoàn tiền', type: 'cancelled' },
  };
  return mapping[statusLower] || { label: beStatus, type: 'pending' };
};

const orderService = {
  // Lấy danh sách đơn hàng của cửa hàng
  getOrders: async () => {
    try {
      const response = await api.get('/api/order/order-shop');
      const rawOrders = response.data?.data?.order || [];
      
      const mappedData = rawOrders.map(order => {
        const statusInfo = mapStatus(order.orderStatus);
        return {
          id: `#ORD-${order.orderId}`,
          name: order.user?.FullName || 'Khách hàng',
          email: order.user?.Email || '',
          phone: order.user?.Phone || '',
          product: order.products?.join(', ') || 'Chưa có thông tin',
          amount: formatVND(order.totalAmount),
          address: order.address || 'Hệ thống',
          date: formatDateTime(order.createdAt),
          type: statusInfo.type,      
          status: statusInfo.label,   
          payment: order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán',
        };
      });

      return {
        data: mappedData,
        pagination: {
          page: 1,
          total: mappedData.length,
          totalPages: 1,
          hasMore: false,
        }
      };
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/api/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái/thông tin đơn hàng
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.patch(`/api/order/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Xóa đơn hàng
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/api/order/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

export default orderService;
