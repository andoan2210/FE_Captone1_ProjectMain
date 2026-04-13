import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaSearch,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaUserCircle,
  FaBox,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import {
  getNewProducts,
  getBestSellerProducts,
  getProductsByCategory,
  getTopStores,
  getTopVouchers,
  getCategories,
} from "../../services/LandingPageService";
import api from "../../services/api";
import * as CartService from "../../services/CartService.js";
import "./LandingPage.css";

// LandingPage.jsx

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=85&auto=format&fit=crop";

const offers = [
  { id: 1, discount: "20%", code: "SMART20", desc: "Đơn tối thiểu 500k" },
  { id: 2, discount: "50k", code: "FREESHIP", desc: "Đơn tối thiểu 0đ" },
  { id: 3, discount: "100k", code: "AIWINTER", desc: "Đơn tối thiểu 1tr" },
  { id: 4, discount: "15%", code: "HELLO2024", desc: "Đơn tối thiểu 200k" },
];

const mockProducts = [
  {
    id: 1,
    name: "Áo Blazer Linen Phối Nút Cao Cấp",
    category: "ÁO KHOÁC",
    price: "850.000đ",
    tag: "MỚI",
    image:
      "https://bizweb.dktcdn.net/thumb/1024x1024/100/451/244/products/442489741-436524615792119-6165782920369129994-n-1716440986212.jpg?v=1734515349447",
  },
  {
    id: 2,
    name: "Váy Lụa Maxi Họa Tiết Tropical",
    category: "VÁY NỮ",
    price: "1.250.000đ",
    tag: "MỚI",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=85&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Quần Jeans Slimfit Co Giãn 4 Chiều",
    category: "QUẦN NAM",
    price: "690.000đ",
    tag: "MỚI",
    image:
      "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgncqvvh9w5o20",
  },
];

const mockPersonalized = [
  {
    id: 101,
    name: "Bộ Vest Business Navy Sang Trọng",
    category: "BỘ VEST",
    price: "3.500.000đ",
    tag: "AI Gợi ý",
    image:
      "https://5sfashion.vn/storage/upload/images/ckeditor/kscj4hNtTwdMy9rGqqN337htzMDQpVdYPqRvVUP2.jpg",
  },
  {
    id: 102,
    name: "Đầm Dự Tiệc Trễ Vai Đính Đá",
    category: "VÁY NỮ",
    price: "2.800.000đ",
    tag: "AI Gợi ý",
    image:
      "https://product.hstatic.net/200000804863/product/leo01449_fcbd9d9ee0724e6f928beb6f04ca9414.jpg",
  },
  {
    id: 103,
    name: "Áo Hoodie Oversize Chữ Nổi",
    category: "ÁO THUN",
    price: "550.000đ",
    tag: "AI Gợi ý",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=85&auto=format&fit=crop",
  },
  {
    id: 104,
    name: "Kính Râm Aviator Chống Tia UV",
    category: "KÍNH MẮT",
    price: "450.000đ",
    tag: "AI Gợi ý",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=85&auto=format&fit=crop",
  },
];

const mockBrands = [
  { id: 1, name: "Ananas Official", followers: "120K FOLLOWERS", rating: 4.9 },
  { id: 2, name: "Coolmate Store", followers: "350K FOLLOWERS", rating: 4.8 },
  { id: 3, name: "Marc Fashion", followers: "65K FOLLOWERS", rating: 4.7 },
  { id: 4, name: "DirtyCoins", followers: "500K FOLLOWERS", rating: 4.9 },
  { id: 5, name: "Ivy Moda", followers: "210K FOLLOWERS", rating: 4.8 },
];

// CATEGORY_ITEMS is now dynamic, initialized with 'all'

function getUserDisplayNameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return (
      payload.email ||
      payload.name ||
      payload.fullName ||
      payload.username ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

function ProductCard({ product, onCategoryClick, compact = false }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [cardToast, setCardToast] = useState(null);

  const showCardToast = (type, msg) => {
    setCardToast({ type, msg });
    setTimeout(() => setCardToast(null), 2000);
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      showCardToast("warn", "Hãy đăng nhập!");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    setAdding(true);
    try {
      // 1. Lấy chi tiết để có variantId đầu tiên
      const res = await api.get(`/product/detail/${product.id}`);
      const data = res.data;
      const variants = data.variants || [];

      if (!variants.length) {
        showCardToast("error", "Hết hàng!");
        return;
      }

      const firstVariant = variants[0];
      const vId = firstVariant.variantId;

      // 2. Add to cart API
      await CartService.addToCart(vId, 1);

      // 3. Sync local_cart
      const localCart = JSON.parse(localStorage.getItem("local_cart") || "[]");
      const existIdx = localCart.findIndex((item) => item.variantId === vId);
      if (existIdx > -1) {
        localCart[existIdx].quantity += 1;
      } else {
        localCart.push({
          cartItemId: Date.now(),
          variantId: vId,
          name: product.name,
          price: Number(firstVariant.price || product.price || 0),
          quantity: 1,
          size: firstVariant.size || "M",
          color: firstVariant.color || "Mặc định",
          image: product.image,
          stock: firstVariant.stock || 50,
        });
      }
      localStorage.setItem("local_cart", JSON.stringify(localCart));
      showCardToast("success", "Đã thêm!");
    } catch (err) {
      showCardToast("error", "Lỗi!");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className="product-card"
      style={{
        position: "relative",
        ...(compact && {
          padding: "8px",
        }),
      }}
    >
      {cardToast && (
        <div className={`lp-card-toast lp-card-toast--${cardToast.type}`}>
          {cardToast.msg}
        </div>
      )}
      <Link to={`/products/${product.id}`} className="product-image-link">
        <div className="product-image-wrapper">
          {product.tag && (
            <span
              className={`product-tag ${product.tag === "AI Gợi ý" ? "tag-ai" : "tag-new"}`}
            >
              {product.tag === "AI Gợi ý" ? "✨ AI Gợi ý" : product.tag}
            </span>
          )}
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div
        className="product-info"
        style={compact ? { padding: "8px 8px" } : {}}
      >
        {product.categoryId ? (
          onCategoryClick ? (
            <span
              className="product-category"
              style={{
                cursor: "pointer",
                fontSize: compact ? "12px" : "inherit",
              }}
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick(product.categoryId);
              }}
            >
              {product.category}
            </span>
          ) : (
            <Link
              to={`/category/${product.categoryId}`}
              className="product-category"
              style={{ fontSize: compact ? "12px" : "inherit" }}
            >
              {product.category}
            </Link>
          )
        ) : (
          <p
            className="product-category"
            style={{ fontSize: compact ? "12px" : "inherit" }}
          >
            {product.category}
          </p>
        )}
        <Link to={`/products/${product.id}`} className="product-name-link">
          <h3
            className="product-name"
            style={{
              fontSize: compact ? "13px" : "inherit",
              lineHeight: compact ? "1.3" : "inherit",
            }}
          >
            {product.name}
          </h3>
        </Link>
        <p
          className="product-price"
          style={{ fontSize: compact ? "13px" : "inherit" }}
        >
          {product.price}
        </p>
        <div
          className="product-actions"
          style={{
            gap: compact ? "6px" : "inherit",
            flexDirection: compact ? "column" : "row",
          }}
        >
          <Link
            className="btn-outline"
            to={`/ai-virtual-tryon?productId=${product.id || product.ProductId}&thumbnail=${encodeURIComponent(product.image || product.ThumbnailUrl)}&productName=${encodeURIComponent(product.name || product.ProductName)}&price=${product.price ? String(product.price).replace(/[^0-9]/g, "") : product.Price || 0}`}
            style={{
              padding: compact ? "6px 10px" : "10px 16px",
              fontSize: compact ? "12px" : "14px",
              flex: compact ? "1" : "auto",
            }}
          >
            Thử đồ với AI
          </Link>
          <button
            type="button"
            className="btn-primary product-link-btn"
            onClick={handleQuickAdd}
            disabled={adding}
            style={{
              padding: compact ? "6px 10px" : "10px 16px",
              fontSize: compact ? "12px" : "14px",
              flex: compact ? "1" : "auto",
            }}
          >
            {adding ? "..." : "Mua"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "all",
  );

  // Tự động chuyển hướng Shop Owner vào trang quản lý thay vì ở lại Trang Chủ
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    // Nếu không muốn ép buộc chuyển hướng mỗi khi bấm logo Trang chủ, ta có thể thêm điều kiện kiểm tra URL
    // Nhưng hiện tại để đáp ứng yêu cầu "vào localhost tự động vào channel shop"
    if (role && role.toLowerCase().includes("shop")) {
      navigate("/shop-owner/store", { replace: true });
    }
  }, [navigate]);

  // Tự động cuộn xuống khu vực danh mục nếu được redirect từ header của trang khác
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
      setTimeout(() => {
        const section = document.getElementById("category-section-target");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      // Xoá state để không bị cuộn lại khi F5
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const [hasMoreCategory, setHasMoreCategory] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userLabel, setUserLabel] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserLabel(null);
      } else {
        setUserLabel(getUserDisplayNameFromToken());
        try {
          const response = await api.get("/auth/profile");
          const profile = response.data;
          setUserLabel(
            profile.FullName ||
              profile.fullName ||
              profile.Email ||
              profile.email ||
              profile.UserName ||
              profile.username ||
              getUserDisplayNameFromToken(),
          );
        } catch {}
      }
    }

    async function loadCategories() {
      try {
        const res = await getCategories(100);
        console.log("Debug Categories API:", res.data);
        // NestJS trả về mảng kết quả trực tiếp [ {id, name, parentId}, ... ]
        const list = Array.isArray(res.data) ? res.data : [];
        setDbCategories(list);
      } catch (err) {
        console.error("Lỗi khi tải danh mục từ database:", err);
      }
    }

    loadUser();
    loadCategories();
  }, []);

  const handleGoogleLogin = () => {
    // Sử dụng api.defaults.baseURL để lấy cấu hình tập trung
    const baseURL = api.defaults.baseURL;
    window.location.href = `${baseURL}/auth/google/login`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  // State chứa dữ liệu API
  const [newProductsData, setNewProductsData] = useState([]);
  const [forYouData, setForYouData] = useState([]);
  const [categoryProductsData, setCategoryProductsData] = useState([]);
  const [topStoresData, setTopStoresData] = useState([]);
  const [topVouchersData, setTopVouchersData] = useState([]);

  // 1. Tải dữ liệu lúc khởi tạo trang
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setLoadingProducts(true);
      setProductError("");

      try {
        // Dùng Promise.allSettled: dù 1 API lỗi, các API khác vẫn chạy bình thường
        const results = await Promise.allSettled([
          getNewProducts(4),
          getBestSellerProducts(4),
          getTopStores(5), // Có thể 404 nếu BE chưa code → fallback mock
          getTopVouchers(4), // Có thể 404 nếu BE chưa code → fallback mock
        ]);

        if (!isMounted) return;

        // Bóc tách dữ liệu: Thành công lấy data, Lỗi trả về []
        const newRaw =
          results[0].status === "fulfilled" ? results[0].value?.data || [] : [];
        const bestRaw =
          results[1].status === "fulfilled" ? results[1].value?.data || [] : [];
        const storesRaw =
          results[2].status === "fulfilled" ? results[2].value?.data || [] : [];
        const vouchersRaw =
          results[3].status === "fulfilled" ? results[3].value?.data || [] : [];

        // Map sản phẩm mới nhất — BE trả về: { ProductId, ProductName, Price, ThumbnailUrl, CategoryName }
        const mappedNew =
          newRaw.length > 0
            ? newRaw.map((item) => ({
                id: item.ProductId ?? item.id,
                name: item.ProductName ?? item.name,
                category: item.CategoryName ?? item.categoryName ?? "MỚI NHẤT",
                categoryId: item.CategoryId ?? item.categoryId ?? null,
                price: new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(item.Price ?? item.price ?? 0)),
                tag: "MỚI",
                image:
                  item.ThumbnailUrl ??
                  item.thumbnail ??
                  "https://via.placeholder.com/520x580?text=No+Image",
              }))
            : mockProducts; // fallback mock nếu API lỗi

        // Map sản phẩm bán chạy — BE trả về: { id, name, price, thumbnail, categoryName, sold }
        const mappedBest =
          bestRaw.length > 0
            ? bestRaw.map((item) => ({
                id: item.id ?? item.ProductId,
                name: item.name ?? item.ProductName,
                category: item.categoryName ?? item.CategoryName ?? "BÁN CHẠY",
                categoryId: item.categoryId ?? item.CategoryId ?? null,
                price: new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(item.price ?? item.Price ?? 0)),
                tag: "🔥 HOT",
                image:
                  item.thumbnail ??
                  item.ThumbnailUrl ??
                  "https://via.placeholder.com/520x580?text=No+Image",
              }))
            : mockPersonalized; // fallback mock nếu API lỗi

        // Map top stores — BE trả về: { StoreId, StoreName, LogoUrl, ... } hoặc chưa có API
        const mappedStores =
          storesRaw.length > 0
            ? storesRaw.map((store) => ({
                id: store.StoreId ?? store.id,
                name: store.StoreName ?? store.name,
                logo: store.LogoUrl ?? store.logo ?? null,
                followers: store.followers ?? "100K FOLLOWERS",
                rating: store.rating ?? 4.9,
              }))
            : mockBrands; // fallback mock nếu BE chưa có API

        // Map vouchers — BE trả về: { VoucherId, Code, DiscountPercent, ... } hoặc chưa có API
        const mappedVouchers =
          vouchersRaw.length > 0
            ? vouchersRaw.map((voucher) => ({
                id: voucher.VoucherId ?? voucher.id,
                discount: voucher.DiscountPercent
                  ? `${voucher.DiscountPercent}%`
                  : voucher.DiscountAmount
                    ? `${Math.round(voucher.DiscountAmount / 1000)}k`
                    : "SALE",
                code: voucher.Code ?? voucher.code ?? "VOUCHER",
                desc:
                  voucher.Description ??
                  `Đơn tối thiểu ${(voucher.MinOrderValue || 0).toLocaleString("vi-VN")}đ`,
              }))
            : offers; // fallback mock nếu BE chưa có API

        setNewProductsData(mappedNew);
        setForYouData(mappedBest);
        setTopStoresData(mappedStores);
        setTopVouchersData(mappedVouchers);
      } catch (err) {
        if (!isMounted) return;
        console.error("Lỗi tải dữ liệu trang chủ:", err);
        setProductError(
          "Không thể tải dữ liệu từ server. Đang hiển thị dữ liệu mẫu.",
        );
        // Fallback toàn bộ sang mock data
        setNewProductsData(mockProducts);
        setForYouData(mockPersonalized);
        setTopStoresData(mockBrands);
        setTopVouchersData(offers);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải dữ liệu theo Danh mục khi người dùng bấm tab
  // 2.1: Khi người dùng đổi Tab danh mục (ví dụ từ Nam sang Nữ), reset lại trang về 1
  useEffect(() => {
    setCategoryPage(1);
    setHasMoreCategory(true);
    setCategoryProductsData([]); // Xóa sạch list cũ để chuẩn bị render list mới
  }, [activeCategory]);

  // 2.2: Tải dữ liệu khi categoryPage hoặc activeCategory thay đổi
  useEffect(() => {
    let isMounted = true;
    async function loadCategoryProducts() {
      setIsLoadingMore(true);
      try {
        // Xử lý kiểu dữ liệu ID (NestJS thường trả về Number)
        const currentActiveId = activeCategory;

        const limitPerLoad = 9;
        let newData = [];
        let totalCountFromBE = 0;

        if (currentActiveId === "all") {
          const limit = categoryPage * limitPerLoad;
          const res = await getNewProducts(limit);
          newData = res.data || [];
          totalCountFromBE = newData.length;
        } else {
          // Ép kiểu ID về Number để chắc chắn API nhận đúng
          const catIdForAPI = isNaN(currentActiveId)
            ? currentActiveId
            : Number(currentActiveId);
          const res = await getProductsByCategory(
            catIdForAPI,
            categoryPage,
            limitPerLoad,
          );
          newData = res.data || [];
          // Giả sử API trả về total hoặc lấy chiều dài mảng mới nhất làm căn cứ
          totalCountFromBE = newData.length;
        }

        if (!isMounted) return;

        const mappedCategory = newData.map((item) => ({
          id: item.id ?? item.ProductId,
          name: item.name ?? item.ProductName,
          category: item.categoryName ?? item.CategoryName ?? "Danh Mục",
          categoryId: item.categoryId ?? item.CategoryId ?? null,
          price: new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(Number(item.price ?? item.Price ?? 0)),
          tag: "",
          image:
            item.thumbnail ??
            item.ThumbnailUrl ??
            "https://via.placeholder.com/520x580?text=No+Image",
        }));

        if (activeCategory === "all") {
          // Với 'all', ta thay thế hoàn toàn vì API getNewProducts luôn trả về từ phần tử đầu tiên
          setCategoryProductsData(mappedCategory);
          setHasMoreCategory(
            mappedCategory.length >= categoryPage * limitPerLoad,
          );
        } else {
          // Với các danh mục cụ thể, ta cộng dồn mảng cũ với mảng mới
          if (categoryPage === 1) {
            setCategoryProductsData(mappedCategory);
          } else {
            setCategoryProductsData((prev) => [...prev, ...mappedCategory]);
          }
          // Nếu mảng mới trả về ít hơn 9 sản phẩm -> đã hết hàng -> ẩn nút Tải thêm
          setHasMoreCategory(mappedCategory.length === limitPerLoad);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        if (isMounted) setIsLoadingMore(false);
      }
    }

    // Tránh gọi API 2 lần liên tiếp do hàm Reset ở trên
    if (categoryPage > 0) {
      loadCategoryProducts();
    }
    return () => {
      isMounted = false;
    };
  }, [activeCategory, categoryPage]);

  // ÉP DÙNG DATA THẬT 100%
  const categoryGridProducts = categoryProductsData;
  const newProducts = newProductsData;
  const forYouProducts = forYouData;

  // ---> THÊM HÀM NÀY VÀO ĐÂY <---
  const handleNavClick = (categoryId) => {
    setActiveCategory(categoryId);
    // Luôn cuộn xuống khu vực danh mục khi chọn
    setTimeout(() => {
      const section = document.getElementById("category-section-target");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };
  // --------------------------------

  return (
    <div className="landing-page-container">
      <a href="#main-content" className="lp-skip-link">
        Bỏ qua điều hướng
      </a>

      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <label className="search-wrap">
            <span className="visually-hidden">Tìm kiếm sản phẩm</span>
            <FaSearch className="search-icon" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="search-bar"
              autoComplete="off"
            />
          </label>
          <div className="user-actions">
            <Link to="/cart" className="icon-link" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </Link>
            <Link to="/chat" className="icon-link" aria-label="Tin nhắn">
              <FiMessageCircle />
            </Link>
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  <FaUserCircle
                    style={{ fontSize: "20px", color: "var(--lp-accent)" }}
                  />
                  <span className="user-profile">{userLabel}</span>
                </button>
                <div className="profile-dropdown">
                  <Link
                    to="/manage/Manageinvoice"
                    className="profile-dropdown-item"
                  >
                    <FaBox /> Đơn mua
                  </Link>
                  <Link
                    to="/user/UserProfile"
                    className="profile-dropdown-item"
                  >
                    <FaUser /> Trang cá nhân
                  </Link>
                  {localStorage
                    .getItem("userRole")
                    ?.toLowerCase()
                    .includes("shop") && (
                    <Link
                      to="/shop-owner/store"
                      className="profile-dropdown-item"
                      style={{ color: "var(--lp-accent)" }}
                    >
                      <FaBox /> Kênh Shop{" "}
                      <span
                        style={{
                          fontSize: "10px",
                          marginLeft: "auto",
                          background: "var(--lp-accent)",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        PRO
                      </span>
                    </Link>
                  )}
                  <button
                    type="button"
                    className="profile-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="link-muted">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary btn-header-sm">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="main-nav" aria-label="Danh mục chính">
        <div className="container nav-links">
          <span
            onClick={() => handleNavClick("all")}
            style={{ cursor: "pointer" }}
          >
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories.map((cat) => (
            <span
              key={cat.id}
              onClick={() => handleNavClick(cat.id)}
              style={{ cursor: "pointer" }}
            >
              {cat.name}
            </span>
          ))}
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
        </div>
      </nav>

      <main id="main-content" className="container lp-main">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <span className="badge-collection">BST THU ĐÔNG 2024</span>
            <h1 id="hero-title">
              NÂNG TẦM <br />
              <span className="text-accent">PHONG CÁCH</span> <br />
              VỚI CÔNG NGHỆ AI
            </h1>
            <p>
              Trải nghiệm mua sắm chưa từng có với tính năng thử đồ ảo. Chọn đồ
              ưng ý, ướm thử tức thì ngay trên màn hình.
            </p>
            <div className="hero-buttons">
              <a
                href="#category-section-target"
                className="btn-primary large"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("all");
                }}
              >
                Khám phá ngay →
              </a>
              <Link to="/ai-virtual-tryon" className="btn-outline large">
                Thử đồ AI
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <h3>500k+</h3>
                <p>KHÁCH HÀNG</p>
              </div>
              <div>
                <h3>2.5k+</h3>
                <p>THƯƠNG HIỆU</p>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <img
              className="hero-image"
              src={HERO_IMAGE}
              alt="Mẫu thời trang với túi xách — SmartAI Fashion"
            />
            <div className="ai-ready-badge">
              <span className="star-icon" aria-hidden>
                ★
              </span>
              <div>
                <p>AI TRY ON READY</p>
                <strong>Khớp độ 99.9%</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section-block offers-section"
          aria-labelledby="offers-heading"
        >
          <div className="section-header">
            <h2 id="offers-heading">Voucher mới nhất</h2>
            <p>Săn voucher khủng, mua sắm thả ga không lo về giá</p>
          </div>
          <div className="offers-grid">
            {topVouchersData.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-discount">
                  GIẢM
                  <br />
                  <strong>{offer.discount}</strong>
                </div>
                <div className="offer-details">
                  <h4>Mã: {offer.code}</h4>
                  <p>{offer.desc}</p>
                  <button type="button" className="offer-cta">
                    Dùng ngay &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="section-block"
          aria-labelledby="new-products-heading"
        >
          <div className="section-header flex-between">
            <div>
              <h2 id="new-products-heading">Sản phẩm mới nhất</h2>
              <p>Cập nhật những xu hướng thời trang mới nhất vừa lên kệ</p>
            </div>
            <a
              href="#category-section-target"
              className="view-all"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("all");
              }}
            >
              Xem tất cả &gt;
            </a>
          </div>
          <div className="products-grid">
            {(newProducts.length ? newProducts : mockProducts).map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCategoryClick={handleNavClick}
                  compact={true}
                />
              ),
            )}
          </div>
        </section>

        <section className="virtual-tryon-banner" aria-labelledby="vto-heading">
          <div className="vto-content">
            <h2 id="vto-heading" className="flex-align-center">
              <span className="star-icon" aria-hidden>
                ★
              </span>{" "}
              AI Virtual Try-On
            </h2>
            <h3>PHÒNG THỬ ĐỒ THÔNG MINH 4.0</h3>
            <p>
              Không còn lo lắng về việc mặc không vừa hay không hợp. Với AI của
              chúng tôi, bạn có thể ướm thử bất kỳ sản phẩm nào lên chính hình
              ảnh cá nhân chỉ trong 2 giây.
            </p>
            <ul className="vto-features">
              <li>✔️ Độ chính xác cao</li>
              <li>✔️ Gợi ý size chuẩn</li>
              <li>✔️ Phối đồ tự động</li>
              <li>✔️ Chia sẻ dễ dàng</li>
            </ul>
            <Link to="/ai-virtual-tryon" className="btn-primary large">
              Thử ngay bây giờ
            </Link>
          </div>
          <div className="vto-image">
            <div
              className="phone-mockup"
              role="img"
              aria-label="Giao diện thử đồ AI trên điện thoại"
            >
              <span className="phone-mockup-label">Trải nghiệm UI Try On</span>
            </div>
          </div>
        </section>

        <section className="section-block" aria-labelledby="for-you-heading">
          <div className="section-header">
            <h2 id="for-you-heading">Sản phẩm bán chạy nhất</h2>
            <p>
              Những sản phẩm được khách hàng yêu thích và săn lùng nhiều nhất
            </p>
          </div>
          <div className="products-grid">
            {/* ĐÃ SỬA: Đưa forYouProducts (chứa data bán chạy) vào hiển thị */}
            {forYouProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCategoryClick={handleNavClick}
                compact={true}
              />
            ))}
          </div>
        </section>

        <section className="section-block" aria-labelledby="brands-heading">
          <div className="section-header">
            <h2 id="brands-heading">Store bán nhiều đơn nhất</h2>
            <p>Mua sắm trực tiếp từ các Official Store uy tín nhất</p>
          </div>
          <div className="brands-grid">
            {topStoresData.map((brand) => (
              <div key={brand.id} className="brand-card">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="brand-logo"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 10px",
                      display: "block",
                    }}
                  />
                ) : (
                  <div className="brand-logo-placeholder" aria-hidden />
                )}
                <h4>{brand.name}</h4>
                <button type="button" className="btn-outline-small">
                  XEM SHOP
                </button>
              </div>
            ))}
          </div>
        </section>

        <section
          id="category-section-target"
          className="section-block category-section"
          aria-labelledby="hot-cat-heading"
        >
          <div className="category-sidebar">
            <h2 id="hot-cat-heading">Danh mục hot</h2>
            <ul className="category-menu">
              <li>
                <button
                  type="button"
                  className={activeCategory === "all" ? "active" : ""}
                  onClick={() => setActiveCategory("all")}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {dbCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    // So sánh linh hoạt (==) vì ID từ DB có thể là Number, trong khi state sau redirect có thể là String
                    className={
                      String(cat.id) === String(activeCategory) ? "active" : ""
                    }
                    onClick={() => handleNavClick(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="vip-card">
              <h4>ĐẶC QUYỀN VIP</h4>
              <p>
                Giao hàng hỏa tốc trong 2h và bảo hành 12 tháng mọi sản phẩm.
              </p>
              <button type="button" className="btn-primary w-full">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          <div className="category-products">
            <div className="products-grid-3-cols">
              {categoryGridProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  onCategoryClick={handleNavClick}
                  compact={true}
                />
              ))}
            </div>

            {/* Cập nhật khu vực Nút Tải Thêm */}
            {hasMoreCategory && (
              <div className="load-more-container">
                <button
                  type="button"
                  className="btn-outline large"
                  onClick={() => setCategoryPage((prev) => prev + 1)}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Đang tải..." : "Tải thêm sản phẩm"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ──── FLOATING CHAT BUTTON ──── */}
      <button
        className="floating-chat-btn"
        onClick={() => navigate("/chat")}
        title="Mở chat"
        aria-label="Mở khung chat"
      >
        <FiMessageCircle size={24} />
      </button>

      <footer className="lp-footer">
        <div className="container lp-footer-grid">
          <div className="lp-footer-brand">
            <strong className="logo">SmartAI Fashion</strong>
            <p>Thời trang thông minh — thử đồ bằng AI, giao nhanh toàn quốc.</p>
          </div>
          <div>
            <h3 className="lp-footer-title">Hỗ trợ</h3>
            <ul className="lp-footer-links">
              <li>
                <Link to="/login">Tài khoản</Link>
              </li>
              <li>
                <a href="#main-content">Theo dõi đơn hàng</a>
              </li>
              <li>
                <a href="#main-content">Đổi trả &amp; bảo hành</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="lp-footer-title">Công ty</h3>
            <ul className="lp-footer-links">
              <li>
                <a href="#main-content">Về chúng tôi</a>
              </li>
              <li>
                <a href="#main-content">Tuyển dụng</a>
              </li>
              <li>
                <a href="#main-content">Điều khoản</a>
              </li>
            </ul>
          </div>
          <div className="lp-footer-social">
            <h3 className="lp-footer-title">Kết nối</h3>
            <div className="lp-social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <div className="container">
            © {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.
          </div>
        </div>
      </footer>
    </div>
  );
}
