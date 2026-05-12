import React, { useState, useEffect, useMemo, useRef } from 'react';
import userService from '../../services/userService';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaFacebookF, FaInstagram, FaYoutube, FaRegComment, FaUserCircle, FaBox, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { FiMessageCircle } from "react-icons/fi";
import { jwtDecode } from 'jwt-decode';
import { CategoryService } from '../../services/CategoryService';
import { ShopProductService } from '../../services/ShopProductService';
import * as CartService from '../../services/CartService';
import { ChevronRight, Bell, Info, Package, Camera } from 'lucide-react';
import '../LandingPage/LandingPage.css';
import "./UserProfile.css";

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

export default function UserProfile() {
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

  const [basicInfo, setBasicInfo] = useState({
    fullName: 'Nguyễn Văn Quốc',
    birthDate: '01/01/1990',
    gender: 'Nam',
    email: 'nguyenvanquoc@email.com',
    phone: '0763739254'
  });

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Nhà (Mặc định)', address: 'K275/27 Trường Chinh, An Khê, Thanh Khê, Đà Nẵng' },
  ]);
  const [payments, setPayments] = useState([]);

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy liên kết phương thức thanh toán này?')) return;
    try {
      await userService.deletePayment(id);
      setPayments(payments.filter(pay => (pay.id || pay.PaymentId) !== id));
    } catch (err) {
      console.error('Delete payment error:', err.message);
      alert('Lỗi: ' + err.message);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const [profile, adrResponse] = await Promise.all([
          userService.getUserProfile(),
          userService.getAddresses()
        ]);

        if (profile) {
          setBasicInfo({
            fullName: profile.fullName || '',
            birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '',
            gender: profile.gender || 'Nam',
            email: profile.email || '',
            phone: profile.phone || '',
            avatar: profile.avatarUrl || null
          });
        }

        if (adrResponse) {
          const adrList = Array.isArray(adrResponse) ? adrResponse : (adrResponse.data && Array.isArray(adrResponse.data) ? adrResponse.data : []);
          setAddresses(adrList);
        }

        // Fetch payments separately
        try {
          const payResponse = await userService.getPayments();
          if (payResponse) {
            const payList = Array.isArray(payResponse) ? payResponse : (payResponse.data && Array.isArray(payResponse.data) ? payResponse.data : []);
            setPayments(payList);
          }
        } catch (payErr) {
          console.log('Payments load error:', payErr.message);
        }

        setError(null);
      } catch (err) {
        console.log('[v0] Profile load error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f0f8ff] to-[#dcf0fa] relative">
      <PageHeader
        userLabel={basicInfo.fullName || userLabel}
        userAvatar={basicInfo.avatar}
        dbCategories={dbCategories}
        onLogout={handleLogout}
      />

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '12px', margin: '12px', borderRadius: '6px', color: '#dc2626', fontSize: '14px', maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto' }}>
          Lỗi: {error}
        </div>
      )}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải thông tin...</p>
        </div>
      )}

      {!loading && (
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="rounded-[24px] p-6 text-white shadow-md relative overflow-hidden" style={{ backgroundColor: '#1e40af' }}>
              <div className="flex justify-center mb-4 mt-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-[4px] border-white shadow-sm overflow-hidden">
                  {basicInfo.avatar ? (
                    <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold" style={{ color: '#1e40af' }}>{basicInfo.fullName ? basicInfo.fullName[0].toUpperCase() : 'U'}</span>
                  )}
                </div>
              </div>
              <h2 className="text-center text-lg font-bold mb-10 pb-4 border-b border-white/20">{basicInfo.fullName}</h2>

              <nav className="space-y-3 pb-6">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition bg-white/20 font-medium text-sm border-l-4 border-[#3b82f6]">
                  <Bell size={18} />
                  <span>Thông báo</span>
                  <span className="ml-auto px-2 py-0.5 text-white rounded text-[10px] font-bold" style={{ backgroundColor: '#3b82f6' }}>2</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 rounded-xl transition font-medium text-sm text-white/90">
                  <Info size={18} />
                  <span>Thông tin</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-[24px] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              {/* Header inside card */}
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Playfair Display", Times, serif' }}>Thông tin cá nhân</h1>
                <Link to="/user/UpdateProfile" className="px-6 py-2 text-white rounded-full text-sm font-semibold transition hover:opacity-90 shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                  Chỉnh sửa
                </Link>
              </div>

              {/* Inner Split: Avatar Info vs Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Inner - Avatar Info */}
                <div className="lg:col-span-1 bg-blue-50 rounded-[24px] p-6 flex flex-col items-center border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative" style={{ backgroundColor: '#eff6ff' }}>
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden mb-5 relative top-2">
                    {basicInfo.avatar ? (
                      <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold" style={{ color: '#1e40af' }}>{basicInfo.fullName ? basicInfo.fullName[0].toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <h2 className="text-[17px] font-bold text-gray-800 text-center uppercase tracking-wide mt-2" style={{ fontFamily: '"Playfair Display", Times, serif' }}>{basicInfo.fullName}</h2>
                  <p className="text-gray-400 text-[13px] mt-1.5 font-medium"></p>
                </div>

                {/* Right Inner - Data Fields */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div className="col-span-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Họ và tên</label>
                      <input type="text" readOnly className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium" value={basicInfo.fullName} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Số điện thoại</label>
                      <input type="text" readOnly className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium" value={basicInfo.phone || ''} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Email</label>
                      <input type="text" readOnly className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium" value={basicInfo.email} />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Ngày sinh</label>
                      <input type="text" readOnly className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium" value={basicInfo.birthDate || 'Chưa cập nhật'} />
                    </div>
                    <div className="col-span-2 flex justify-center mt-1">
                      <div className="w-full max-w-[350px]">
                        <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1 text-center">Giới tính</label>
                        <select readOnly disabled className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium text-center" value={basicInfo.gender}>
                          <option>Nam</option>
                          <option>Nữ</option>
                          <option>Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2 mt-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Địa chỉ</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
                        value={addresses.length > 0 ? `${addresses[0].detailAddress}, ${addresses[0].ward}, ${addresses[0].district}, ${addresses[0].province}` : ''}
                        placeholder="Chưa cập nhật địa chỉ"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="mt-14 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: '"Playfair Display", Times, serif' }}>Phương thức thanh toán</h3>
                  <Link to="/user/UpdateProfile" className="text-sm text-blue-600 font-medium hover:underline">+ Quản lý</Link>
                </div>

                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm">Chưa có phương thức thanh toán nào được liên kết</p>
                    </div>
                  ) : payments.map((payment) => (
                    <div key={payment.id || payment.PaymentId} className="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col md:flex-row items-center justify-between p-5 hover:border-gray-300 transition">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            payment.provider?.toLowerCase().includes('momo')
                              ? "https://projectcapstone1-public.s3.ap-southeast-2.amazonaws.com/products/thumbnail/1776135360618-MoMo_Logo_App.svg.png"
                              : "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                          }
                          alt="Provider Icon"
                          className="w-12 h-12 object-contain rounded border border-gray-100 p-1"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800 text-base">
                              {payment.type === 'CARD' ? 'Thẻ Ngân hàng' : 'Ví điện tử'} ({payment.provider})
                            </h4>
                            {payment.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold uppercase tracking-wider rounded border border-blue-200">Mặc định</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Số tài khoản: {payment.accountNumber}</p>
                          <p className="text-[11px] text-gray-400 uppercase font-bold tracking-tight">Chủ thẻ: {payment.cardHolderName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <button
                          onClick={() => handleDeletePayment(payment.id || payment.PaymentId)}
                          className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline transition"
                        >
                          Hủy liên kết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: '"Playfair Display", Times, serif' }}>Cài đặt tài khoản</h3>
                <div className="space-y-3 mt-4">
                  <Link to="/user/UpdateProfile" className="flex items-center justify-between p-4 bg-[#fbfbfb] border border-gray-100 rounded-[14px] hover:bg-gray-50 cursor-pointer transition shadow-sm no-underline">
                    <span className="text-sm text-gray-700 font-semibold ml-2 tracking-wide">Đổi mật khẩu</span>
                    <ChevronRight size={18} className="text-gray-400 mr-2" />
                  </Link>
                  <div className="flex items-center justify-between p-4 bg-[#fbfbfb] border border-gray-100 rounded-[14px] hover:bg-gray-50 cursor-pointer transition shadow-sm">
                    <span className="text-sm text-gray-700 font-semibold ml-2 tracking-wide">Cài đặt thông báo</span>
                    <ChevronRight size={18} className="text-gray-400 mr-2" />
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      )}

      {/* Global Footer */}
      <PageFooter />
    </div>
  );
}