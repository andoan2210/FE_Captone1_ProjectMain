import React, { useState, useEffect, useMemo } from 'react';
import userService from '../../services/userService';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { CategoryService } from '../../services/CategoryService';
import '../LandingPage/LangdingPage.css';
import './UpdateProfile.css';

function getUserDisplayNameFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return payload.email || payload.name || payload.fullName || payload.username || payload.sub || null;
  } catch {
    return null;
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
              <>
                <Link to="/user/UserProfile" style={{ textDecoration: 'none' }}>
                  <span className="user-profile">{userLabel}</span>
                </Link>
                <button type="button" className="btn-link logout-btn" style={{ background: 'transparent', border: 'none', color: '#6b6375', fontWeight: 500, cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }} onClick={onLogout}>
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
  );
}
import './UpdateProfile.css';

// SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"></circle>
    <circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [dbCategories, setDbCategories] = useState([]);
  const userLabel = useMemo(() => getUserDisplayNameFromToken(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getAllCategories();
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        setDbCategories(list);
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Minh',
    birthDate: '01/01/1990',
    gender: 'Nam',
    email: 'nguyenminh@gmail.com',
    phone: '0123456789'
  });

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Nhà (Mặc định)', address: 'K275/27 Trường Chinh, An Khê, Thanh Khê, Đà Nẵng' },
    { id: 2, type: 'Công ty', address: 'Số 49, Bàu Năng 11, Hoà Minh, Liên Chiểu, Đà Nẵng' }
  ]);

  const [payments, setPayments] = useState([
    { id: 1, type: 'VISA', number: 'Visa****1234' },
    { id: 2, type: 'MOMO', number: 'Momo ****1234' }
  ]);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarUrl, setAvatarUrl] = useState('https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg');
  const [successMessage, setSuccessMessage] = useState('');

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        if (profile) {
          setFormData(profile.basicInfo || formData);
          setAddresses(profile.addresses || addresses);
          setPayments(profile.payments || payments);
          setAvatarUrl(profile.avatar || avatarUrl);
        }
        setError(null);
      } catch (err) {
        console.log('[v0] Profile load error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id);
      setAddresses(addresses.filter(addr => addr.id !== id));
      console.log('[v0] Address deleted:', id);
    } catch (err) {
      console.error('[v0] Delete address error:', err.message);
      setError(err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await userService.deletePayment(id);
      setPayments(payments.filter(pay => pay.id !== id));
      console.log('[v0] Payment deleted:', id);
    } catch (err) {
      console.error('[v0] Delete payment error:', err.message);
      setError(err.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await userService.updateUserProfile(formData);
      setSuccessMessage('Cập nhật thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
      console.log('[v0] Profile saved:', formData);
    } catch (err) {
      console.error('[v0] Save profile error:', err.message);
      setError(err.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const newAvatarUrl = event.target.result;
          setAvatarUrl(newAvatarUrl);
          await userService.updateUserProfile({ avatar: newAvatarUrl });
          setSuccessMessage('Ảnh đại diện đã được cập nhật!');
          setTimeout(() => setSuccessMessage(''), 3000);
          console.log('[v0] Avatar changed successfully');
        } catch (err) {
          console.error('[v0] Update avatar error:', err.message);
          setError(err.message);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    window.history.back();
    console.log("[v0] Changes cancelled");
  };

  return (
    <div className="update-profile-page">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '12px', margin: '12px', borderRadius: '6px', color: '#dc2626', fontSize: '14px' }}>
          Lỗi: {error}
        </div>
      )}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải thông tin...</p>
        </div>
      )}
      {/* Header */}
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="update-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="page-title">Cập nhật thông tin cá nhân</h1>
          <a
            href="/user/UserProfile"
            className="back-btn"
            style={{ padding: '10px 20px', background: '#f3f4f6', color: '#333', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', textDecoration: 'none', display: 'inline-block' }}
          >
            ← Quay lại
          </a>
        </div>

        <div className="update-container">
          {/* Sidebar with Avatar */}
          <aside className="update-sidebar">
            <div className="avatar-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="profile-avatar"
                loading="eager"
              />
              <h2 className="sidebar-name">Nguyễn Minh</h2>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <button
                className="change-avatar-btn"
                onClick={() => document.getElementById('avatar-input').click()}
              >
                Thay đổi ảnh đại diện
              </button>
            </div>
          </aside>

          {/* Main Form Content */}
          <div className="update-content">
            {successMessage && <div className="success-message">{successMessage}</div>}

            {/* Basic Information */}
            <section className="form-section">
              <h3 className="section-title">Thông tin cơ bản</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và Tên:</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày sinh:</label>
                  <input
                    type="text"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="form-group">
                  <label>Giới tính:</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>SĐT:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            {/* Address Section */}
            <section className="form-section">
              <h3 className="section-title">Địa Chỉ</h3>
              <div className="items-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className="address-item">
                    <div className="item-icon">
                      <MapPinIcon />
                    </div>
                    <div className="item-content">
                      <span className="item-label">{addr.type}</span>
                      <span className="item-text">{addr.address}</span>
                    </div>
                    <button className="edit-btn">Sửa</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Section */}
            <section className="form-section">
              <h3 className="section-title">Thanh toán</h3>
              <div className="payment-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <span className={`payment-badge ${payment.type.toLowerCase()}`}>{payment.type}</span>
                    <span className="payment-number">{payment.number}</span>
                    <button className="edit-btn">Sửa</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              <button className="add-method-btn">
                <PlusIcon />
                Thêm phương thức thanh toán
              </button>
            </section>

            {/* Change Password Section */}
            <section className="form-section">
              <h3 className="section-title">Thay đổi mật khẩu</h3>
              <div className="form-group">
                <label>MK hiện tại:</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="form-group">
                <label>MK mới:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel}>Hủy</button>
              <button className="save-btn" onClick={handleSaveChanges}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
};

export default UpdateProfile;  