import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaTruck, FaRegCheckCircle, FaTimesCircle, FaBox,
  FaClock, FaMapMarkerAlt, FaCreditCard, FaFileInvoice, FaQuestionCircle,
  FaSearch, FaShoppingCart, FaUserCircle, FaUser, FaSignOutAlt,
  FaFacebookF, FaInstagram, FaYoutube, FaStore, FaTag,
} from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { CategoryService } from '../../services/CategoryService';
import InvoiceDetailService from '../../services/InvoiceDetailService';
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
function PageHeader({ userLabel, dbCategories, onLogout }) {
  const navigate = useNavigate();
  const handleNavClick = (cat) => cat === 'all' ? navigate('/') : navigate(`/category/${cat}`);

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo">SmartAI Fashion</Link>
          <label className="search-wrap">
            <FaSearch className="search-icon" aria-hidden />
            <input type="search" placeholder="Tìm kiếm sản phẩm, thương hiệu..." className="search-bar" />
          </label>
          <div className="user-actions">
            <Link to="/cart" className="icon-link"><FaShoppingCart /></Link>
            {userLabel ? (
              <div className="user-profile-wrapper">
                <button type="button" className="user-profile-btn">
                  <FaUserCircle style={{ fontSize: '20px', color: 'var(--lp-accent)' }} />
                  <span className="user-profile">{userLabel}</span>
                </button>
                <div className="profile-dropdown">
                  <Link to="/manage/Manageinvoice" className="profile-dropdown-item"><FaBox /> Đơn mua</Link>
                  <Link to="/user/UserProfile" className="profile-dropdown-item"><FaUser /> Trang cá nhân</Link>
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
      <nav className="main-nav">
        <div className="container nav-links">
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>TẤT CẢ DANH MỤC</span>
          {dbCategories?.map((cat) => (
            <span key={cat.id} onClick={() => handleNavClick(cat.id)} style={{ cursor: 'pointer' }}>{cat.name}</span>
          ))}
          <span className="text-red">BST Thu Đông</span>
          <span className="flash-sale">⚡ Flash Sale</span>
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
          <h3 className="lp-footer-title">Hỗ trợ</h3>
          <ul className="lp-footer-links">
            <li><Link to="/login">Tài khoản</Link></li>
            <li><a href="#">Theo dõi đơn hàng</a></li>
          </ul>
        </div>
        <div className="lp-footer-social">
          <h3 className="lp-footer-title">Kết nối</h3>
          <div className="lp-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
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
  const [cancelling, setCancelling] = useState(false);

  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, [orderId]);

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
    <div className="pd-page-wrapper">
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />

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
                <strong>{userLabel}</strong>
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
                {orderData.voucher && (
                  <span>
                    <FaTag style={{ marginRight: 4 }} />
                    Voucher: {orderData.voucher.code} (-{orderData.voucher.discountPercent}%)
                  </span>
                )}
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
              <button className="id-btn id-btn-outline">Liên hệ người bán</button>
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
