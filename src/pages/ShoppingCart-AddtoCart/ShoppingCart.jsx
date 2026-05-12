import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ShopProductService } from '../../services/ShopProductService';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTrashAlt, FaArrowLeft, FaShoppingCart,
  FaSearch, FaFacebookF, FaInstagram, FaYoutube,
  FaUserCircle, FaBox, FaSignOutAlt, FaUser,
  FaShoppingBag,
} from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import * as CartService from '../../services/CartService.js';
import CheckoutService from '../../services/CheckoutService';
import { CategoryService } from '../../services/CategoryService';
import '../LandingPage/LandingPage.css';
import '../ProductDetail/ProductDetail.css';
import './ShoppingCart.css';
import { toast } from 'react-hot-toast';

/* ── Helpers ─────────────────────────────────────── */
function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const p = jwtDecode(token);
    return p.email || p.name || p.fullName || p.username || p.sub || null;
  } catch {
    return null;
  }
}

function formatVND(amount) {
  return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
}

/* ── Page Header ─────────────────────────────────── */
function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef(null);

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
  const handleNavClick = (categoryId) => navigate('/', { state: { category: categoryId } });

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
          console.error('Lỗi lấy gợi ý:', err);
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">SmartAI Fashion</Link>
          <div className="search-wrap" ref={searchRef}>
            <span className="visually-hidden">Tìm kiếm sản phẩm</span>
            <FaSearch className="search-icon" aria-hidden />
            <input
              type="search" name="q"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              className="search-bar" autoComplete="off"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`);
                }
              }}
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
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle style={{ fontSize: '20px', color: 'var(--lp-accent)' }} />
                  )}
                  <span className="user-profile">{userLabel}</span>
                </button>
                <div className="profile-dropdown">
                  <Link to="/manage/Manageinvoice" className="profile-dropdown-item">
                    <FaBox /> Đơn mua
                  </Link>
                  <Link to="/user/UserProfile" className="profile-dropdown-item">
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
                  <button type="button" className="profile-dropdown-item logout" onClick={onLogout}>
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="link-muted">Đăng nhập</Link>
                <Link to="/register" className="btn-primary btn-header-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="main-nav" aria-label="Danh mục chính">
        <div className="container nav-links">
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories?.map((cat) => (
            <span key={cat.id} onClick={() => handleNavClick(cat.id)} style={{ cursor: 'pointer' }}>
              {cat.name}
            </span>
          ))}

          <Link
            to={
              localStorage.getItem('userRole')?.toLowerCase().includes('shop')
                ? '/shop-owner/store'
                : '/register-shop'
            }
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
              textTransform: 'uppercase',
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

/* ── Page Footer ─────────────────────────────────── */
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
            <li><Link to="/login">Tài khoản</Link></li>
            <li><a href="#main-content">Theo dõi đơn hàng</a></li>
            <li><a href="#main-content">Đổi trả &amp; bảo hành</a></li>
          </ul>
        </div>
        <div>
          <h3 className="lp-footer-title">Công ty</h3>
          <ul className="lp-footer-links">
            <li><a href="#main-content">Về chúng tôi</a></li>
            <li><a href="#main-content">Tuyển dụng</a></li>
            <li><a href="#main-content">Điều khoản</a></li>
          </ul>
        </div>
        <div className="lp-footer-social">
          <h3 className="lp-footer-title">Kết nối</h3>
          <div className="lp-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>
      <div className="lp-footer-bottom">
        <div className="container">© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</div>
      </div>
    </footer>
  );
}

/* ── Map raw API response → UI item ─────────────── */
function mapCartItem(item) {
  const variant = item.ProductVariants || item.productVariants || item.variant || {};
  const product = variant.Products || variant.products || variant.product || item.Product || item.product || {};
  const store = product.Stores || product.stores || product.Store || product.store || {};
  const images = product.ProductImages || product.productImages || [];
  const thumbnail = product.ThumbnailUrl || product.thumbnailUrl
    || (images[0]?.ImageUrl || images[0]?.imageUrl)
    || 'https://placehold.co/88x108/1e1b4b/818cf8?text=No+Image';

  return {
    cartItemId: item.CartItemId || item.cartItemId || item.id,
    variantId: item.VariantId || item.variantId,
    name: product.ProductName || product.productName || product.name || 'Sản phẩm',
    price: Number(variant.Price ?? variant.price ?? product.Price ?? product.price ?? 0),
    quantity: Number(item.Quantity || item.quantity || 1),
    size: variant.Size || variant.size || '—',
    color: variant.Color || variant.color || 'Mặc định',
    image: thumbnail,
    stock: Number(variant.Stock || variant.stock || 99),
    aiSuggest: item.aiSuggest || null,
    storeId: item.storeId || store.StoreId || store.id || 0,
    storeName: item.storeName || store.StoreName || store.name || 'Shop không tên',
  };
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // cartItemId[]

  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Preview state ──
  const [previewData, setPreviewData] = useState(null);  // data từ BE
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const previewDebounce = useRef(null);

  const navigate = useNavigate();

  // Nhóm giỏ hàng theo shop để hiển thị
  const groupedCart = useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      const sId = item.storeId || 0;
      if (!groups[sId]) {
        groups[sId] = {
          storeId: sId,
          storeName: item.storeName || 'Shop không tên',
          items: []
        };
      }
      groups[sId].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);


  const handleToggleShop = (shopId, isChecked) => {
    const shopItems = cartItems.filter(i => i.storeId === shopId).map(i => i.cartItemId);
    if (isChecked) {
      setSelectedItems(prev => [...new Set([...prev, ...shopItems])]);
    } else {
      setSelectedItems(prev => prev.filter(id => !shopItems.includes(id)));
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  /* ── Lifecycle ── */
  useEffect(() => {
    fetchCart();
    fetchCategories();
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.get('/users/profile');
      const profile = res.data;
      setUserLabel(profile.fullName || profile.email || profile.username || getUserDisplayNameFromToken());
      setUserAvatar(profile.avatarUrl || null);
    } catch (err) {
      console.error('Lỗi tải profile:', err);
      setUserLabel(getUserDisplayNameFromToken());
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories();
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setDbCategories(list);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  /* ── Fetch cart from API ── */
  const fetchCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      const response = await CartService.getCart();
      const data = response.data;

      // Backend có thể trả về: { cart, items, cartItems, totalAmount, shops } hoặc trực tiếp []
      let rawItems = [];
      if (Array.isArray(data)) {
        rawItems = data;
      } else if (data && typeof data === 'object') {
        if (data.shops && Array.isArray(data.shops)) {
          // Nếu backend trả về grouped (shops), ta flatten để lưu vào state cartItems
          rawItems = data.shops.flatMap(shop =>
            shop.items.map(item => ({
              ...item,
              storeId: shop.storeId,
              storeName: shop.storeName
            }))
          );
        } else {
          rawItems = data.cartItems || data.items || data.cart?.cartItems || [];
        }
      }

      const formatted = rawItems.map(mapCartItem);
      setCartItems(formatted);
      localStorage.setItem('local_cart', JSON.stringify(formatted));
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error);
      if (!error.response) {
        // Network error → dùng local cache
        const cached = JSON.parse(localStorage.getItem('local_cart') || '[]');
        setCartItems(cached);
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Update quantity (optimistic) ── */
  const handleUpdateQuantity = async (cartItemId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {

      toast.error(`Chỉ còn ${maxStock} sản phẩm trong kho!`);

      return;
    }
    const prev = cartItems;
    const next = cartItems.map(i =>
      i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i
    );
    setCartItems(next);
    localStorage.setItem('local_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));

    try {
      await CartService.updateCartItem(cartItemId, newQty);
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
      setCartItems(prev);
      localStorage.setItem('local_cart', JSON.stringify(prev));

      toast.error('Không thể cập nhật số lượng. Vui lòng thử lại!');
    }
  };

  /* ── Remove item ── */
  const handleRemoveItem = (cartItemId) => {
    setItemToDelete(cartItemId);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    // Tìm item info
    const itemInfo = cartItems.find(i => i.cartItemId === itemToDelete);

    const prev = cartItems;
    const next = cartItems.filter(i => i.cartItemId !== itemToDelete);
    setCartItems(next);
    setSelectedItems(s => s.filter(id => id !== itemToDelete));
    localStorage.setItem('local_cart', JSON.stringify(next));

    try {
      await CartService.removeCartItem(itemToDelete);
      window.dispatchEvent(new Event('cart-updated'));
      toast.success(`Đã xóa ${itemInfo?.name || 'sản phẩm'} khỏi giỏ hàng!`);
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      setCartItems(prev);
      localStorage.setItem('local_cart', JSON.stringify(prev));
      toast.error('Có lỗi khi xóa sản phẩm. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  /* ── Selection ── */
  const handleToggleItem = (cartItemId) =>
    setSelectedItems(prev =>
      prev.includes(cartItemId) ? prev.filter(id => id !== cartItemId) : [...prev, cartItemId]
    );

  const handleSelectAll = () =>
    setSelectedItems(
      selectedItems.length === cartItems.length && cartItems.length > 0
        ? []
        : cartItems.map(i => i.cartItemId)
    );

  /* ── Gọi Preview API ── */
  const callPreview = useCallback(async (appliedVoucher = '') => {
    if (selectedItems.length === 0) {
      setPreviewData(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const params = {
        type: 'CART',
        selectedItems,
      };
      const data = await CheckoutService.preview(params);
      setPreviewData(data);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Không thể tải thông tin đơn hàng';
      setPreviewError(msg);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedItems]);


  // Debounce preview khi selectedItems thay đổi
  useEffect(() => {
    if (previewDebounce.current) clearTimeout(previewDebounce.current);
    previewDebounce.current = setTimeout(() => {
      callPreview();
    }, 400);
    return () => clearTimeout(previewDebounce.current);
  }, [selectedItems, callPreview]);

  /* Voucher handlers removed */


  /* ── Checkout ── */
  const handleCheckout = () => {
    if (selectedItems.length === 0) {

      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
      return;
    }
    navigate('/checkout', {
      state: {
        type: 'CART',
        selectedItems,
      },
    });
  };

  /* ── Totals — ưu tiên dùng data từ BE preview, fallback tính local ── */
  const selectedCartItems = cartItems.filter(i => selectedItems.includes(i.cartItemId));
  const localSubtotal = selectedCartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const localDiscount = localSubtotal > 500000 ? 50000 : 0;
  const localShipping = localSubtotal > 0 ? 30000 : 0;
  const localTotal = localSubtotal > 0 ? localSubtotal - localDiscount + localShipping : 0;

  const subtotal = previewData ? previewData.total : localSubtotal;
  const discount = previewData ? previewData.discount : localDiscount;
  const shippingFee = previewData ? previewData.shippingFee : localShipping;
  const total = previewData ? previewData.finalTotal : localTotal;


  /* ── Loading state ── */
  if (loading) return (
    <div className="landing-page-container pd-shell">
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />
      <div className="cart-page-bg">
        <div className="cart-loading">
          <div className="cart-spinner" role="status" aria-label="Đang tải" />
          <p>Đang tải giỏ hàng của bạn...</p>
        </div>
      </div>
      <PageFooter />
    </div>
  );

  /* ── Render ── */
  return (
    <div className="landing-page-container pd-shell">
      <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />

      <div className="cart-page-bg">
        <div className="container cart-container-main">

          {/* Breadcrumb */}
          <nav className="cart-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="bc-sep">›</span>
            <span className="active">Giỏ hàng</span>
          </nav>

          <div className="cart-layout">
            {/* ── LEFT COL ── */}
            <div className="cart-left-col">
              <h1 className="cart-main-title">
                <FaShoppingCart className="cart-title-icon" />
                Giỏ hàng của bạn
                <span className="cart-count">({cartItems.length} sản phẩm)</span>
              </h1>

              {cartItems.length === 0 ? (
                /* EMPTY STATE */
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">🛒</div>
                  <h3>Giỏ hàng đang trống</h3>
                  <p>Hãy khám phá và thêm những sản phẩm yêu thích của bạn!</p>
                  <Link to="/" className="cart-empty-cta">
                    <FaShoppingBag /> Mua sắm ngay
                  </Link>
                </div>
              ) : (
                <div className="cart-items-wrapper">
                  {/* Select-all bar */}
                  <div className="cart-select-bar">
                    <input
                      id="select-all-cb"
                      type="checkbox"
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all-cb">
                      Chọn tất cả ({selectedItems.length}/{cartItems.length})
                    </label>
                  </div>

                  {groupedCart.map((shop) => (
                    <div key={shop.storeId} className="cart-shop-group">
                      {/* Shop Header */}
                      <div className="cart-shop-header">
                        <input
                          type="checkbox"
                          id={`shop-${shop.storeId}`}
                          checked={shop.items.every(i => selectedItems.includes(i.cartItemId))}
                          onChange={(e) => handleToggleShop(shop.storeId, e.target.checked)}
                        />
                        <label htmlFor={`shop-${shop.storeId}`} className="cart-shop-name">
                          <FaShoppingBag className="shop-icon" />
                          {shop.storeName}
                        </label>
                      </div>

                      {/* Items in this shop */}
                      <div className="cart-shop-items">
                        {shop.items.map((item) => (
                          <div
                            key={item.cartItemId}
                            className={`cart-item-card${selectedItems.includes(item.cartItemId) ? ' is-selected' : ''}`}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.cartItemId)}
                              onChange={() => handleToggleItem(item.cartItemId)}
                              aria-label={`Chọn ${item.name}`}
                            />

                            {/* Image */}
                            <img src={item.image} alt={item.name} className="cart-item-img" />

                            {/* Details */}
                            <div className="cart-item-details">
                              <h3 className="cart-item-name">{item.name}</h3>
                              <div className="cart-item-variant">
                                <span className="cart-badge">Size: {item.size}</span>
                                <span className="cart-badge">Màu: {item.color}</span>
                              </div>

                              {item.aiSuggest && (
                                <div className="cart-ai-suggest">
                                  <BsStars className="ai-icon" /> Gợi ý AI: {item.aiSuggest}
                                </div>
                              )}

                              {/* Quantity control */}
                              <div className="cart-qty-wrapper">
                                <button
                                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1, item.stock)}
                                  disabled={item.quantity <= 1}
                                  aria-label="Giảm số lượng"
                                >−</button>
                                <input type="text" value={item.quantity} readOnly aria-label="Số lượng" />
                                <button
                                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1, item.stock)}
                                  disabled={item.quantity >= item.stock}
                                  aria-label="Tăng số lượng"
                                >+</button>
                              </div>
                            </div>

                            {/* Right: price + delete */}
                            <div className="cart-item-right">
                              <button
                                className="cart-btn-trash"
                                onClick={() => handleRemoveItem(item.cartItemId)}
                                aria-label={`Xóa ${item.name}`}
                              >
                                <FaTrashAlt />
                              </button>
                              <div className="cart-price-info">
                                <span className="cart-unit-price">Đơn giá: {formatVND(item.price)}</span>
                                <span className="cart-total-line">{formatVND(item.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/" className="cart-continue-btn">
                <FaArrowLeft /> Tiếp tục mua sắm
              </Link>
            </div>

            {/* ── RIGHT COL: SUMMARY ── */}
            <div className="cart-right-col">
              <div className="cart-summary-box">
                <h2 className="summary-title">Tóm tắt đơn hàng</h2>

                {/* Voucher section removed */}

                {/* Preview error banner */}
                {previewError && !previewLoading && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecdd3',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 10,
                    fontSize: '0.8rem',
                    color: '#dc2626',
                  }}>
                    ⚠️ {previewError}
                  </div>
                )}

                {/* Calculations */}
                <div className="summary-calc">
                  <div className="calc-row">
                    <span>
                      {previewLoading
                        ? 'Đang tính...'
                        : `Tạm tính (${selectedItems.length} sản phẩm)`}
                    </span>
                    <span style={{ opacity: previewLoading ? 0.4 : 1 }}>
                      {formatVND(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="calc-row discount-row">
                      <span>
                        Giảm giá
                      </span>

                      <span>−{formatVND(discount)}</span>
                    </div>
                  )}
                  <div className="calc-row shipping-row">
                    <span>Phí vận chuyển</span>

                    <span style={{ opacity: previewLoading ? 0.4 : 1 }}>
                      {subtotal > 0 ? formatVND(shippingFee) : '—'}
                    </span>

                  </div>
                </div>

                {/* Total */}
                <div className="summary-total">
                  <div className="total-header">
                    <span>Tổng cộng</span>
                    <div className="total-price-col">
                      <span className="total-amount">{formatVND(total)}</span>
                      <span className="vat-note">(Đã bao gồm VAT nếu có)</span>
                    </div>
                  </div>

                  <button
                    id="btn-checkout"
                    className="btn-checkout-primary"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    <FaShoppingBag />
                    Thanh toán ({selectedItems.length} sản phẩm)
                  </button>


                  <div className="summary-notice">
                    <span className="notice-icon">🔒</span>
                    <p>Thanh toán an toàn qua Momo / ZaloPay. Miễn phí đổi trả trong 30 ngày.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="cart-modal-overlay">
          <div className="cart-modal-content">
            <h3 className="cart-modal-title">Xác nhận xóa</h3>
            <p className="cart-modal-msg">Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
            <div className="cart-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}