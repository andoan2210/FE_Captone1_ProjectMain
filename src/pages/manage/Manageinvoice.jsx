import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaClipboardList, FaBell, FaTicketAlt, FaCoins,
  FaSearch, FaStore, FaTruck, FaRegCheckCircle, FaEdit,
  FaShoppingCart, FaUserCircle, FaBox, FaSignOutAlt,
  FaFacebookF, FaInstagram, FaYoutube, FaTimesCircle, FaTrash
} from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { useNotification } from '../../hooks/useNotification';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import InvoiceService from '../../services/InvoiceService';
import { CategoryService } from '../../services/CategoryService';
import { ShopProductService } from '../../services/ShopProductService';
import * as CartService from '../../services/CartService';
import chatService from '../../services/chatService';
import ConfirmModal from '../../components/shop-owner/ConfirmModal';
import { toast } from 'react-hot-toast';
import '../LandingPage/LandingPage.css';
import '../ProductDetail/ProductDetail.css';
import '../ShoppingCart-AddtoCart/ShoppingCart.css';
import './Manageinvoice.css';

function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = jwtDecode(token)
    return (
      payload.email ||
      payload.name ||
      payload.fullName ||
      payload.username ||
      payload.sub ||
      null
    )
  } catch {
    return null
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

export default function Manageinvoice() {
  const navigate = useNavigate();
  // ==================== STATE ====================
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userEmail, setUserEmail] = useState("");

  const [dbCategories, setDbCategories] = useState([]);
  const [userLabel, setUserLabel] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  // Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  // ==================== AUTH & DATA FETCHING ====================
  useEffect(() => {
    fetchInvoices();
    fetchCategories();
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/users/profile");
      const profile = res.data;
      setUserLabel(profile.fullName || profile.email || profile.username || getUserDisplayNameFromToken());
      setUserAvatar(profile.avatarUrl || null);
    } catch (err) {
      console.error("Lỗi tải profile:", err);
      setUserLabel(getUserDisplayNameFromToken());
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories();
      const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
      setDbCategories(list);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await InvoiceService.getAllInvoices();
      if (response.success) {
        const rawData = response.data || [];

        // Ánh xạ dữ liệu từ Backend sang định dạng FE mong đợi
        const mappedInvoices = rawData.map(order => {
          // Các trạng thái đơn hàng từ Backend
          const beStatus = (order.orderStatus || 'pending').toLowerCase();

          let feStatus = 'pending';
          let feStatusText = 'Chờ xác nhận';

          if (beStatus === 'pending') {
            feStatus = 'pending';
            feStatusText = 'Chờ xác nhận';
          } else if (beStatus === 'confirmed') {
            feStatus = 'confirmed';
            feStatusText = 'Đang chuẩn bị';
          } else if (beStatus === 'shipping') {
            feStatus = 'shipping';
            feStatusText = 'Đang giao hàng';
          } else if (beStatus === 'completed' || beStatus === 'delivered') {
            feStatus = 'completed';
            feStatusText = 'Hoàn thành';
          } else if (beStatus === 'cancelled') {
            feStatus = 'cancelled';
            feStatusText = 'Đã hủy';
          }

          return {
            id: order.orderId ? order.orderId : order.id,
            displayId: order.orderId ? `ORD${order.orderId}` : order.id,
            shopName: order.store?.storeName || order.shopName || 'Cửa hàng hệ thống',
            shopLogo: order.store?.logo || null,
            storeId: order.store?.storeId || order.storeId,
            ownerId: order.store?.ownerId || order.ownerId,
            status: feStatus,
            statusText: feStatusText,
            items: (order.items || []).map(item => ({
              id: item.variantId || item.id,
              name: item.productName || item.name || 'Sản phẩm',
              image: item.productImage || item.image || 'https://via.placeholder.com/150',
              variant: item.variant || 'Mặc định',
              price: Number(item.unitPrice || item.price || 0),
              quantity: item.quantity || 1
            })),
            finalAmount: Number(order.totalAmount || 0),
            date: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
            rawDate: order.createdAt
          };
        });

        setInvoices(mappedInvoices);
      }
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng.');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
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

  // ==================== FILTERED DATA ====================
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Sắp xếp: Đơn hàng mới nhất luôn hiển thị lên đầu (trong tất cả các tab)
    result.sort((a, b) => {
      const dateA = new Date(a.rawDate || 0).getTime();
      const dateB = new Date(b.rawDate || 0).getTime();
      return dateB - dateA;
    });

    if (activeTab !== 'all') {
      result = result.filter(inv => inv.status?.toLowerCase() === activeTab);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(inv =>
        (inv.id || '').toString().toLowerCase().includes(term) ||
        (inv.shopName || '').toLowerCase().includes(term) ||
        (inv.items || []).some(item => (item.name || '').toLowerCase().includes(term))
      );
    }

    return result;
  }, [invoices, activeTab, searchTerm]);

  // Đếm số đơn theo tab
  const tabCounts = useMemo(() => {
    const counts = { all: invoices.length };
    invoices.forEach(inv => {
      const s = inv.status?.toLowerCase();
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  // ==================== HANDLERS ====================
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const executeCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      setLoading(true);
      const res = await InvoiceService.cancelOrder(cancelOrderId);
      if (res.success) {
        // Cập nhật local state ngay lập tức
        setInvoices(prev => prev.map(inv =>
          inv.id === cancelOrderId
            ? { ...inv, status: 'cancelled', statusText: 'Đã hủy' }
            : inv
        ));
        toast.success('Hủy đơn hàng thành công!');
      } else {
        toast.error(res.error || 'Không thể hủy đơn hàng.');
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setShowCancelModal(false);
      setCancelOrderId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Đang tải đơn hàng của bạn...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đang chuẩn bị' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="pd-page-wrapper landing-page-container">
      <PageHeader userLabel={userLabel} userAvatar={userAvatar} dbCategories={dbCategories} onLogout={handleLogout} />

      <main className="manage-invoice-main">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="pd-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="pd-sep">/</span>
            <span className="pd-current">Đơn mua</span>
          </nav>

          <div className="orders-layout">
            {/* LEFT SIDEBAR */}
            <aside className="orders-sidebar">
              <div className="user-brief">
                <Link to="/user/UserProfile" className="user-avatar">
                  <img
                    src={userAvatar || `https://ui-avatars.com/api/?name=${userLabel || 'User'}&background=0ea5e9&color=fff`}
                    alt="Avatar"
                  />
                </Link>
                <div className="user-info">
                  <div className="username">{userLabel || 'Người dùng'}</div>
                  <Link to="/user/UserProfile" className="edit-profile">
                    <FaEdit /> Sửa hồ sơ
                  </Link>
                </div>
              </div>

              <nav className="sidebar-menu">
                <div className="menu-group">
                  <div className="menu-item-group-header">
                    <div className="menu-icon profile-icon"><FaUser /></div>
                    <span>Tài khoản của tôi</span>
                  </div>
                  <div className="sub-menu">
                    <Link to="/user/UserProfile">Hồ sơ</Link>
                  </div>
                </div>

                <div className="menu-item-single active-link">
                  <div className="menu-icon orders-icon"><FaClipboardList /></div>
                  <span>Đơn mua</span>
                </div>


              </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="orders-main-content">
              {/* TABS */}
              <nav className="orders-tabs-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {tabCounts[tab.id] > 0 && (
                      <span className="tab-count-badge">{tabCounts[tab.id]}</span>
                    )}
                  </button>
                ))}
              </nav>

              {/* SEARCH */}
              <div className="orders-search-input-wrap">
                <FaSearch className="search-icon-fixed" />
                <input
                  type="text"
                  placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* ORDERS LIST */}
              <div className="orders-cards-list">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map(order => (
                    <div key={order.id} className="premium-order-card">
                      <div className="order-card-top">
                        <div className="shop-info-wrap">
                          <Link to={`/shop/${order.storeId}`} className="shop-logo-link">
                            <img
                              src={order.shopLogo || `https://ui-avatars.com/api/?name=${order.shopName}&background=random`}
                              alt={order.shopName}
                              className="shop-logo-img"
                            />
                          </Link>
                          <Link to={`/shop/${order.storeId}`} className="shop-name-text">
                            {order.shopName}
                          </Link>
                          <button
                            className="visit-shop-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shop/${order.storeId}`);
                            }}
                          >
                            <FaStore /> Xem Shop
                          </button>
                        </div>
                        <div className="order-status-indicator">
                          <FaTruck className="truck-icon-blue" />
                          <span className="status-text-blue">{order.statusText}</span>
                          <span className="vertical-sep">|</span>
                          <span className="status-label-highlight">{order.status === 'completed' ? 'HOÀN THÀNH' : order.statusText.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="order-card-mid">
                        {order.items.map(item => (
                          <div key={item.id} className="order-item-row">
                            <div className="order-item-img-box">
                              <img
                                src={item.image || 'https://placehold.co/90x90/f1f5f9/64748b?text=SP'}
                                alt={item.name}
                                onError={e => { e.target.src = 'https://placehold.co/90x90/f1f5f9/64748b?text=SP'; }}
                              />
                            </div>
                            <div className="order-item-info">
                              <div className="item-name-bold">{item.name}</div>
                              <div className="item-variant-text">Phân loại: {item.variant}</div>
                              <div className="item-qty-text">x{item.quantity}</div>
                            </div>
                            <div className="item-price-val">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        ))}
                        {order.date && (
                          <div className="order-date-row">Ngày đặt: {order.date}</div>
                        )}
                      </div>

                      <div className="order-card-bottom">
                        <div className="total-pay-row">
                          <span className="pay-label">Thành tiền:</span>
                          <span className="pay-amount">{formatCurrency(order.finalAmount)}</span>
                        </div>
                        <div className="actions-buttons-row">
                          {order.status === 'completed' && (
                            <button className="pd-btn pd-btn-primary btn-sm" onClick={() => navigate('/')}>Mua Lại</button>
                          )}
                          {['pending', 'confirmed'].includes(order.status?.toLowerCase()) && (
                            <button
                              className="pd-btn btn-sm"
                              style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Hủy đơn
                            </button>
                          )}
                          <button
                            className="pd-btn pd-btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactSeller(order.storeId);
                            }}
                          >
                            Liên hệ người bán
                          </button>
                          <button
                            className="pd-btn pd-btn-outline btn-sm"
                            onClick={() => navigate(`/manage/invoice-detail/${order.id}`)}
                          >
                            Xem Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="orders-empty-state">
                    <div className="empty-state-icon"><FaClipboardList /></div>
                    <p>
                      {activeTab === 'all'
                        ? 'Bạn chưa có đơn hàng nào'
                        : `Không có đơn hàng ở trạng thái "${tabs.find(t => t.id === activeTab)?.label}"`}
                    </p>
                    <button className="empty-cta-btn" onClick={() => navigate('/')}>
                      Mua sắm ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={executeCancelOrder}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        confirmText="Xác nhận hủy"
        cancelText="Để tôi xem lại"
      />
    </div>
  );
}
