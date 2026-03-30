import api from './api';

export const getProductById = (id) => {
  return api.get(`/api/product/detail/${id}`);
};

export const getCategories = (limit = 100) => {
  return api.get(`/api/category?limit=${limit}`);
};

export const getProductsByCategory = (categoryId, page = 1, limit = 5) => {
  return api.get(`/api/product/category-product?categoryId=${categoryId}&page=${page}&limit=${limit}`);
};
