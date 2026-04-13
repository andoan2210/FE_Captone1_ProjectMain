import api from './api';

const API_URL = '/cart';

// Lấy giỏ hàng của user đang đăng nhập (có đầy đủ thông tin sản phẩm)
export const getCart = () => {
  return api.get(`${API_URL}/my-cart`);
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = (variantId, quantity) => {
  return api.post(`${API_URL}/add-to-cart`, { variantId, quantity });
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = (cartItemId, quantity) => {
  return api.patch(`${API_URL}/update-item/${cartItemId}`, { quantity });
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeCartItem = (cartItemId) => {
  return api.delete(`${API_URL}/remove-item/${cartItemId}`);
};