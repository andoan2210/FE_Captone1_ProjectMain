import api from './api';

const CheckoutService = {
  /**
   * Gọi API preview để lấy thông tin tóm tắt đơn hàng trước khi đặt
   * @param {'CART'|'BUY_NOW'} type
   * @param {object} params - selectedItems | variantId + quantity + voucherCode
   */
  preview: async ({ type, selectedItems, variantId, quantity, voucherCode }) => {
    const body = { type };
    if (type === 'CART') {
      body.selectedItems = selectedItems;
    } else {
      body.variantId = variantId;
      body.quantity = quantity;
    }
    if (voucherCode) body.voucherCode = voucherCode;

    const response = await api.post('/api/order/preview', body);
    return response.data;
  },

  /**
   * Tạo đơn hàng
   * @param {object} orderPayload - toàn bộ CreateOrderDto
   */
  createOrder: async (orderPayload) => {
    const response = await api.post('/api/order', orderPayload);
    return response.data;
  },

  /**
   * Lấy danh sách địa chỉ của user
   */
  getAddresses: async () => {
    const response = await api.get('/api/address');
    return response.data;
  },

  /**
   * Thêm địa chỉ mới
   */
  addAddress: async (data) => {
    const response = await api.post('/api/address', data);
    return response.data;
  },

  /**
   * Cập nhật địa chỉ
   */
  updateAddress: async (id, data) => {
    const response = await api.patch(`/api/address/${id}`, data);
    return response.data;
  },

  /**
   * Xóa địa chỉ
   */
  deleteAddress: async (id) => {
    const response = await api.delete(`/api/address/${id}`);
    return response.data;
  },
};

export default CheckoutService;
