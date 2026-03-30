import api from './api';

const API_URL = '/api/cart';

export const getCart = () => {
  return api.get(API_URL);
};

export const addToCart = (variantId, quantity) => {
  return api.post(`${API_URL}/add-to-cart`, { variantId, quantity });
};

export const updateCartItem = (cartItemId, quantity) => {
  return api.patch(`${API_URL}/${cartItemId}`, { quantity });
};

export const removeCartItem = (cartItemId) => {
  return api.delete(`${API_URL}/${cartItemId}`);
};