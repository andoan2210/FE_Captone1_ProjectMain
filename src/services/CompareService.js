import api from "./api";

const normalizeProduct = (raw) => {
  if (!raw) return null;

  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);

  return {
    id: raw.id ?? raw.productId,
    name: raw.name ?? raw.productName ?? "Sản phẩm",
    price: Number(raw.price || 0),
    thumbnail: raw.thumbnail ?? raw.thumbnailUrl ?? "",
    categoryName: raw.categoryName ?? "Đang cập nhật",
    sold: Number(raw.sold || 0),
    description: raw.description ?? "",
    variants,
    sizes,
    colors,
    totalStock,
  };
};

const pickProductArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.data,
    payload.items,
    payload.results,
    payload.products,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
    if (item && typeof item === "object") {
      if (Array.isArray(item.data)) return item.data;
      if (Array.isArray(item.items)) return item.items;
      if (Array.isArray(item.results)) return item.results;
      if (Array.isArray(item.products)) return item.products;
    }
  }
  return [];
};

export const CompareService = {
  // Tìm kiếm sản phẩm cho trang so sánh
  // Khi BE rebuild xong, đổi sang /product/compare-search
  searchProducts: async (keyword) => {
    const response = await api.get("/product/search", {
      params: {
        keyword,
        page: 1,
        limit: 8,
      },
    });

    const products = pickProductArray(response.data);
    return products.map(normalizeProduct).filter(Boolean);
  },

  // Lấy chi tiết sản phẩm theo ID cho so sánh
  // Khi BE rebuild xong, đổi sang /product/compare-detail/:id
  getProductById: async (productId) => {
    const response = await api.get(`/product/detail/${productId}`);
    const product = response.data?.data ?? response.data;
    return normalizeProduct(product);
  },

  // Lấy sản phẩm phổ biến để hiển thị trong modal so sánh
  // Khi BE rebuild xong, đổi sang /product/compare-popular
  getBestSellerProducts: async (limit = 8) => {
    const response = await api.get("/product/best-seller", {
      params: { limit },
    });
    const products = pickProductArray(response.data);
    return products.map(normalizeProduct).filter(Boolean);
  },

  // Lấy gợi ý tên sản phẩm (autocomplete) cho trang so sánh
  // Khi BE rebuild xong, đổi sang /product/compare-suggestions
  getSuggestions: async (keyword) => {
    if (!keyword || keyword.trim() === "") return [];
    const response = await api.get("/product/suggestions", {
      params: { keyword },
    });
    return Array.isArray(response.data) ? response.data : [];
  },
};
