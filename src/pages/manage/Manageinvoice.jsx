import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaClipboardList, FaBell, FaTicketAlt, FaCoins, 
  FaSearch, FaStore, FaTruck, FaRegCheckCircle, FaEdit,
  FaShoppingCart, FaUserCircle, FaBox, FaSignOutAlt,
  FaFacebookF, FaInstagram, FaYoutube, FaTimesCircle
} from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import invoiceService from '../../services/invoiceService';
import { CategoryService } from '../../services/CategoryService';
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

function PageHeader({ userLabel, dbCategories, onLogout }) {
  const navigate = useNavigate();

  const handleNavClick = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/');
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <>
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
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  <FaUserCircle style={{ fontSize: "20px", color: "var(--lp-accent)" }} />
                  <span className="user-profile">{userLabel}</span>
                </button>
                <div className="profile-dropdown">
                  <Link to="/manage/Manageinvoice" className="profile-dropdown-item">
                    <FaBox /> Đơn mua
                  </Link>
                  <Link to="/user/UserProfile" className="profile-dropdown-item">
                    <FaUser /> Trang cá nhân
                  </Link>
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
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories &&
            dbCategories.map((cat) => (
              <span key={cat.id} onClick={() => handleNavClick(cat.id)} style={{ cursor: 'pointer' }}>
                {cat.name}
              </span>
            ))}
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
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
              <Link to="#">Theo dõi đơn hàng</Link>
            </li>
            <li>
              <Link to="#">Đổi trả &amp; bảo hành</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="lp-footer-title">Công ty</h3>
          <ul className="lp-footer-links">
            <li>
              <Link to="#">Về chúng tôi</Link>
            </li>
            <li>
              <Link to="#">Tuyển dụng</Link>
            </li>
            <li>
              <Link to="#">Điều khoản</Link>
            </li>
          </ul>
        </div>
        <div className="lp-footer-social">
          <h3 className="lp-footer-title">Kết nối</h3>
          <div className="lp-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
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
  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  // ==================== AUTH & DATA FETCHING ====================
  useEffect(() => {
    fetchInvoices();
    fetchCategories();
  }, []);

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
      const response = await invoiceService.getAllInvoices();
      if (response.success) {
        const rawData = response.data || [];
        
        // Ánh xạ dữ liệu từ Backend sang định dạng FE mong đợi
        const mappedInvoices = rawData.map(order => {
          // Các trạng thái đơn hàng từ Backend (giả định)
          const beStatus = (order.orderStatus || 'pending').toLowerCase();
          
          let feStatus = 'pending_payment';
          let feStatusText = 'Chờ xử lý';

          if (beStatus === 'pending') {
            feStatus = 'pending_payment';
            feStatusText = 'Chờ xử lý';
          } else if (beStatus === 'confirmed' || beStatus === 'processing') {
            feStatus = 'shipping';
            feStatusText = 'Đang xử lý';
          } else if (beStatus === 'shipping') {
            feStatus = 'receiving';
            feStatusText = 'Đang giao hàng';
          } else if (beStatus === 'completed' || beStatus === 'delivered') {
            feStatus = 'completed';
            feStatusText = 'Hoàn thành';
          } else if (beStatus === 'cancelled') {
            feStatus = 'cancelled';
            feStatusText = 'Đã hủy';
          }

          return {
            id: order.orderId ? `ORD${order.orderId}` : order.id,
            shopName: order.storeName || order.shopName || 'Cửa hàng hệ thống',
            status: feStatus,
            statusText: feStatusText,
            items: (order.orderItems || order.items || []).map(item => ({
                id: item.variantId || item.id,
                name: item.productName || item.name || 'Sản phẩm',
                image: item.productImage || item.thumbnailUrl || item.image || 'https://via.placeholder.com/150',
                variant: `${item.size || ''} ${item.color ? '| ' + item.color : ''}`.trim() || 'Mặc định',
                price: item.price || 0,
                quantity: item.quantity || 1
            })),
            finalAmount: order.totalAmount || 0,
            date: order.createdAt
          };
        });

        setInvoices(mappedInvoices);
      }
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERED DATA ====================
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      const res = await invoiceService.cancelOrder(orderId);
      if (res.success) {
        // Cập nhật local state ngay lập tức
        setInvoices(prev => prev.map(inv =>
          inv.id === orderId
            ? { ...inv, status: 'cancelled', statusText: 'Đã hủy' }
            : inv
        ));
        alert('Hủy đơn hàng thành công!');
      } else {
        alert(res.error || 'Không thể hủy đơn hàng.');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
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
    { id: 'all',       label: 'Tất cả' },
    { id: 'pending',   label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đang chuẩn bị' },
    { id: 'shipping',  label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="pd-page-wrapper">
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />
      
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
                <div className="user-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${userLabel || 'User'}&background=0ea5e9&color=fff`} alt="Avatar" />
                </div>
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
                    <span>Ngân hàng</span>
                    <span>Địa chỉ</span>
                    <span>Đổi mật khẩu</span>
                  </div>
                </div>

                <div className="menu-item-single active-link">
                  <div className="menu-icon orders-icon"><FaClipboardList /></div>
                  <span>Đơn mua</span>
                </div>

                <div className="menu-item-single">
                  <div className="menu-icon notify-icon"><FaBell /></div>
                  <span>Thông báo</span>
                </div>

                <div className="menu-item-single">
                  <div className="menu-icon voucher-icon"><FaTicketAlt /></div>
                  <span>Kho Voucher</span>
                </div>

                <div className="menu-item-single">
                  <div className="menu-icon coin-icon"><FaCoins /></div>
                  <span>Shopee Xu</span>
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
                          <span className="shop-badge-mall">Mall</span>
                          <span className="shop-name-text">{order.shopName}</span>
                          <button className="visit-shop-btn"><FaStore /> Xem Shop</button>
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
                          <button className="pd-btn pd-btn-outline btn-sm">Liên hệ người bán</button>
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
    </div>
  );
}
