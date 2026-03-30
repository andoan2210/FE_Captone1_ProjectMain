import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaArrowLeft, FaShoppingCart, FaSearch, FaBell, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { jwtDecode } from 'jwt-decode';
import * as CartService from '../../services/CartService.js';
import '../LandingPage/LandingPage.css';
import '../ProductDetail/ProductDetail.css';
import './ShoppingCart.css';

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

function PageHeader({ userLabel, onLogout }) {
  const navigate = useNavigate();

  const handleNavClick = (categoryId) => {
    navigate('/', { state: { category: categoryId } });
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
              placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc từ khóa..."
              className="search-bar"
              autoComplete="off"
            />
          </label>
          <div className="user-actions">
            <button type="button" className="icon-link pd-icon-badge-wrap" aria-label="Thông báo">
              <FaBell />
              <span className="pd-nav-dot" aria-hidden />
            </button>
            <Link to="/cart" className="icon-link pd-icon-badge-wrap" aria-label="Giỏ hàng">
              <FaShoppingCart />
            </Link>
            {userLabel ? (
              <>
                <span className="user-profile">{userLabel}</span>
                <button type="button" className="btn-link" onClick={onLogout}>
                  Đăng xuất
                </button>
              </>
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

      <nav className="main-nav pd-main-nav" aria-label="Danh mục chính">
        <div className="container nav-links">
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>TẤT CẢ DANH MỤC</span>
          <span onClick={() => handleNavClick('men')} style={{ cursor: 'pointer' }}>Thời trang Nam</span>
          <span onClick={() => handleNavClick('women')} style={{ cursor: 'pointer' }}>Thời trang Nữ</span>
          <span onClick={() => handleNavClick('shoes')} style={{ cursor: 'pointer' }}>Giày dép</span>
          <span>Túi xách</span>
          <span onClick={() => handleNavClick('accessories')} style={{ cursor: 'pointer' }}>Phụ kiện</span>
          <span>Đồ thể thao</span>
          <span className="text-red">BST Thu Đông</span>
          <span className="text-red">Đồ hiệu sale</span>
          <span className="flash-sale">⚡ Flash Sale</span>
        </div>
      </nav>
    </>
  )
}

function PageFooter() {
  return (
    <footer className="lp-footer pd-footer-tight">
      <div className="container lp-footer-grid">
        <div className="lp-footer-brand">
          <Link to="/" className="logo">
            SmartAI Fashion
          </Link>
          <p>
            Nền tảng thương mại điện tử ứng dụng AI — thử đồ ảo, gợi ý phong cách và giao hàng toàn quốc.
          </p>
        </div>
        <div>
          <h3 className="lp-footer-title">Chăm sóc khách hàng</h3>
          <ul className="lp-footer-links">
            <li><a href="#main-pd">Trung tâm trợ giúp</a></li>
            <li><a href="#main-pd">Hướng dẫn mua hàng</a></li>
            <li><a href="#main-pd">Chính sách vận chuyển</a></li>
            <li><a href="#main-pd">Đổi trả &amp; bảo hành</a></li>
          </ul>
        </div>
        <div>
          <h3 className="lp-footer-title">Về SmartAI Fashion</h3>
          <ul className="lp-footer-links">
            <li><a href="#main-pd">Giới thiệu</a></li>
            <li><a href="#main-pd">Tuyển dụng</a></li>
            <li><a href="#main-pd">Điều khoản sử dụng</a></li>
            <li><a href="#main-pd">Chính sách bảo mật</a></li>
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
        <div className="container pd-footer-bottom-inner">
          <span>© {new Date().getFullYear()} SmartAI Fashion. Đồ án Capstone FE.</span>
          <span className="pd-footer-meta">Server: Ho Chi Minh City · Ngôn ngữ: Tiếng Việt</span>
        </div>
      </div>
    </footer>
  )
}
export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();

  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      // Gọi API lấy giỏ hàng của BE
      const response = await CartService.getCart();
      const data = response.data;
      
      console.log("Dữ liệu giỏ hàng nhận từ Backend:", data);

      // Hỗ trợ cả trường hợp BE trả về mảng trực tiếp hoặc object chứa mảng { cartItems: [...] }
      let items = [];
      if (typeof data === 'string') {
        console.warn("Backend đang trả về chuỗi text placeholder:", data);
        // Nếu nhận được text "This action returns all cart", nghĩa là BE chưa code xong phần lấy dữ liệu thật
        items = []; 
      } else {
        items = Array.isArray(data) ? data : (data.cartItems || data.items || []);
      }

      if (items.length > 0) {
        const formattedCart = items.map(item => {
          // Xử lý dữ liệu lồng nhau từ Prisma (ProductVariants -> Products)
          // Ưu tiên PascalCase từ SQL Server (item.ProductVariants, item.Quantity...)
          const variant = item.ProductVariants || item.variant || {};
          const product = variant.Products || variant.product || item.Product || {};
          
          return {
            cartItemId: item.CartItemId || item.id,
            variantId: item.VariantId || item.variantId,
            name: product.ProductName || product.name || 'Sản phẩm',
            price: variant.Price || product.Price || product.price || 0,
            quantity: item.Quantity || item.quantity || 1,
            size: variant.Size || variant.size || 'M',
            color: variant.Color || variant.color || 'Mặc định',
            image: product.ThumbnailUrl || product.thumbnail || product.image || 'https://via.placeholder.com/150',
            stock: variant.Stock || variant.stock || 50,
            aiSuggest: item.aiSuggest || null,
          };
        });
        setCartItems(formattedCart);
        // Cập nhật LocalStorage chỉ để cache, không dùng làm nguồn tin cậy
        localStorage.setItem('local_cart', JSON.stringify(formattedCart));
      } else {
        // Nếu BE trả về rỗng, tức là giỏ hàng thực sự rỗng
        setCartItems([]);
        localStorage.removeItem('local_cart');
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng từ API:', error);
      // Chỉ fallback sang local khi API thực sự lỗi mạng (Network Error)
      if (!error.response) {
        const localCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
        setCartItems(localCart);
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
        alert(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
        return;
    }

    // 1. Cập nhật UI ngay lập tức (Optimistic Update)
    const originalCart = [...cartItems];
    const updatedCart = cartItems.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('local_cart', JSON.stringify(updatedCart));

    // 2. Gọi API để Backend cập nhật DB thật
    try {
      await CartService.updateCartItem(cartItemId, newQuantity);
      console.log(`Đã cập nhật số lượng item ${cartItemId} thành ${newQuantity} trong DB.`);
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng ở Backend:', error);
      // Nếu API lỗi, hoàn tác lại UI để tránh sai lệch dữ liệu
      setCartItems(originalCart); 
      localStorage.setItem('local_cart', JSON.stringify(originalCart));
      alert('Không thể cập nhật số lượng. Vui lòng thử lại sau!');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    // 1. Lưu lại bản sao lưu để hoàn tác nếu lỗi
    const originalCart = [...cartItems];

    // 2. Cập nhật UI và LocalStorage trước (Optimistic)
    const updatedCart = cartItems.filter(item => item.cartItemId !== cartItemId);
    setCartItems(updatedCart);
    localStorage.setItem('local_cart', JSON.stringify(updatedCart));

    // 3. Gọi API để Backend xóa trong DB
    try {
      await CartService.removeCartItem(cartItemId);
      console.log(`Đã xóa item ${cartItemId} khỏi Database.`);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm ở Backend:', error);
      // Hoàn tác nếu API lỗi
      setCartItems(originalCart);
      localStorage.setItem('local_cart', JSON.stringify(originalCart));
      alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại!');
    }
  };

  // Tính toán giỏ hàng
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = subtotal > 0 ? 50000 : 0; 
  const shippingFee = subtotal > 0 ? 30000 : 0; 
  const total = subtotal > 0 ? subtotal - discount + shippingFee : 0;

  if (loading) return (
    <div className="landing-page-container pd-shell">
      <PageHeader userLabel={userLabel} onLogout={handleLogout} />
      <div className="cart-page-bg" style={{ minHeight: '60vh' }}>
        <div className="cart-loading">Đang tải giỏ hàng...</div>
      </div>
      <PageFooter />
    </div>
  );

  return (
    <div className="landing-page-container pd-shell">
      <PageHeader userLabel={userLabel} onLogout={handleLogout} />
      <div className="cart-page-bg">
      <div className="container cart-container-main">
        <nav className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="bc-sep">&gt;</span>
          <span className="active">Giỏ hàng</span>
        </nav>

        <div className="cart-layout">
          <div className="cart-left-col">
            <h1 className="cart-main-title">
              <FaShoppingCart className="cart-title-icon" /> 
              Giỏ hàng của bạn <span className="cart-count">({cartItems.length} sản phẩm)</span>
            </h1>

            {cartItems.length === 0 ? (
              <div className="cart-empty-state">Giỏ hàng trống</div>
            ) : (
              <div className="cart-items-wrapper">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="cart-item-card">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-variant">Size: {item.size}, Màu: {item.color}</p>
                      
                      {item.aiSuggest && (
                        <div className="cart-ai-suggest">
                          <BsStars className="ai-icon" /> Gợi ý AI: {item.aiSuggest}
                        </div>
                      )}

                      <div className="cart-qty-wrapper">
                        <button onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1, item.stock)}>-</button>
                        <input type="text" value={item.quantity} readOnly />
                        <button onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1, item.stock)}>+</button>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <button className="cart-btn-trash" onClick={() => handleRemoveItem(item.cartItemId)}>
                        <FaTrashAlt />
                      </button>
                      <div className="cart-price-info">
                        <span className="cart-unit-price">Đơn giá: {item.price.toLocaleString('vi-VN')} đ</span>
                        <span className="cart-total-line">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/" className="cart-continue-btn">
              <FaArrowLeft /> Tiếp tục mua sắm
            </Link>
          </div>

          <div className="cart-right-col">
            <div className="cart-summary-box">
              <h2 className="summary-title">Tóm tắt đơn hàng</h2>
              
              <div className="summary-voucher">
                <label>MÃ GIẢM GIÁ</label>
                <div className="voucher-input-group">
                  <input 
                    type="text" 
                    placeholder="Nhập mã voucher" 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <button className="btn-apply">Áp dụng</button>
                </div>
              </div>

              <div className="summary-calc">
                <div className="calc-row">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="calc-row discount-row">
                  <span>Giảm giá</span>
                  <span>-{discount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="calc-row">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div className="summary-total">
                <div className="total-header">
                  <span>Tổng cộng</span>
                  <div className="total-price-col">
                    <span className="total-amount">{total.toLocaleString('vi-VN')} đ</span>
                    <span className="vat-note">(Đã bao gồm VAT nếu có)</span>
                  </div>
                </div>
                <button className="btn-checkout-primary">Thanh toán ngay</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PageFooter />
    </div>
  );
}