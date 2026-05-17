import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaTruck, FaRegCheckCircle, FaTimesCircle, FaBox,
  FaClock, FaMapMarkerAlt, FaCreditCard, FaFileInvoice, FaQuestionCircle,
  FaSearch, FaShoppingCart, FaUserCircle, FaUser, FaSignOutAlt,
  FaFacebookF, FaInstagram, FaYoutube, FaStore, FaTag, FaBell, FaTrash,
} from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { useNotification } from '../../hooks/useNotification';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { CategoryService } from '../../services/CategoryService';
import InvoiceDetailService from '../../services/InvoiceDetailService';
import { ShopProductService } from '../../services/ShopProductService';
import chatService from '../../services/chatService';
import './InvoiceDetail.css';
import '../LandingPage/LandingPage.css';
import '../ProductDetail/ProductDetail.css';
import '../ShoppingCart-AddtoCart/ShoppingCart.css';

// ─── Helpers ────────────────────────────────────────────
function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const p = jwtDecode(token);
    return p.email || p.name || p.fullName || 'Người dùng';
  } catch { return null; }
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount) || 0);

const mapStatusToVn = (status) => {
  switch ((status || '').trim().toLowerCase()) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đang chuẩn bị';
    case 'shipping': return 'Đang giao hàng';
    case 'completed': return 'Giao hàng thành công';
    case 'cancelled': return 'Đã hủy';
    default: return status || 'Đang xử lý';
  }
};

const getStatusClass = (status) => `status-${(status || '').toLowerCase()}`;

