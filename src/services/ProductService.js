import api from './api';

export const ProductService = {
  // Lấy toàn bộ danh sách sản phẩm
  getAllProducts: async () => {
    const response = await api.get('/api/product');
    return response.data;
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    const response = await api.get(`/api/product/${id}`);
    return response.data;
  },

  // Lưu sản phẩm (Add hoặc Update) chuẩn FormData giống CuaHang
  saveProduct: async (productData, isEdit = false, pendingFiles = []) => {
    const formData = new FormData();
    
    // Append các dữ liệu văn bản vào form data chuẩn tên với DTO bên Backend
    formData.append('productName', productData.name || '');

    // category lúc này đã lưu value là CategoryId do thẻ select quản lý
    formData.append('categoryId', Number(productData.category));

    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    formData.append('isActive', productData.status === 'Đang hoạt động');

    // BE DTO bắt buộc có variants ở top level
    // Append biến thể dạng JSON string
    if (productData.variants) {
      formData.append('variants', JSON.stringify(productData.variants));
    }

    // Backend Controller yêu cầu trường: 'thumbnail' (tối đa 1 ảnh) và 'images' (ảnh phụ)
    if (pendingFiles && pendingFiles.length > 0) {
      formData.append('thumbnail', pendingFiles[0]); // File 1 làm ảnh chính
      for (let i = 1; i < pendingFiles.length; i++) {
         formData.append('images', pendingFiles[i]);
      }
    }

    let response;
    if (isEdit && productData.id) {
      response = await api.patch(`/api/product/${productData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.post('/api/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return response.data;
  },

  // Xóa sản phẩm đơn lẻ
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/product/${id}`);
    return response.data;
  },

  // Xóa hàng loạt
  bulkDeleteProducts: async (ids) => {
    const response = await api.post('/api/product/bulk-delete', { ids });
    return response.data;
  }
};
