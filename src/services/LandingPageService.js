import api from "./api";

export const getCategories = (limit = 5) => {
  return api.get(`/api/category?limit=${limit}`);
};

export const getNewProducts = (limit = 10) => {
  return api.get(`/api/product/new?limit=${limit}`);
};

export const getBestSellerProducts = (limit = 8) => {
  return api.get(`/api/product/best-seller?limit=${limit}`);
};

export const getProductsByCategory = (categoryId, page = 1, limit = 8) => {
  return api.get(`/api/product/category-product?categoryId=${categoryId}&page=${page}&limit=${limit}`);
};

export const getTopStores = (limit = 5) => {
  return api.get(`/api/store/top-store?limit=${limit}`);
};

export const getTopVouchers = (limit = 5) => {
  return api.get(`/api/voucher/top-voucher?limit=${limit}`);
};