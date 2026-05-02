import api from './api';
import InvoiceService from './InvoiceService';

const API_URL = '/order';

/**
 * InvoiceDetailService
 * ─ Nếu orderId là số (đơn thật từ backend) → gọi real API trước
 * ─ Nếu API lỗi hoặc orderId là chuỗi mock (ORD...) → fallback mock
 */
const InvoiceDetailService = {

  /**
   * Lấy chi tiết đơn hàng
   * Backend: GET /order/order-detail/:orderId
   */
  getOrderDetail: async (orderId) => {
    const isNumericId = orderId && !isNaN(Number(orderId));

    // Nếu là ID số → thử real API
    if (isNumericId) {
      try {
        const response = await api.get(`${API_URL}/order-detail/${orderId}`);
        const raw = response.data?.data || response.data;
        return { success: true, data: raw };
      } catch (error) {
        console.warn('[InvoiceDetailService] Real API failed, trying mock fallback:', error.message);
      }
    }

    // Fallback: tìm trong mock data
    return InvoiceService.getMockInvoiceById(orderId);
  },

  /**
   * Hủy đơn hàng
   * Backend: PATCH /order/cancel-order/:orderId
   */
  cancelOrder: async (orderId) => {
    const isNumericId = orderId && !isNaN(Number(orderId));

    if (isNumericId) {
      try {
        const response = await api.patch(`${API_URL}/cancel-order/${orderId}`);
        return {
          success: true,
          data: response.data,
          message: response.data?.message || 'Hủy đơn hàng thành công',
        };
      } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Không thể hủy đơn hàng';
        console.warn('[InvoiceDetailService] cancelOrder API error:', msg);
        return { success: false, error: msg };
      }
    }

    // Fallback mock cancel
    return InvoiceService.cancelOrder(orderId);
  },
};

export default InvoiceDetailService;
export { InvoiceDetailService };
