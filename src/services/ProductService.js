// Dịch vụ quản lý sản phẩm
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const API_PREFIX = '/api/shop-owner/products';


// Tạo một instance axios với interceptor để tự động chèn token (Giống CuahangService)
const api = axios.create({
  baseURL: API_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEFAULT_PRODUCTS = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max 256GB', 
    sku: 'APP-IP15PM-256', 
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&h=100&fit=crop'], 
    category: 'Điện thoại', 
    price: '28.990.000', 
    stock: 42, 
    status: 'Đang hoạt động', 
    updatedAt: '20/05/2024',
    variants: [
      { id: 101, size: '256GB', color: 'Titan Tự Nhiên', stock: 20, price: '28990000' },
      { id: 102, size: '256GB', color: 'Xanh Titan', stock: 22, price: '28990000' }
    ]
  },
  { 
    id: 2, 
    name: 'Tai nghe Sony WH-1000XM5', 
    sku: 'SNY-WH1000XM5-B', 
    images: ['https://images.unsplash.com/photo-1678253106197-03613725b7a7?w=100&h=100&fit=crop'], 
    category: 'Phụ kiện', 
    price: '8.490.000', 
    stock: 3, 
    status: 'Đang hoạt động', 
    updatedAt: '18/05/2024',
    variants: [
      { id: 201, size: 'Tiêu chuẩn', color: 'Đen', stock: 3, price: '8490000' }
    ]
  },
  { 
    id: 3, 
    name: 'Giày Nike Air Max 270', 
    sku: 'NKE-AM270-W', 
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'], 
    category: 'Thời trang', 
    price: '3.500.000', 
    stock: 120, 
    status: 'Tạm ẩn', 
    updatedAt: '15/05/2024',
    variants: [
      { id: 301, size: '42', color: 'Trắng/Đỏ', stock: 60, price: '3500000' },
      { id: 302, size: '43', color: 'Trắng/Đỏ', stock: 60, price: '3500000' }
    ]
  }
];

export const ProductService = {
  // Lấy toàn bộ danh sách
  getAllProducts: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.warn("Mocking getAllProducts", error.message);
      const saved = localStorage.getItem('products_mock');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.warn("Mocking getProductById", error.message);
      const products = await ProductService.getAllProducts();
      return products.find(p => String(p.id) === String(id));
    }
  },

  // Lưu sản phẩm (Add hoặc Update)
  saveProduct: async (productData, isEdit = false) => {
    try {
      let response;
      if (isEdit && productData.id) {
        response = await api.put(`/${productData.id}`, productData);
      } else {
        response = await api.post('/', productData);
      }
      return response.data;
    } catch (error) {
      console.warn("Mocking saveProduct", error.message);
      const products = await ProductService.getAllProducts();
      let updatedProducts = [...products];

      if (isEdit && productData.id) {
        updatedProducts = products.map(p => String(p.id) === String(productData.id) ? {
          ...p,
          ...productData,
          price: productData.variants && productData.variants.length > 0 ? productData.variants[0].price : (productData.price || p.price),
          stock: productData.variants && productData.variants.length > 0 ? productData.variants.reduce((sum, v) => sum + Number(v.stock), 0) : (productData.stock || p.stock),
          updatedAt: new Date().toLocaleDateString('vi-VN')
        } : p);
      } else {
        const newProduct = {
          ...productData,
          id: Date.now(),
          sku: productData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
          price: productData.variants && productData.variants.length > 0 ? productData.variants[0].price : (productData.price || '0'),
          stock: productData.variants && productData.variants.length > 0 ? productData.variants.reduce((sum, v) => sum + Number(v.stock), 0) : (productData.stock || 0),
          updatedAt: new Date().toLocaleDateString('vi-VN'),
          images: productData.images || []
        };
        updatedProducts.unshift(newProduct);
      }
      localStorage.setItem('products_mock', JSON.stringify(updatedProducts));
      return { success: true, data: updatedProducts };
    }
  },

  // Xóa sản phẩm đơn lẻ
  deleteProduct: async (id) => {
    try {
      await api.delete(`/${id}`);
      return { success: true };
    } catch (error) {
      console.warn("Mocking deleteProduct", error.message);
      const products = await ProductService.getAllProducts();
      const updatedProducts = products.filter(p => String(p.id) !== String(id));
      localStorage.setItem('products_mock', JSON.stringify(updatedProducts));
      return { success: true };
    }
  },

  // Xóa hàng loạt
  bulkDeleteProducts: async (ids) => {
    try {
      await api.post('/bulk-delete', { ids });
      return { success: true };
    } catch (error) {
      console.warn("Mocking bulkDeleteProducts", error.message);
      const products = await ProductService.getAllProducts();
      const updatedProducts = products.filter(p => !ids.includes(p.id));
      localStorage.setItem('products_mock', JSON.stringify(updatedProducts));
      return { success: true };
    }
  },

  // Tải ảnh lên Server
  uploadProductImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        if (file instanceof File) {
          formData.append('files', file);
        }
      });
      
      if (formData.getAll('files').length === 0) return [];

      const response = await api.post('/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.urls;
    } catch (error) {
      console.warn("Mocking uploadProductImages", error.message);
      return files.map(file => file instanceof File ? URL.createObjectURL(file) : file);
    }
  }
};
