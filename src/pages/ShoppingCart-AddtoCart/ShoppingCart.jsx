import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaArrowLeft, FaShoppingCart, FaSearch, FaBell, FaFacebookF, FaInstagram, FaYoutube, FaUserCircle, FaBox, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { jwtDecode } from 'jwt-decode';
import * as CartService from '../../services/CartService.js';
import { CategoryService } from '../../services/CategoryService';
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

function PageHeader({ userLabel, dbCategories, onLogout }) {
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
  )
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
  )
}
export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState('');
  const [dbCategories, setDbCategories] = useState([]);
  const navigate = useNavigate();

  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchCart();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories();
      // NestJS trả về mảng trực tiếp
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setDbCategories(list);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await CartService.getCart();
      const data = response.data;

      let items = [];
      if (typeof data === 'string') {
        items = [];
      } else {
        items = Array.isArray(data) ? data : (data.cartItems || data.items || []);
      }

      if (items.length > 0) {
        const formattedCart = items.map(item => {
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
        localStorage.setItem('local_cart', JSON.stringify(formattedCart));
      } else {
        setCartItems([]);
        localStorage.removeItem('local_cart');
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng từ API:', error);
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

    const originalCart = [...cartItems];
    const updatedCart = cartItems.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('local_cart', JSON.stringify(updatedCart));

    try {
      await CartService.updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng ở Backend:', error);
      setCartItems(originalCart);
      localStorage.setItem('local_cart', JSON.stringify(originalCart));
      alert('Không thể cập nhật số lượng. Vui lòng thử lại sau!');
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    const originalCart = [...cartItems];

    const updatedCart = cartItems.filter(item => item.cartItemId !== cartItemId);
    setCartItems(updatedCart);
    localStorage.setItem('local_cart', JSON.stringify(updatedCart));

    try {
      await CartService.removeCartItem(cartItemId);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm ở Backend:', error);
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
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />
      <div className="cart-page-bg" style={{ minHeight: '60vh' }}>
        <div className="cart-loading">Đang tải giỏ hàng...</div>
      </div>
      <PageFooter />
    </div>
  );

  return (
    <div className="landing-page-container pd-shell">
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />
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