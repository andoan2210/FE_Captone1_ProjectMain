import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaClipboardList, FaBell, FaTicketAlt, FaCoins, 
  FaSearch, FaStore, FaQuestionCircle, FaTruck, FaRegCheckCircle,
  FaTimesCircle, FaWallet, FaEdit, FaChevronRight
} from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import invoiceService from '../../services/invoiceService';
import './Manageinvoice.css';

export default function Manageinvoice() {
  const navigate = useNavigate();
  // ==================== STATE ====================
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userLabel, setUserLabel] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // ==================== AUTH & DATA FETCHING ====================
  useEffect(() => {
    // Get user info from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserLabel(decoded.name || decoded.sub?.split('@')[0] || "Người dùng");
        setUserEmail(decoded.email || decoded.sub || "");
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getMockInvoices();
      if (response.success) {
        setInvoices(response.data || []);
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
    
    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter(inv => inv.status === activeTab);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(inv => 
        inv.id.toLowerCase().includes(term) ||
        inv.shopName.toLowerCase().includes(term) ||
        inv.items.some(item => item.name.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [invoices, activeTab, searchTerm]);

  // ==================== HANDLERS ====================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
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
    { id: 'pending_payment', label: 'Chờ thanh toán' },
    { id: 'shipping', label: 'Vận chuyển' },
    { id: 'receiving', label: 'Chờ giao hàng' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  return (
    <div className="shopee-orders-page">
      <div className="container">
        <div className="orders-layout">
          {/* LEFT SIDEBAR */}
          <aside className="orders-sidebar">
            <div className="user-brief">
              <div className="user-avatar">
                <img src={`https://ui-avatars.com/api/?name=${userLabel}&background=0056b3&color=fff`} alt="Avatar" />
              </div>
              <div className="user-info">
                <div className="username">{userLabel}</div>
                <Link to="/user/UserProfile" className="edit-profile">
                  <FaEdit /> Sửa hồ sơ
                </Link>
              </div>
            </div>

            <nav className="sidebar-menu">
              <div className="menu-group">
                <div className="menu-item active">
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

              <div className="menu-item active-link">
                <div className="menu-icon orders-icon"><FaClipboardList /></div>
                <span>Đơn mua</span>
              </div>

              <div className="menu-item">
                <div className="menu-icon notify-icon"><FaBell /></div>
                <span>Thông báo</span>
              </div>

              <div className="menu-item">
                <div className="menu-icon voucher-icon"><FaTicketAlt /></div>
                <span>Kho Voucher</span>
              </div>

              <div className="menu-item">
                <div className="menu-icon coin-icon"><FaCoins /></div>
                <span>Shopee Xu</span>
              </div>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="orders-main">
            {/* TABS */}
            <nav className="orders-tabs">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* SEARCH */}
            <div className="orders-search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ORDERS LIST */}
            <div className="orders-list">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="shop-info">
                        <span className="shop-badge">Mall</span>
                        <span className="shop-name">{order.shopName}</span>
                        <button className="chat-btn"><FaStore /> Xem Shop</button>
                      </div>
                      <div className="order-status">
                        <FaTruck className="truck-icon" />
                        <span className="status-text">{order.statusText}</span>
                        <span className="separator">|</span>
                        <span className="status-highlight">{order.status === 'completed' ? 'HOÀN THÀNH' : order.status.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="order-card-body">
                      {order.items.map(item => (
                        <div key={item.id} className="product-item">
                          <div className="product-img">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="product-details">
                            <div className="product-name">{item.name}</div>
                            <div className="product-variant">Phân loại hàng: {item.variant}</div>
                            <div className="product-qty">x{item.quantity}</div>
                          </div>
                          <div className="product-price">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="total-payment">
                        <span className="total-label">Thành tiền:</span>
                        <span className="total-value">{formatCurrency(order.finalAmount)}</span>
                      </div>
                      <div className="order-actions">
                        {order.status === 'completed' && <button className="btn-buy-again">Mua Lại</button>}
                        <button className="btn-contact">Liên hệ Người bán</button>
                        <button className="btn-view-detail">Xem Chi tiết Đơn hàng</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-orders">
                  <div className="empty-icon"><FaClipboardList /></div>
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
