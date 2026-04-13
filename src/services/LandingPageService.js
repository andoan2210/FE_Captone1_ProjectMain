import api from "./api";

export const getCategories = (limit = 5) => {
  return api.get(`/category?limit=${limit}`);
};

export const getNewProducts = (limit = 10) => {
  return api.get(`/product/new?limit=${limit}`);
};

export const getBestSellerProducts = (limit = 8) => {
  return api.get(`/product/best-seller?limit=${limit}`);
};

export const getProductsByCategory = (categoryId, page = 1, limit = 8) => {
  return api.get(`/product/category-product?categoryId=${categoryId}&page=${page}&limit=${limit}`);
};

export const getCategoryByParent = (parentId, limit = 10) => {
  return api.get(`/category/parent-category?parentId=${parentId}&limit=${limit}`);
};

export const getTopStores = (limit = 5) => {
  return api.get(`/store/top-store?limit=${limit}`);
};

export const getTopVouchers = (limit = 5) => {
  return api.get(`/voucher/top-voucher?limit=${limit}`);
};