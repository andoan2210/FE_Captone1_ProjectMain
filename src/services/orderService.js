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
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/order/order-shop');
      let rawOrders = response.data?.data?.order || [];
      
      // Client-side Filtering
      if (params.search) {
        const query = params.search.toLowerCase();
        rawOrders = rawOrders.filter(o => 
          o.orderId.toString().includes(query) || 
          (o.user?.FullName || '').toLowerCase().includes(query) ||
          (o.products || []).some(p => p.toLowerCase().includes(query))
        );
      }

      if (params.status) {
        rawOrders = rawOrders.filter(o => o.orderStatus?.toLowerCase() === params.status.toLowerCase() || mapStatus(o.orderStatus).type === params.status);
      }

      if (params.payment) {
        const isPaid = params.payment === 'paid';
        rawOrders = rawOrders.filter(o => isPaid ? o.paymentStatus === 'PAID' : o.paymentStatus !== 'PAID');
      }

      if (params.startDate) {
        const start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        rawOrders = rawOrders.filter(o => new Date(o.createdAt) >= start);
      }

      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        rawOrders = rawOrders.filter(o => new Date(o.createdAt) <= end);
      }

      // Pagination setup 
      const total = rawOrders.length;
      const page = params.page || 1;
      const limit = params.limit || 8;
      const startIndex = (page - 1) * limit;
      const paginatedOrders = rawOrders.slice(startIndex, startIndex + limit);
      
      const mappedData = paginatedOrders.map(order => {
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
          page: page,
          total: total,
          totalPages: Math.ceil(total / limit),
          hasMore: startIndex + limit < total,
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
