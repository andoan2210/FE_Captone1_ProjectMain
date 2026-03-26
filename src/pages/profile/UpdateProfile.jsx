import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
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
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const UpdateProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      <header className="header">
        <div className="header-top">
          <div className="header-left">
            <div className="logo">SmartAI Fashion</div>
          </div>
          <div className="search-bar">
            <SearchIcon />
            <input type="text" placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc thời trang AI..." />
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Giỏ hàng">
              <ShoppingCartIcon />
            </button>
            <button className="icon-btn" title="Thông báo">
              <BellIcon />
            </button>
            <div className="user-menu">
              <img src="https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg" alt="Avatar" className="user-avatar-small" loading="eager" />
              <span>Nguyễn Minh</span>
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        <nav className="nav-menu">
          <button className="nav-btn">
            <MenuIcon />
            TẤT CẢ DANH MỤC
          </button>
          <a href="#" className="nav-link">Thời trang Nam</a>
          <a href="#" className="nav-link">Thời trang Nữ</a>
          <a href="#" className="nav-link">Giày dép</a>
          <a href="#" className="nav-link">Túi xách</a>
          <a href="#" className="nav-link">Phụ kiện</a>
          <a href="#" className="nav-link">Đồ thể thao</a>
          <a href="#" className="nav-link highlight-blue">BST Thu Đông</a>
          <a href="#" className="nav-link highlight-red">Đồ hiệu sale</a>
          <a href="#" className="nav-link highlight-orange">Flash Sale</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="update-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="page-title">Cập nhật thông tin cá nhân</h1>
          <a 
            href="/profile/UserProfile"
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
     <footer style={{ backgroundColor: '#3488ffff', color: '#e5e7eb', padding: '40px 20px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ color: '#ecececff', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>SmartAI Fashion</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>Nền tảng thương mại điện tử hàng đầu với công nghệ AI tiên tiến, giúp bạn tìm kiếm và mua sắm sản phẩm chất lượng cao.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              
            </div>
            <div className="social-icons">
              <a href="#" title="Facebook"><FacebookIcon /></a>
              <a href="#" title="Instagram"><InstagramIcon /></a>
              <a href="#" title="Twitter"><TwitterIcon /></a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Chính sách khách hàng</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Giới thiệu</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Thương hiệu hợp tác</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Blog</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Về SmartAI Fashion</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Điều khoản sử dụng</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách bảo mật</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách vận chuyển</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Chính sách đổi trả</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Thanh toán & lỗi chính sách</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Phương thức thanh toán</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Góp ý & khiếu nại</a></li>
              <li><a href="#" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px' }}>Hỗ trợ khách hàng</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #4b5563', marginTop: '30px', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          <p>© 2025 SmartAI Fashion | Công ty Cổ phần Thương mại Điện tử SmartAI | Tất cả các quyền được bảo lưu</p>
        </div>
      </footer>
    </div>
  );
};

export default UpdateProfile;  