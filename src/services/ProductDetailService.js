import axios from 'axios';

const API_URL = '/api'

export const getProductById = (id) => {
  return axios.get(`${API_URL}/product/${id}`);
};