// ─── Page Header ─────────────────────────────────────────
function PageHeader({ userLabel, userAvatar, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
                <Link to="/user/UserProfile" className="user-profile-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      style={{ width: "24px", height: "24px", borderRadius: "50%", marginRight: "8px", objectFit: "cover" }}
                    />
                  ) : (
                    <FaUserCircle
                      style={{ fontSize: "20px", color: "var(--lp-accent)", marginRight: "8px" }}
                    />
                  )}
                  <span className="user-profile">{userLabel}</span>
                </Link>
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
          {dbCategories && dbCategories.map((cat) => (
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

// ─── Page Footer ─────────────────────────────────────────
function PageFooter() {
  return (
    <footer className="lp-footer">
      <div className="container lp-footer-grid">
        <div className="lp-footer-brand">
          <strong className="logo">SmartAI Fashion</strong>
          <p>Thời trang thông minh — thử đồ bằng AI, giao nhanh toàn quốc.</p>
        </div>
        <div>
          <h2 className="lp-footer-title">Hỗ trợ</h2>
          <ul className="lp-footer-links">
            <li><Link to="/login">Tài khoản</Link></li>
            <li><a href="#main-content">Theo dõi đơn hàng</a></li>
            <li><a href="#main-content">Đổi trả &amp; bảo hành</a></li>
          </ul>
        </div>
        <div>
          <h2 className="lp-footer-title">Công ty</h2>
          <ul className="lp-footer-links">
            <li><a href="#main-content">Về chúng tôi</a></li>
            <li><a href="#main-content">Tuyển dụng</a></li>
            <li><a href="#main-content">Điều khoản</a></li>
          </ul>
        </div>
        <div className="lp-footer-social">
          <h2 className="lp-footer-title">Kết nối</h2>
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

// ═══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function InvoiceDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbCategories, setDbCategories] = useState([]);
  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCategories();
    loadUser();
  }, [orderId]);

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await InvoiceDetailService.getOrderDetail(orderId);
      if (res.success) {
        setOrderData(res.data);
      } else {
        setError(res.error || 'Không tìm thấy đơn hàng.');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories();
      setDbCategories(Array.isArray(res) ? res : (res.data || []));
    } catch { }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      const res = await InvoiceDetailService.cancelOrder(orderId);
      if (res.success) {
        alert(res.message || 'Hủy đơn hàng thành công');
        fetchData(); // reload
      } else {
        alert(res.error || 'Không thể hủy đơn hàng vào lúc này.');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  const handleContactSeller = async (shopId) => {
    if (!shopId) return;
    try {
      setLoading(true);
      const res = await chatService.startChat(shopId);
      if (res && res.ConversationId) {
        navigate('/chat', { state: { conversationId: res.ConversationId } });
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      navigate('/chat');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ── Loading ──
  if (loading) return (
    <div className="id-loading">
      <div className="id-spinner" />
      <p>Đang tải chi tiết đơn hàng...</p>
    </div>
  );

  // ── Error / Not Found ──
  if (error || !orderData) return (
    <div className="id-loading">
      <FaTimesCircle style={{ fontSize: '48px', color: '#ef4444' }} />
      <p>{error || 'Không tìm thấy thông tin đơn hàng.'}</p>
      <Link to="/manage/Manageinvoice" className="id-btn id-btn-outline">Quay lại danh sách</Link>
    </div>
  );

  // ── Stepper ──
  const steps = [
    { id: 'pending', label: 'Chờ xác nhận', icon: <FaClock /> },
    { id: 'confirmed', label: 'Đang chuẩn bị', icon: <FaBox /> },
    { id: 'shipping', label: 'Đang giao', icon: <FaTruck /> },
    { id: 'completed', label: 'Đã nhận hàng', icon: <FaRegCheckCircle /> },
  ];

  const statusLower = (orderData.orderStatus || '').trim().toLowerCase();
  const currentStepIndex = steps.findIndex(s => s.id === statusLower);

  // ── Summary numbers (ưu tiên field từ real API, fallback tính lại) ──
  const subtotalFromItems = (orderData.items || []).reduce(
    (acc, i) => acc + (Number(i.total) || Number(i.price) * Number(i.quantity) || 0), 0
  );
  const subTotal = Number(orderData.subTotal ?? subtotalFromItems);
  const discountAmount = Number(orderData.discountAmount ?? orderData.discount ?? 0);
  const shippingFee = Number(orderData.shippingFee ?? 30000);
  const totalAmount = Number(orderData.totalAmount ?? 0);

  const canCancel = ['pending', 'confirmed'].includes(statusLower);

  return (
    <div className="pd-page-wrapper landing-page-container">
      <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />

      <main className="invoice-detail-page">
        <div className="container">

          {/* Breadcrumbs */}
          <nav className="id-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/manage/Manageinvoice">Đơn mua</Link>
            <span>/</span>
            <span className="id-breadcrumb-current">Chi tiết đơn hàng</span>
          </nav>

          {/* Header Card */}
          <div className="id-header">
            <div className="id-header-left">
              <button onClick={() => navigate(-1)} className="id-btn id-btn-outline"
                style={{ padding: '8px 16px', marginBottom: '16px' }}>
                <FaArrowLeft /> TRỞ LẠI
              </button>
              <h1>THÔNG TIN ĐƠN HÀNG #{orderData.orderId}</h1>
              <p>Ngày đặt: {orderData.createdAt
                ? new Date(orderData.createdAt).toLocaleString('vi-VN')
                : '—'}
              </p>
            </div>
            <div className="id-header-right">
              <span className={`id-status-badge ${getStatusClass(orderData.orderStatus)}`}>
                {mapStatusToVn(orderData.orderStatus)}
              </span>
            </div>
          </div>

          {/* Stepper — ẩn khi đã hủy */}
          {statusLower !== 'cancelled' && (
            <div className="id-stepper-card">
              <div className="id-stepper">
                {steps.map((step, idx) => (
                  <div key={step.id}
                    className={[
                      'id-step',
                      idx <= currentStepIndex ? 'active' : '',
                      idx < currentStepIndex ? 'completed' : '',
                    ].join(' ')}
                  >
                    <div className="id-step-icon">
                      {idx < currentStepIndex ? <FaRegCheckCircle /> : step.icon}
                    </div>
                    <div className="id-step-label">{step.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="id-info-grid">
            {/* Địa chỉ */}
            <div className="id-info-card">
              <div className="id-info-title"><FaMapMarkerAlt /> Địa chỉ nhận hàng</div>
              <div className="id-info-content">
                <Link to="/user/UserProfile" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{userLabel}</strong>
                </Link>
                <span>{orderData.shippingAddress || 'Chưa có địa chỉ'}</span>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="id-info-card">
              <div className="id-info-title"><FaCreditCard /> Phương thức thanh toán</div>
              <div className="id-info-content">
                <strong>{orderData.payment?.method || 'Thanh toán khi nhận hàng'}</strong>
                <span>
                  Trạng thái:{' '}
                  {orderData.paymentStatus?.toLowerCase() === 'paid'
                    ? '✅ Đã thanh toán'
                    : orderData.payment?.status?.toLowerCase() === 'success'
                      ? '✅ Đã thanh toán'
                      : '⏳ Chưa thanh toán'}
                </span>
                {orderData.payment?.transactionCode && (
                  <span>Mã GD: {orderData.payment.transactionCode}</span>
                )}
              </div>
            </div>

            {/* Hóa đơn */}
            <div className="id-info-card">
              <div className="id-info-title"><FaFileInvoice /> Thông tin hóa đơn</div>
              <div className="id-info-content">
                {orderData.invoice ? (
                  <>
                    <strong>Hóa đơn #{orderData.invoice.invoiceNumber}</strong>
                    <span>Ngày xuất: {orderData.createdAt
                      ? new Date(orderData.createdAt).toLocaleDateString('vi-VN')
                      : '—'}
                    </span>
                  </>
                ) : (
                  <span>Chưa có thông tin hóa đơn.</span>
                )}
              </div>
            </div>

            {/* Shop Info */}
            <div className="id-info-card">
              <div className="id-info-title"><FaStore /> Thông tin cửa hàng</div>
              <div className="id-info-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link to={`/shop/${orderData.store?.storeId}`}>
                    <img
                      src={orderData.store?.logo || `https://ui-avatars.com/api/?name=${orderData.store?.storeName}&background=random`}
                      alt="Shop"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--id-border)' }}
                    />
                  </Link>
                  <Link to={`/shop/${orderData.store?.storeId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{orderData.store?.storeName || 'Cửa hàng'}</strong>
                  </Link>
                </div>
                <span>Chuyên cung cấp thời trang cao cấp</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="id-items-card">
            <div className="id-table-header">
              <div>Sản phẩm</div>
              <div style={{ textAlign: 'center' }}>Đơn giá</div>
              <div style={{ textAlign: 'center' }}>Số lượng</div>
              <div style={{ textAlign: 'right' }}>Thành tiền</div>
            </div>
            <div className="id-table-body">
              {(orderData.items || []).map((item, idx) => (
                <div key={idx} className="id-product-row">
                  <div className="id-product-info">
                    <img
                      src={item.image || item.productImage || 'https://placehold.co/70x70/f1f5f9/64748b?text=SP'}
                      alt={item.productName}
                      className="id-product-img"
                    />
                    <div>
                      <div className="id-product-name">{item.productName || item.name}</div>
                      <div className="id-product-variant">Phân loại: {item.variant}</div>
                    </div>
                  </div>
                  <div className="id-price" style={{ textAlign: 'center' }}>
                    {formatCurrency(item.price)}
                  </div>
                  <div className="id-qty" style={{ textAlign: 'center' }}>
                    {item.quantity}
                  </div>
                  <div className="id-total" style={{ textAlign: 'right' }}>
                    {formatCurrency(item.total ?? (Number(item.price) * Number(item.quantity)))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Actions + Summary */}
          <div className="id-footer-layout">

            {/* Actions */}
            <div className="id-actions-card">
              <div className="id-info-title"><FaQuestionCircle /> Bạn cần hỗ trợ?</div>
              <div className="id-actions-buttons">
                <button
                  className="id-btn id-btn-outline"
                  onClick={() => handleContactSeller(orderData.store?.storeId)}
                >
                  <FiMessageCircle /> Liên hệ người bán
                </button>
                <button
                  className="id-btn id-btn-outline"
                  onClick={() => navigate(`/shop/${orderData.store?.storeId}`)}
                >
                  <FaStore /> Xem Shop
                </button>
              </div>
              <button className="id-btn id-btn-outline">Yêu cầu trả hàng / Hoàn tiền</button>
              {canCancel && (
                <button
                  className="id-btn id-btn-cancel"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? 'Đang hủy...' : 'HỦY ĐƠN HÀNG'}
                </button>
              )}
              {statusLower === 'completed' && (
                <button className="id-btn" style={{ background: '#0ea5e9', color: 'white' }}
                  onClick={() => navigate('/')}>
                  Mua lại
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="id-summary-card">
              <div className="summary-row">
                <span>Tổng tiền hàng:</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row">
                  <span>Giảm giá voucher ({orderData.discountPercent || 0}%):</span>
                  <span style={{ color: '#22c55e' }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
