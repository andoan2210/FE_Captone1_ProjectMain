import axios from "axios";

const API_URL = "/api";

export const getCategories = (limit = 5) => {
  return axios.get(`${API_URL}/category?limit=${limit}`);
};

export const getNewProducts = (limit = 10) => {
  return axios.get(`${API_URL}/product/new?limit=${limit}`);
};

export const getBestSellerProducts = (limit = 8) => {
  return axios.get(`${API_URL}/product/best-seller?limit=${limit}`);
};

export const getProductsByCategory = (categoryId, page = 1, limit = 8) => {
  return axios.get(
    `${API_URL}/product/category-product?categoryId=${categoryId}&page=${page}&limit=${limit}`
  );
};

export const getTopStores = (limit = 5) => {
  return axios.get(`${API_URL}/store/top-store?limit=${limit}`);
};

export const getTopVouchers = (limit = 5) => {
  return axios.get(`${API_URL}/voucher/top-voucher?limit=${limit}`);
};