import api from './api';

const CheckoutService = {
  /**
   * Gọi API preview để lấy thông tin tóm tắt đơn hàng trước khi đặt
   * @param {'CART'|'BUY_NOW'} type
   * @param {object} params - selectedItems | variantId + quantity + voucherCode
   */
  preview: async ({ type, selectedItems, variantId, quantity, voucherCode, storeVouchers }) => {
    const body = { type };
    if (type === 'CART') {
      body.selectedItems = selectedItems;
    } else {
      body.variantId = variantId;
      body.quantity = quantity;
    }
    if (voucherCode) body.voucherCode = voucherCode;
    if (storeVouchers) body.storeVouchers = storeVouchers;


    const response = await api.post('/order/preview', body);

    return response.data;
  },

  /**
   * Tạo đơn hàng
   * @param {object} orderPayload - toàn bộ CreateOrderDto
   */
  createOrder: async (orderPayload) => {
    // orderPayload đã bao gồm storeVouchers từ component gửi sang
    const response = await api.post('/order', orderPayload);

    return response.data;
  },

  /**
   * Lấy danh sách địa chỉ của user
   */
  getAddresses: async () => {

    const response = await api.get('/address');

    return response.data;
  },

  /**
   * Thêm địa chỉ mới
   */
  addAddress: async (data) => {

    const response = await api.post('/address', data);

    return response.data;
  },

  /**
   * Cập nhật địa chỉ
   */
  updateAddress: async (id, data) => {

    const response = await api.patch(`/address/${id}`, data);

    return response.data;
  },

  /**
   * Xóa địa chỉ
   */
  deleteAddress: async (id) => {

    const response = await api.delete(`/address/${id}`);

    return response.data;
  },

  /**
   * Lấy danh sách voucher đang hoạt động của 1 store (public)
   * @param {number} storeId
   */
  getVouchersByStore: async (storeId) => {
    const response = await api.get(`/voucher/store/${storeId}`);
    return response.data;
  },
};

export default CheckoutService;
