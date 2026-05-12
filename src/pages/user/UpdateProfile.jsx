import React, { useState, useEffect, useMemo, useRef } from 'react';
import userService from '../../services/userService';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaFacebookF, FaInstagram, FaYoutube, FaUserCircle, FaBox, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { CategoryService } from '../../services/CategoryService';
import { ShopProductService } from '../../services/ShopProductService';
import * as CartService from '../../services/CartService';
import { ChevronRight, Bell, Info, MapPin, Plus, Trash2, Edit3, Camera, Save, X, AlertTriangle } from 'lucide-react';
import '../LandingPage/LandingPage.css';

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

  const handleNavClick = (categoryId) => {
    navigate('/', { state: { category: categoryId } });
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
                    <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <FaUserCircle
                      style={{ fontSize: "20px", color: "var(--lp-accent)" }}
                    />
                  )}
                  <span className="user-profile">{userLabel}</span>
                </button>
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
          <span onClick={() => handleNavClick('all')} style={{ cursor: 'pointer' }}>
            TẤT CẢ DANH MỤC
          </span>
          {dbCategories &&
            dbCategories.map((cat) => (
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
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    email: '',
    phone: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);

  // Modals state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    isDefault: false
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ 
    type: 'CARD', 
    provider: 'VISA', 
    accountNumber: '', 
    cardHolderName: '', 
    isDefault: false 
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [avatarUrl, setAvatarUrl] = useState('https://i.pinimg.com/originals/a9/71/d8/a971d8b69fdc16c9ca3222a38e895226.jpg');
  const [avatarFile, setAvatarFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [profile, adrResponse] = await Promise.all([
          userService.getUserProfile(),
          userService.getAddresses()
        ]);

        if (profile) {
          setFormData({
            fullName: profile.fullName || '',
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile.gender || 'Nam',
            email: profile.email || '',
            phone: profile.phone || ''
          });
          if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl);
        }

        if (adrResponse) {
          const adrList = Array.isArray(adrResponse) ? adrResponse : (adrResponse.data && Array.isArray(adrResponse.data) ? adrResponse.data : []);
          setAddresses(adrList);
        }

        // Fetch payments separately if needed
        try {
          const payResponse = await userService.getPayments();
          if (payResponse) {
            const payList = Array.isArray(payResponse) ? payResponse : (payResponse.data && Array.isArray(payResponse.data) ? payResponse.data : []);
            setPayments(payList);
          }
        } catch (payErr) {
          console.log('Payments not supported or error:', payErr.message);
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
    setError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setPasswordData({ ...passwordData, [name]: value });
  };

  // ADD Handlers
  const handleAddAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.province || !newAddress.district || !newAddress.ward || !newAddress.detailAddress) {
      setError('Vui lòng nhập đầy đủ tất cả các trường địa chỉ.');
      return;
    }
    try {
      if (editingAddressId) {
        // Update existing address
        await userService.updateAddress(editingAddressId, newAddress);
        
        // Update local state
        setAddresses(addresses.map(addr => 
          (addr.AddressId || addr.id) === editingAddressId ? { ...newAddress, AddressId: editingAddressId, id: editingAddressId } : addr
        ));
        
        setSuccessMessage('Cập nhật địa chỉ thành công!');
      } else {
        await userService.addAddress(newAddress);
        // Refresh list from server to get full object (AddressId, etc.)
        const updated = await userService.getAddresses();
        const adrList = Array.isArray(updated) ? updated : (updated.data && Array.isArray(updated.data) ? updated.data : []);
        setAddresses(adrList);
        setSuccessMessage('Thêm địa chỉ thành công!');
      }
      
      setShowAddressModal(false);
      setEditingAddressId(null);
      setNewAddress({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        detailAddress: '',
        isDefault: false
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditAddressButtonClick = (addr) => {
    setEditingAddressId(addr.AddressId || addr.id);
    setNewAddress({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      district: addr.district || '',
      ward: addr.ward || '',
      detailAddress: addr.detailAddress || '',
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  const handleAddPayment = async () => {
    if (!newPayment.accountNumber || !newPayment.cardHolderName) {
      setError('Vui lòng nhập đầy đủ Số tài khoản và Tên chủ sở hữu.');
      return;
    }
    
    // Validate account number length (8-20 as per BE)
    if (newPayment.accountNumber.length < 8 || newPayment.accountNumber.length > 20) {
      setError('Số tài khoản phải từ 8 đến 20 chữ số.');
      return;
    }

    try {
      await userService.addPayment(newPayment);
      // Refresh list
      const payResponse = await userService.getPayments();
      const payList = Array.isArray(payResponse) ? payResponse : (payResponse.data && Array.isArray(payResponse.data) ? payResponse.data : []);
      setPayments(payList);
      
      setShowPaymentModal(false);
      setNewPayment({ 
        type: 'CARD', 
        provider: 'VISA', 
        accountNumber: '', 
        cardHolderName: '', 
        isDefault: false 
      });
      setSuccessMessage('Thêm phương thức thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id);
      setAddresses(addresses.filter(addr => (addr.AddressId || addr.id) !== id));
      console.log('[v0] Address deleted:', id);
    } catch (err) {
      console.error('[v0] Delete address error:', err.message);
      setError(err.message);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      setLoading(true);
      // Tìm địa chỉ hiện tại để lấy lại các thông tin bắt buộc (fullName, phone, ...)
      const currentAddr = addresses.find(addr => (addr.AddressId || addr.id) === id);
      if (!currentAddr) throw new Error('Không tìm thấy địa chỉ');

      // Gửi toàn bộ thông tin cùng với isDefault: true vì Backend yêu cầu đầy đủ các trường
      await userService.updateAddress(id, {
        fullName: currentAddr.fullName,
        phone: currentAddr.phone,
        province: currentAddr.province,
        district: currentAddr.district,
        ward: currentAddr.ward,
        detailAddress: currentAddr.detailAddress,
        isDefault: true 
      });

      // Reload addresses to reflect the change
      const updatedAddresses = await userService.getAddresses();
      const adrList = Array.isArray(updatedAddresses) ? updatedAddresses : (updatedAddresses.data && Array.isArray(updatedAddresses.data) ? updatedAddresses.data : []);
      setAddresses(adrList);
      setSuccessMessage('Đã thiết lập địa chỉ mặc định thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('[v0] Set default address error:', err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await userService.deletePayment(id);
      setPayments(payments.filter(pay => (pay.PaymentId || pay.id) !== id));
      console.log('[v0] Payment deleted:', id);
    } catch (err) {
      console.error('[v0] Delete payment error:', err.message);
      setError(err.message);
    }
  };

  const handleSaveChanges = async () => {
    // Basic Profile Validation
    if (!formData.fullName || formData.fullName.length < 2) {
      setError('Họ và tên không hợp lệ.');
      return;
    }
    // Allow phone number to be checked if edited
    if (formData.phone && formData.phone.length < 10) {
      setError('Số điện thoại không hợp lệ (cần ít nhất 10 số).');
      return;
    }

    try {
      await userService.updateUserProfile(formData, avatarFile);
      setSuccessMessage('Cập nhật thành công! Đang chuyển hướng...');
      setAvatarFile(null); // Reset file after upload
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/user/UserProfile');
      }, 1500);
      console.log('[v0] Profile saved:', formData);
    } catch (err) {
      console.error('[v0] Save profile error:', err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường cấu hình mật khẩu.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await userService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccessMessage('Cập nhật mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Lỗi cập nhật mật khẩu: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    window.history.back();
    console.log("[v0] Changes cancelled");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f0f8ff] to-[#dcf0fa] relative">
      {/* Global Header */}
      <PageHeader
        userLabel={formData.fullName || userLabel}
        userAvatar={avatarUrl}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />

      {!loading && (
        <>
          {/* Local Title Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Cập nhật thông tin cá nhân</h1>
              <div className="flex gap-4">
                <button onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition flex items-center gap-2">
                  <X size={16} /> Hủy
                </button>
                <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center gap-2 shadow-md">
                  <Save size={16} /> Lưu thay đổi
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Avatar */}
            <aside className="lg:col-span-1">
              <div className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-[20px] p-6 text-white shadow-lg sticky top-24">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group w-32 h-32 mb-4">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-white shadow-md bg-white"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <h2 className="text-center text-xl font-bold mb-1">{formData.fullName || 'Người dùng'}</h2>
                  <p className="text-sm text-blue-100 mt-1"></p>
                </div>

                <div className="border-t border-blue-400 pt-4">
                  <p className="text-xs opacity-90 text-center font-medium leading-relaxed">Nhấp dính vào ảnh phía trên để thay đổi Avatar.</p>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl flex items-center gap-3 animate-fadeIn">
                  <Save className="w-5 h-5 flex-shrink-0" />
                  <p className="font-semibold">{successMessage}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-[19px] font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                  <Info className="text-blue-500" /> Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Họ và Tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Email <span className="text-gray-400 font-normal">(Chỉ xem)</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Nhập số điện thoại của bạn"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[19px] font-extrabold text-gray-800 flex items-center gap-3">
                    <MapPin className="text-blue-500" /> Sổ địa chỉ
                  </h3>
                  <button onClick={() => setShowAddressModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition shadow-sm">
                    <Plus size={16} /> Thêm mới
                  </button>
                </div>
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">Chưa có địa chỉ nào được thêm</p>
                  ) : addresses.map((addr, index) => (
                    <div key={`address-${addr.AddressId || addr.id || index}`} className="flex items-center justify-between p-5 border border-gray-100 bg-gray-50 rounded-xl hover:border-blue-200 hover:shadow-sm transition group">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-full text-blue-500 shadow-sm transition">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-[15px] text-gray-800 tracking-wide">{addr.fullName} | {addr.phone}</p>
                          <p className="text-gray-600 text-[13.5px] mt-1.5">
                            {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                          {addr.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">Mặc định</span>
                          )}
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.AddressId || addr.id)}
                              className="text-[12px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition mr-2"
                            >
                              Thiết lập mặc định
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddressButtonClick(addr)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition tooltip rounded-md hover:bg-blue-50"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.AddressId || addr.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition tooltip rounded-md hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[19px] font-extrabold text-gray-800 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                    Tùy chọn thanh toán
                  </h3>
                  <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition shadow-sm">
                    <Plus size={16} /> Thêm mới
                  </button>
                </div>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-gray-500 py-4 text-center">Chưa có phương thức thanh toán nào</p>
                  ) : payments.map((payment, index) => (
                    <div key={`payment-${payment.PaymentId || payment.id || index}`} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-gray-200 transition">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 font-bold text-xs uppercase bg-white text-blue-600 shadow-sm rounded-md border border-gray-100">
                          {payment.type}
                        </span>
                        <span className="text-gray-600 tracking-wide font-medium">{payment.number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeletePayment(payment.PaymentId || payment.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-[19px] font-extrabold text-gray-800 mb-6 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Đổi mật khẩu
                </h3>
                <div className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Mật khẩu phải có ít nhất 6 ký tự"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2 ml-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Trùng khớp với mật khẩu bên trên"
                    />
                  </div>

                  <div className="pt-2">
                    <button onClick={handleUpdatePassword} className="px-6 py-2 bg-gray-800 text-white text-[14px] font-semibold rounded-lg hover:bg-gray-900 transition shadow-md">
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>
              </div>

            </main>
          </div>
        </>
      )}

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl relative">
            <button onClick={() => {
              setShowAddressModal(false);
              setEditingAddressId(null);
              setNewAddress({
                fullName: '',
                phone: '',
                province: '',
                district: '',
                ward: '',
                detailAddress: '',
                isDefault: false
              });
            }} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
              <X size={22} />
            </button>
            <h3 className="text-[19px] font-extrabold text-gray-800 mb-6">
              {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Họ tên người nhận</label>
                  <input type="text" value={newAddress.fullName} onChange={(e) => { setNewAddress({ ...newAddress, fullName: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Tên người nhận" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Số điện thoại</label>
                  <input type="text" value={newAddress.phone} onChange={(e) => { setNewAddress({ ...newAddress, phone: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Số điện thoại" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Tỉnh/Thành</label>
                  <input type="text" value={newAddress.province} onChange={(e) => { setNewAddress({ ...newAddress, province: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Tỉnh" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Quận/Huyện</label>
                  <input type="text" value={newAddress.district} onChange={(e) => { setNewAddress({ ...newAddress, district: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Quận" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Phường/Xã</label>
                  <input type="text" value={newAddress.ward} onChange={(e) => { setNewAddress({ ...newAddress, ward: e.target.value }); setError(null); }} className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" placeholder="Phường" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Địa chỉ chi tiết</label>
                <textarea value={newAddress.detailAddress} onChange={(e) => { setNewAddress({ ...newAddress, detailAddress: e.target.value }); setError(null); }} className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition min-h-[80px]" placeholder="Số nhà, tên đường..."></textarea>
              </div>
              <div className="flex items-center gap-2 ml-1">
                <input type="checkbox" id="is-default" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="is-default" className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</label>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-gray-100">
                <button onClick={() => setShowAddressModal(false)} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[14px] font-semibold transition">Hủy</button>
                <button onClick={handleAddAddress} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[14px] font-semibold transition shadow-md flex items-center gap-2"><Save size={16} /> Lưu địa chỉ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-7 shadow-2xl relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
              <X size={22} />
            </button>
            <h3 className="text-[19px] font-extrabold text-gray-800 mb-6">Thêm phương thức thanh toán</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Loại hình</label>
                  <select 
                    value={newPayment.type} 
                    onChange={(e) => { 
                      const val = e.target.value;
                      setNewPayment({ 
                        ...newPayment, 
                        type: val, 
                        provider: val === 'CARD' ? 'VISA' : 'MOMO' 
                      }); 
                      setError(null); 
                    }} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="CARD">Thẻ Ngân hàng</option>
                    <option value="EWALLET">Ví điện tử</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Nhà cung cấp</label>
                  <select 
                    value={newPayment.provider} 
                    onChange={(e) => { setNewPayment({ ...newPayment, provider: e.target.value }); setError(null); }} 
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {newPayment.type === 'CARD' ? (
                      <>
                        <option value="VISA">VISA</option>
                        <option value="MASTERCARD">MasterCard</option>
                      </>
                    ) : (
                      <>
                        <option value="MOMO">MoMo</option>
                        <option value="ZALOPAY">ZaloPay</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Số tài khoản / Số thẻ / Số điện thoại ví</label>
                <input 
                  type="text" 
                  value={newPayment.accountNumber} 
                  onChange={(e) => { setNewPayment({ ...newPayment, accountNumber: e.target.value }); setError(null); }} 
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" 
                  placeholder="Nhập số tài khoản hoặc số thẻ" 
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 ml-1">Tên chủ sở hữu (Không dấu)</label>
                <input 
                  type="text" 
                  value={newPayment.cardHolderName} 
                  onChange={(e) => { setNewPayment({ ...newPayment, cardHolderName: e.target.value.toUpperCase() }); setError(null); }} 
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition" 
                  placeholder="Ví dụ: NGUYEN VAN A" 
                />
              </div>

              <div className="flex items-center gap-2 ml-1">
                <input 
                  type="checkbox" 
                  id="pay-default" 
                  checked={newPayment.isDefault} 
                  onChange={(e) => setNewPayment({ ...newPayment, isDefault: e.target.checked })} 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                />
                <label htmlFor="pay-default" className="text-sm font-medium text-gray-700">Đặt làm mặc định</label>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="pt-4 flex justify-end gap-3 mt-2 border-t border-gray-100">
                <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[14px] font-semibold transition">Hủy</button>
                <button onClick={handleAddPayment} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[14px] font-semibold transition shadow-md flex items-center gap-2"><Save size={16} /> Lưu thông tin</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <PageFooter />
    </div>
  );
};

export default UpdateProfile;