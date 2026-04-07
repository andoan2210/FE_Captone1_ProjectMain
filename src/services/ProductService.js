import api from './api';

export const ProductService = {
  // Lấy toàn bộ danh sách sản phẩm (Shop owner)
  getMyProducts: async (page = 1, limit = 5) => {
    const response = await api.get('/api/product/my-products', {
      params: { page, limit }
    });
    return response.data;
  },

  // Lấy chi tiết sản phẩm theo ID (Dùng cho trang Detail hoặc Edit)
  getProductById: async (id) => {
    const response = await api.get(`/api/product/detail/${id}`);
    return response.data;
  },

  // Lưu sản phẩm (Add hoặc Update) chuẩn FormData khớp với NestJS Backend
  saveProduct: async (productData, isEdit = false, pendingFiles = [], removeImageIds = []) => {
    const formData = new FormData();
    
    // 1. Map dữ liệu văn bản vào FormData (Khớp với CreateProductDto / UpdateProductDto)
    formData.append('productName', productData.productName || productData.name || '');
    formData.append('categoryId', Number(productData.categoryId || productData.category));
    
    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    // IsActive: Backend nhận boolean
    formData.append('isActive', productData.status === 'Đang hoạt động' || productData.isActive === true);

    // 2. Map Variants (Gửi dưới dạng chuỗi JSON của mảng)
    // Backend ProductVariantInput: { size: string, color?: string, stock: number, price: number }
    if (productData.variants) {
      const normalizedVariants = productData.variants.map(v => ({
        size: v.size || '',
        color: v.color || null,
        stock: Number(v.stock || 0),
        price: Number(v.price || 0)
      }));
      formData.append('variants', JSON.stringify(normalizedVariants));
    }

    // 3. Map Hình ảnh (Khớp với FileFieldsInterceptor)
    // Trường 'thumbnail': tối đa 1 ảnh
    // Trường 'images': tối đa 10 ảnh
    if (pendingFiles && pendingFiles.length > 0) {
      // Giả thiết: File đầu tiên là thumbnail, các file sau là images bổ sung
      formData.append('thumbnail', pendingFiles[0]);
      for (let i = 1; i < pendingFiles.length; i++) {
        formData.append('images', pendingFiles[i]);
      }
    }

    // 4. Map Image IDs cần xóa (Dành cho Update)
    if (isEdit && removeImageIds.length > 0) {
      formData.append('removeImageIds', JSON.stringify(removeImageIds));
    }

    let response;
    if (isEdit && (productData.productId || productData.id)) {
      const id = productData.productId || productData.id;
      response = await api.patch(`/api/product/${id}`, formData, {
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

  // Xóa hàng loạt (Nếu backend hỗ trợ, hiện tại map theo ID lẻ)
  bulkDeleteProducts: async (ids) => {
    // Vì backend chưa có bulk-delete, ta có thể lặp qua từng cái hoặc đợi BE cập nhật
    const results = await Promise.all(ids.map(id => api.delete(`/api/product/${id}`)));
    return results.map(r => r.data);
  },

  // Lấy danh sách sản phẩm theo shopId
  getProductShop: async (shopId, limit = 10) => {
    const response = await api.get(`/api/product/product-shop/${shopId}`, {
      params: { limit }
    });
    return response.data;
  }
};
