import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaShoppingCart,
  FaSearch,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaHeart,
  FaShareAlt,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaUserCircle,
  FaBox,
  FaSignOutAlt,
  FaUser,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import { FaFlag, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { useNotification } from "../../hooks/useNotification";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import { ShopProductService } from "../../services/ShopProductService";
import { ShopCuahangService } from "../../services/ShopCuahangService";
import * as ProductDetailService from "../../services/ProductDetailService";
import { CategoryService } from "../../services/CategoryService";
import * as CartService from "../../services/CartService";
import chatService from "../../services/chatService";
import { FiMessageCircle } from "react-icons/fi";

import "../LandingPage/LandingPage.css";
import "./ProductDetail.css";

// Reuse user label logic
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

function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifPanelRef = useRef(null);
  const {
    unreadCount,
    notifications,
    loading: notifLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    nextCursor,
  } = useNotification();

  const handleNotificationClick = async (n) => {
    if (!n.IsRead) {
      await markAsRead(n.NotificationId);
    }
    setShowNotifPanel(false);
    const textToSearch = `${n.Title || ''} ${n.Content || ''}`;
    const orderMatch = textToSearch.match(/#(\d+)/) || textToSearch.match(/ORD-(\d+)/i);
    if (orderMatch && orderMatch[1]) {
      navigate(`/manage/invoice-detail/${orderMatch[1]}`);
    } else {
      navigate('/manage/Manageinvoice');
    }
  };

  // Đóng notification panel khi click ra ngoài
  useEffect(() => {
    const handleClickOutsideNotif = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, []);

  // Hàm tải số lượng giỏ hàng
  const loadCartCount = async () => {
    try {
      const res = await CartService.getCart();
      const data = res.data;
      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data && typeof data === "object") {
        const items = data.cartItems || data.items || data.cart?.cartItems || (data.shops ? data.shops.flatMap(s => s.items || []) : []);
        count = Array.isArray(items) ? items.length : 0;
      }
      setCartCount(count);
    } catch (err) {
      const localCart = JSON.parse(localStorage.getItem("local_cart") || "[]");
      setCartCount(Array.isArray(localCart) ? localCart.length : 0);
    }
  };

  useEffect(() => {
    loadCartCount();
    window.addEventListener('cart-updated', loadCartCount);
    window.addEventListener('storage', loadCartCount);
    return () => {
      window.removeEventListener('cart-updated', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
    };
  }, []);

  const handleNavClick = (categoryId) => {
    if (categoryId === "all") {
      navigate("/", { state: { category: "all" } });
    } else {
      navigate("/", { state: { category: categoryId } });
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSelectSuggestion = (keyword) => {
    setSearchTerm(keyword);
    setShowSuggestions(false);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // Xử lý gợi ý từ khóa (Debounce 300ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const data = await ShopProductService.getSuggestions(searchTerm);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (err) {
          console.error("Lỗi lấy gợi ý:", err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <div className="search-wrap" ref={searchRef}>
            <span className="visually-hidden">Tìm kiếm sản phẩm</span>
            <FaSearch className="search-icon" aria-hidden />
            <input
              type="search"
              name="q"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="search-bar"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleSearch}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <FaSearch className="suggestion-icon" />
                    <span className="suggestion-keyword">{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="user-actions">
            <Link to="/cart" className="icon-link" aria-label="Giỏ hàng">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-quantity-badge">{cartCount}</span>}
            </Link>
            <Link to="/chat" className="icon-link" aria-label="Tin nhắn">
              <FiMessageCircle />
            </Link>
            {userLabel && (
              <div className="notif-bell-wrapper" ref={notifPanelRef}>
                <button
                  className="icon-link"
                  aria-label="Thông báo"
                  onClick={() => {
                    setShowNotifPanel((prev) => {
                      if (!prev) fetchNotifications();
                      return !prev;
                    });
                  }}
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="cart-quantity-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {showNotifPanel && (
                  <div className="notif-dropdown-panel">
                    <div className="notif-panel-header">
                      <h4>Thông báo</h4>
                      {unreadCount > 0 && (
                        <button type="button" className="notif-mark-all" onClick={markAllAsRead}>Đánh dấu tất cả đã đọc</button>
                      )}
                    </div>
                    <div className="notif-panel-list">
                      {notifications.length === 0 && !notifLoading && (
                        <div className="notif-empty">Chưa có thông báo nào</div>
                      )}
                      {notifications.map((n) => (
                        <div
                          key={n.NotificationId}
                          className={`notif-item ${!n.IsRead ? 'notif-unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-item-content">
                            <div className="notif-item-title">{n.Title}</div>
                            <div className="notif-item-body">{n.Content}</div>
                            <div className="notif-item-time">
                              {n.CreatedAt ? new Date(typeof n.CreatedAt === 'string' ? n.CreatedAt.replace('Z', '') : n.CreatedAt).toLocaleString('vi-VN') : ''}
                              {!n.IsRead && (
                                <button
                                  type="button"
                                  className="notif-item-read-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.NotificationId);
                                  }}
                                >
                                  Đánh dấu đã đọc
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="notif-item-delete"
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.NotificationId); }}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                      {notifLoading && <div className="notif-loading">Đang tải...</div>}
                      {nextCursor && !notifLoading && (
                        <button type="button" className="notif-load-more" onClick={loadMore}>Xem thêm</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      style={{ width: "24px", height: "24px", borderRadius: "50%", marginRight: "8px", objectFit: "cover" }}
                    />
                  ) : (
                    <FaUserCircle
                      style={{ fontSize: "20px", color: "var(--lp-accent)" }}
                    />
                  )}
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
                    onClick={onLogout}
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
          <Link
            to={localStorage.getItem("userRole")?.toLowerCase().includes("shop") ? "/shop-owner/store" : "/register-shop"}
            style={{
              marginLeft: 'auto',
              color: '#fff',
              backgroundColor: 'var(--lp-accent, #2563eb)',
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
              fontSize: '13px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Trở thành Người bán hàng
          </Link>
        </div>
      </nav>
    </>
  );
}

function PageFooter() {
  return (
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
  );
}

export default function ProductDetail() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserLabel(null);
        setUserAvatar(null);
        return;
      }
      try {
        const profile = await api.get("/users/profile").then(res => res.data);
        setUserLabel(profile.fullName || profile.email || profile.username);
        setUserAvatar(profile.avatarUrl || null);
      } catch (err) {
        console.error("Lỗi tải profile:", err);
      }
    }
    loadUser();
  }, []);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Biến thể (Variants)
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [dbCategories, setDbCategories] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);

  // Báo cáo (Report)
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const reportReasons = [
    "Sản phẩm có dấu hiệu lừa đảo",
    "Hàng giả, hàng nhái",
    "Sản phẩm không rõ nguồn gốc, xuất xứ",
    "Hình ảnh sản phẩm không rõ ràng",
    "Sản phẩm có hình ảnh, nội dung phản cảm hoặc có thể gây phản cảm",
    "Tên sản phẩm (Name) không phù hợp với hình ảnh sản phẩm",
    "Sản phẩm có dấu hiệu tăng đơn ảo",
    "Sản phẩm chứa hình ảnh và thông tin giao dịch ngoài sàn",
    "Sản phẩm bị cấm buôn bán (động vật hoang dã, 18+,...)",
    "Khác"
  ];

  // Tải danh mục
  useEffect(() => {
    async function fetchCats() {
      try {
        // Bypass cache bằng cách không truyền limit mặc định hoặc truyền limit cao
        const res = await CategoryService.getAllCategories();
        // CategoryService.getAllCategories returns response.data already
        const categories = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
            ? res.data
            : [];
        setDbCategories(categories);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    }
    fetchCats();
  }, []);

  // Tải chi tiết sản phẩm
  useEffect(() => {
    async function loadProductDetail() {
      if (!idParam) return;
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const res = await ShopProductService.getProductById(idParam);
        const data = res?.data || res;

        if (data) {
          setProduct(data);
          const initialImage = data.thumbnail ||
            (data.images && data.images.length > 0
              ? (typeof data.images[0] === 'string' ? data.images[0] : data.images[0].imageUrl)
              : "");
          setSelectedImage(initialImage);

          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedSize(firstVariant.size);
            setSelectedColor(firstVariant.color || "");
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Lỗi tải sp:", err);
        setError("Không thể tải thông tin sản phẩm. Vિય lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    loadProductDetail();
  }, [idParam]);

  // Tải thông tin cửa hàng
  useEffect(() => {
    async function loadShopInfo() {
      if (!idParam) return;
      try {
        const shopData = await ShopCuahangService.getStoreByProduct(idParam);
        if (shopData) {
          setShopInfo(shopData);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin shop:", err);
      }
    }
    loadShopInfo();
  }, [idParam]);

  // --- LOGIC XỬ LÝ BIẾN THỂ ---
  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.size === selectedSize &&
          (v.color === selectedColor || (!v.color && !selectedColor)),
      ) ||
      product.variants.find((v) => v.size === selectedSize) ||
      product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const uniqueSizes = useMemo(() => {
    if (!product || !product.variants) return [];
    return [...new Set(product.variants.map((v) => v.size))];
  }, [product]);

  const colorsForSelectedSize = useMemo(() => {
    if (!product || !product.variants || !selectedSize) return [];
    const colors = product.variants
      .filter((v) => v.size === selectedSize && v.color)
      .map((v) => v.color);
    return [...new Set(colors)];
  }, [product, selectedSize]);

  const displayPrice = currentVariant
    ? currentVariant.price
    : product
      ? product.price
      : 0;
  const stockAvailable = currentVariant ? currentVariant.stock : 0;

  // Find category ID for linking
  const resolvedCategoryId = useMemo(() => {
    if (!product || !dbCategories.length) return null;
    return dbCategories.find(
      (c) =>
        c.name?.toLowerCase().trim() ===
        product.categoryName?.toLowerCase().trim(),
    )?.id;
  }, [product, dbCategories]);

  // --- LOGIC ẢNH ---
  const allImages = useMemo(() => {
    if (!product) return [];
    // ✅ Hỗ trợ cả trường hợp images là mảng string hoặc mảng object {imageUrl}
    const secondaryImages = (product.images || []).map((img) =>
      typeof img === "string" ? img : img.imageUrl,
    );
    return [product.thumbnail, ...secondaryImages].filter(Boolean);
  }, [product]);

  const handlePrevImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = allImages.indexOf(selectedImage);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };


  const handleAddToCart = async () => {
    if (!currentVariant) {
      toast.error("Vui lòng chọn đầy đủ kích thước và màu sắc.");
      return;
    }

    if (quantity > stockAvailable) {
      toast.error(
        `Xin lỗi, chúng tôi chỉ còn ${stockAvailable} sản phẩm trong kho.`,
      );
      return;
    }

    try {
      const res = await CartService.addToCart(
        currentVariant.variantId,
        quantity,
      );
      if (res.data || res.status === 200 || res.status === 201) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!", { duration: 1000 });
        window.dispatchEvent(new Event('cart-updated'));
        // Cập nhật lại số lượng còn lại nếu cần (optional)
      }
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.";
      toast.error(errorMessage);
    }
  };

  const handleBuyNow = () => {
    if (!currentVariant) {
      toast.error("Vui lòng chọn đầy đủ kích thước và màu sắc.");
      return;
    }

    if (quantity > stockAvailable) {
      toast.error(
        `Xin lỗi, chúng tôi chỉ còn ${stockAvailable} sản phẩm trong kho.`,
      );
      return;
    }


    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: {
        type: "BUY_NOW",

        variantId: currentVariant.variantId,
        quantity,
      },
    });

  };

  const handleTryOnAI = () => {
    if (!product) return;

    const productId = product.id;
    const thumbnailUrl =
      product.thumbnail || (product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].imageUrl) : "") || "";
    const productName = product.name || "Sản phẩm";
    const price = product.price || 0;

    const url = `/ai-virtual-tryon?productId=${productId}&thumbnail=${encodeURIComponent(thumbnailUrl)}&productName=${encodeURIComponent(productName)}&price=${price}`;
    navigate(url);
  };

  const handleCompareNow = () => {
    if (!product?.id) return;
    navigate(`/compare?ids=${product.id}`);
  };

  const handleChatNow = async () => {
    if (!userLabel) {
      toast.error("Vui lòng đăng nhập để chat với cửa hàng.");
      navigate("/login");
      return;
    }

    const shopId =
      shopInfo?.StoreId ||
      shopInfo?.storeId ||
      product?.StoreId ||
      product?.storeId;
    if (!shopId) {
      toast.error("Không tìm thấy thông tin cửa hàng.");
      return;
    }

    try {
      const res = await chatService.startChat(shopId);
      if (res && res.ConversationId) {
        navigate("/chat", { state: { conversationId: res.ConversationId } });
      } else {
        navigate("/chat");
      }
    } catch (err) {
      console.error("Lỗi bắt đầu chat:", err);
      navigate("/chat");
    }
  };

  const handleSendReport = async () => {
    if (!userLabel) {
      toast.error("Vui lòng đăng nhập để gửi báo cáo.");
      navigate("/login");
      return;
    }
    if (!reportType) {
      toast.error("Vui lòng chọn lý do báo cáo.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      await adminService.createReport({
        productId: parseInt(idParam),
        reportType: reportType,
        description: reportDescription || reportType,
        evidenceImages: [] // Có thể mở rộng thêm tính năng upload ảnh bằng chứng sau
      });
      toast.success("Cảm ơn bạn đã gửi báo cáo. Chúng tôi sẽ sớm xem xét!");
      setShowReportModal(false);
      setReportType("");
      setReportDescription("");
    } catch (err) {
      console.error("Lỗi gửi báo cáo:", err);
      toast.error(err.message || "Không thể gửi báo cáo vào lúc này.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="pd-error-container">
        <h2>404</h2>
        <p>Sản phẩm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="btn-primary">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="pd-page-wrapper landing-page-container">
      <PageHeader
        userLabel={userLabel}
        userAvatar={userAvatar}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />

      <main className="pd-main-content">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="pd-sep">/</span>
            {resolvedCategoryId ? (
              <Link to={`/category/${resolvedCategoryId}`}>
                {product.categoryName || "Sản phẩm"}
              </Link>
            ) : (
              <span>{product.categoryName || "Sản phẩm"}</span>
            )}
            <span className="pd-sep">/</span>
            <span className="pd-current">{product.name}</span>
          </nav>

          <div className="pd-product-grid">
            {/* Gallery */}
            <div className="pd-gallery-section">
              <div className="pd-main-image-wrap">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="pd-main-image"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      className="pd-nav-btn pd-nav-prev"
                      onClick={handlePrevImage}
                      aria-label="Ảnh trước"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="pd-nav-btn pd-nav-next"
                      onClick={handleNextImage}
                      aria-label="Ảnh tiếp"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                <button
                  className={`pd-wishlist-btn ${wishlisted ? "active" : ""}`}
                  onClick={() => setWishlisted(!wishlisted)}
                  aria-label="Thêm vào yêu thích"
                >
                  <FaHeart />
                </button>
              </div>
              {product.images && product.images.length > 0 && (
                <div className="pd-thumbnail-grid">
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`pd-thumb-item ${selectedImage === img ? "active" : ""}`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Xem thêm ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="pd-info-section">
              <div className="pd-badge-row">
                <span className="pd-badge pd-badge-dark">CỬA HÀNG</span>
                {resolvedCategoryId ? (
                  <Link
                    to={`/category/${resolvedCategoryId}`}
                    className="pd-category-link"
                  >
                    {product.categoryName}
                  </Link>
                ) : (
                  <span className="pd-category-link">
                    {product.categoryName}
                  </span>
                )}
              </div>

              <div className="pd-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <h1 className="pd-title" style={{ margin: 0, flex: 1 }}>{product.name}</h1>
                <button
                  className="pd-report-trigger-btn"
                  onClick={() => setShowReportModal(true)}
                  title="Báo cáo sản phẩm"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <FaFlag size={18} />
                </button>
              </div>

              <div
                className="pd-meta-row"
                style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}
              >
                Lượt bán:{" "}
                <strong style={{ color: "#1f2937", marginLeft: "4px" }}>
                  {product.sold || 0}
                </strong>
              </div>

              <div className="pd-price-card">
                <div className="pd-price-row">
                  <span className="pd-current-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(displayPrice)}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="pd-options-container">
                {/* Size */}
                <div className="pd-option-item">
                  <div className="pd-option-label-wrap">
                    <span className="pd-option-label">Kích thước</span>
                  </div>
                  <div className="pd-size-grid">
                    {uniqueSizes.map((size) => (
                      <button
                        key={size}
                        className={`pd-size-chip ${selectedSize === size ? "active" : ""}`}
                        onClick={() => {
                          setSelectedSize(size);
                          // Chọn màu đầu tiên khả dụng của size này
                          const firstColor = product.variants.find(
                            (v) => v.size === size,
                          )?.color;
                          if (firstColor) setSelectedColor(firstColor);
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                {colorsForSelectedSize.length > 0 && (
                  <div className="pd-option-item">
                    <span className="pd-option-label">Màu sắc</span>
                    <div className="pd-color-grid">
                      {colorsForSelectedSize.map((color) => (
                        <button
                          key={color}
                          className={`pd-color-chip ${selectedColor === color ? "active" : ""}`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="pd-option-item">
                  <span className="pd-option-label">Số lượng</span>
                  <div className="pd-quantity-row">
                    <div className="pd-qty-selector">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min="1"
                        max={stockAvailable}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(
                            Math.min(Math.max(1, val), stockAvailable || 1),
                          );
                        }}
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(quantity + 1, stockAvailable))
                        }
                        disabled={quantity >= stockAvailable}
                      >
                        +
                      </button>
                    </div>
                    <span className="pd-stock-status">
                      {stockAvailable > 0 ? (
                        `Còn ${stockAvailable} sản phẩm`
                      ) : (
                        <span className="text-red">Hết hàng</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pd-action-btns">
                <button
                  className="pd-btn pd-btn-outline pd-btn-large"
                  onClick={handleAddToCart}
                  disabled={stockAvailable <= 0}
                >
                  <FaShoppingCart /> Thêm vào giỏ hàng
                </button>
                <button
                  className="pd-btn pd-btn-primary pd-btn-large"
                  onClick={handleBuyNow}
                  disabled={stockAvailable <= 0}
                >
                  Mua ngay
                </button>
              </div>

              <button className="pd-magic-fit-btn" onClick={handleTryOnAI}>
                <span className="sparkle-icon" style={{ fontSize: "20px" }}>
                  ✨
                </span>{" "}
                Thử đồ ngay với AI Magic Fit
              </button>

              <button className="pd-compare-btn" onClick={handleCompareNow}>
                So sánh sản phẩm này
              </button>

              {/* Features */}
              <div className="pd-features-list">
                <div className="pd-feature-item">
                  <FaShieldAlt className="icon-blue" />
                  <span>7 ngày trả hàng</span>
                </div>
                <div className="pd-feature-item">
                  <FaCheck className="icon-green" />
                  <span>100% Chính hãng</span>
                </div>
                <div className="pd-feature-item">
                  <FaTruck className="icon-blue" />
                  <span>Miễn phí vận chuyển</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Banner */}
          <section className="pd-store-section">
            <div className="pd-store-info">
              <div className="pd-store-avatar-wrap">
                <img
                  src={
                    shopInfo?.logoUrl ||
                    "https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg"
                  }
                  alt={shopInfo?.storeName || "Cửa hàng"}
                  className="pd-store-avatar"
                />
                <span className="pd-store-badge">YÊU THÍCH +</span>
              </div>
              <div className="pd-store-details">
                <h3 className="pd-store-name">
                  {shopInfo?.storeName || "SmartAI Fashion Flagship Store"}
                </h3>
                <div className="pd-store-stats">
                  <div className="pd-stat-item">
                    Phản hồi:{" "}
                    <span className="text-blue">99% (trong vài phút)</span>
                  </div>
                  <span className="pd-store-sep">|</span>
                  <div className="pd-stat-item">
                    Sản phẩm:{" "}
                    <span className="text-blue">
                      {shopInfo?.productCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pd-store-actions">
              <button
                className="pd-btn-store pd-btn-chat"
                onClick={handleChatNow}
              >
                Chat ngay
              </button>

              <button
                className="pd-btn-store pd-btn-view-store"
                onClick={() => {
                  const shopIdToView = shopInfo?.StoreId || shopInfo?.storeId || product?.StoreId || product?.storeId;
                  if (shopIdToView) navigate(`/shop/${shopIdToView}`);
                }}
              >
                Xem cửa hàng
              </button>
            </div>
          </section>

          {/* Description */}
          <section className="pd-description-section">
            <h2
              className="pd-section-title"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FaStar style={{ color: "#0ea5e9", fontSize: "20px" }} />
              Chi tiết sản phẩm
            </h2>
            <div
              className="pd-description-content"
              style={{
                background: "#f8fafc",
                padding: "32px",
                borderRadius: "20px",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)",
                border: "1px solid #e2e8f0",
                minHeight: "150px",
              }}
            >
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </div>
          </section>
        </div>
      </main>

      <PageFooter />

      {/* Modal Báo Cáo */}
      {showReportModal && (
        <div className="pd-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="pd-report-modal" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="pd-modal-header" style={{
              padding: '20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Chọn lý do</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <FaTimes size={20} />
              </button>
            </div>

            <div className="pd-modal-body" style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
              <div className="pd-reasons-list">
                {reportReasons.map((reason, idx) => (
                  <button
                    key={idx}
                    className={`pd-reason-item ${reportType === reason ? 'active' : ''}`}
                    onClick={() => setReportType(reason)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '16px 20px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f9fafb',
                      fontSize: '14px',
                      color: reportType === reason ? '#ef4444' : '#374151',
                      transition: 'background 0.2s',
                      fontWeight: reportType === reason ? 500 : 400
                    }}
                    onMouseOver={(e) => { if (reportType !== reason) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseOut={(e) => { if (reportType !== reason) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {reportType === "Khác" && (
                <div style={{ padding: '20px' }}>
                  <textarea
                    placeholder="Mô tả chi tiết lý do của bạn..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      minHeight: '100px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pd-modal-footer" style={{ padding: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSendReport}
                disabled={isSubmittingReport || !reportType}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSubmittingReport || !reportType ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmittingReport || !reportType ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

