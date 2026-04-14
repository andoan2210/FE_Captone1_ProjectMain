import api from "./api";

export const ShopProductService = {
  // Lấy toàn bộ danh sách sản phẩm (Shop owner)
  getMyProducts: async (page = 1, limit = 5) => {
    const response = await api.get("/product/my-products", {
      params: { page, limit },
    });
    return response.data;
  },

  // Lấy chi tiết sản phẩm theo ID (Dùng cho trang Detail hoặc Edit)
  getProductById: async (id) => {
    const response = await api.get(`/product/detail/${id}`);
    return response.data;
  },

  // Lưu sản phẩm (Add hoặc Update) chuẩn FormData khớp với NestJS Backend
  saveProduct: async (
    productData,
    isEdit = false,
    pendingFiles = [],
    removeImageIds = [],
    thumbnailFile = null,
  ) => {
    const formData = new FormData();

    // 📝 DEBUG: Log incoming parameters
    console.log("🔍 saveProduct called with:", {
      isEdit,
      pendingFilesCount: pendingFiles.length,
      removeImageIdsCount: removeImageIds.length,
      hasThumbnailFile: !!thumbnailFile,
      productName: productData.productName || productData.name,
    });

    // 1. Map dữ liệu văn bản vào FormData (Khớp với CreateProductDto / UpdateProductDto)
    formData.append(
      "productName",
      productData.productName || productData.name || "",
    );
    formData.append(
      "categoryId",
      Number(productData.categoryId || productData.category),
    );

    if (productData.description) {
      formData.append("description", productData.description);
    }

    // IsActive: Backend nhận boolean
    formData.append(
      "isActive",
      productData.status === "Đang hoạt động" || productData.isActive === true,
    );

    // 2. Map Variants (Gửi dưới dạng chuỗi JSON của mảng)
    // Backend ProductVariantInput: { size: string, color?: string, stock: number, price: number }
    if (productData.variants) {
      const normalizedVariants = productData.variants.map((v) => ({
        size: v.size || "",
        color: v.color || null,
        stock: Number(v.stock || 0),
        price: Number(v.price || 0),
      }));
      formData.append("variants", JSON.stringify(normalizedVariants));
    }

    // 3. Map Hình ảnh RIÊNG BIỆT (✅ FIX: Thumbnail riêng, Images riêng)
    // Trường 'thumbnail': tối đa 1 ảnh - CHỈ gửi nếu user upload thumbnail mới
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    // Trường 'images': tối đa 10 ảnh - Các ảnh phụ khác (không touch thumbnail)
    if (pendingFiles && pendingFiles.length > 0) {
      pendingFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    // 4. Map Image IDs cần xóa (Dành cho Update)
    if (isEdit && removeImageIds.length > 0) {
      formData.append("removeImageIds", JSON.stringify(removeImageIds));
    }

    // 📝 DEBUG: Log FormData content
    console.log("📦 FormData ready to send:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `  ${key}:`,
        value instanceof File ? `File(${value.name}, ${value.size}B)` : value,
      );
    }

    let response;
    if (isEdit && (productData.productId || productData.id)) {
      const id = productData.productId || productData.id;
      console.log("📤 PATCH request to:", `/product/${id}`);
      response = await api.patch(`/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      console.log("📤 POST request to:", `/product`);
      response = await api.post("/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    console.log("✅ API Response:", response.data);
    return response.data;
  },

  // Xóa sản phẩm đơn lẻ
  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  // Xóa hàng loạt (Nếu backend hỗ trợ, hiện tại map theo ID lẻ)
  bulkDeleteProducts: async (ids) => {
    // Vì backend chưa có bulk-delete, ta có thể lặp qua từng cái hoặc đợi BE cập nhật
    const results = await Promise.all(
      ids.map((id) => api.delete(`/product/${id}`)),
    );
    return results.map((r) => r.data);
  },

  // Lấy danh sách sản phẩm theo shopId
  getProductShop: async (shopId, limit = 10) => {
    const response = await api.get(`/product/product-shop/${shopId}`, {
      params: { limit },
    });
    return response.data;
  },

  // ✅ Delete individual product image
  deleteProductImage: async (imageId) => {
    const response = await api.delete(`/product/images/${imageId}`);
    return response.data;
  },

  // 🔍 Tìm kiếm sản phẩm
  searchProducts: async (searchParams) => {
    const response = await api.get("/product/search", {
      params: searchParams,
    });
    return response.data;
  },

  // ✨ Lấy gợi ý từ khóa
  getSuggestions: async (keyword) => {
    if (!keyword || keyword.trim() === "") return [];
    const response = await api.get("/product/suggestions", {
      params: { keyword },
    });
    return response.data;
  },
};
