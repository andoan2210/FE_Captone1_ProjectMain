import api from './api';

export const ProductService = {
  // Lấy toàn bộ danh sách sản phẩm (sử dụng API GET /product/my-products)
  getAllProducts: async () => {
    try {
      const response = await api.get('/api/product/my-products');
      const dataList = response.data?.data || [];
      
      // Map dữ liệu từ Backend sang format Frontend hiển thị
      return dataList.map(item => ({
        id: item.productId,
        name: item.productName,
        sku: 'SP-' + item.productId,
        category: item.category ? item.category.categoryName : 'Khác',
        price: item.price,
        stock: item.stock || 0,
        status: item.isActive ? 'Đang hoạt động' : 'Tạm ẩn',
        updatedAt: new Date(item.updatedAt || item.createdAt).toLocaleDateString('vi-VN'),
        image: item.thumbnailUrl
      }));
    } catch (error) {
      console.error('Lỗi khi tải getAllProducts:', error);
      return [];
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/product/detail/${id}`);
      const item = response.data; // Server trả về object thẳng không bọc trong data theo src/product/product.service.ts
      
      if (!item) return null;

      return {
        id: item.id,
        name: item.name,
        sku: 'SP-' + item.id,
        category: item.categoryName || '', 
        price: item.price,
        stock: item.variants ? item.variants.reduce((sum, v) => sum + Number(v.stock), 0) : 0,
        status: 'Đang hoạt động',
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        image: item.thumbnail,
        images: [item.thumbnail, ...(item.images || [])], // Gom chung để hiển thị form
        variants: item.variants ? item.variants.map(v => ({
          id: v.variantId,
          size: v.size,
          color: v.color || '',
          stock: v.stock,
          price: v.price
        })) : []
      };
    } catch (error) {
      console.error('Lỗi khi thiết lập getProductById:', error);
      throw error;
    }
  },

  // Lưu sản phẩm (Add hoặc Update) - POST /product hoặc PATCH /product/id
  saveProduct: async (productData, isEdit = false, pendingFiles = []) => {
    const formData = new FormData();
    
    formData.append('productName', productData.name || '');
    
    // Đảm bảo categoryId phải là số nguyên theo Backend DTO
    if (productData.category) {
      formData.append('categoryId', Number(productData.category));
    }

    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    // Phải là boolean: formData khi append sẽ thành string 'true' / 'false'. DTO backend dùng @Transform xử lý string
    formData.append('isActive', productData.status === 'Đang hoạt động');

    if (productData.variants) {
      const mappedVariants = productData.variants.map(v => ({
        size: v.size,
        color: v.color || null,
        stock: Number(v.stock),
        price: Number(v.price)
      }));
      formData.append('variants', JSON.stringify(mappedVariants));
    }

    if (pendingFiles && pendingFiles.length > 0) {
      formData.append('thumbnail', pendingFiles[0]); // File 1 làm ảnh chính
      // Nếu có nhiều hơn 1 file, các file còn lại là hình phụ
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

  // Xóa sản phẩm đơn lẻ - DELETE /product/id
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/product/${id}`);
    return response.data;
  },

  // Xóa hàng loạt
  bulkDeleteProducts: async (ids) => {
    // Do Backend không có API Xoá hàng loạt, Frontend gọi Promise xoá từng mục
    await Promise.all(ids.map(id => api.delete(`/api/product/${id}`)));
    return { success: true };
  }
};
