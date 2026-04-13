import React, { useState, useEffect, useMemo } from 'react';
import userService from '../../services/userService';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { CategoryService } from '../../services/CategoryService';
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

function PageHeader({ userLabel, dbCategories, onLogout }) {
  const navigate = useNavigate();

  const handleNavClick = (categoryId) => {
    navigate('/', { state: { category: categoryId } });
  };

  return (
    <>
      <header className="main-header">
        <div className="container header-content">
          <Link to="/" className="logo" style={{ color: '#2563eb' }}>
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
          <strong className="logo" style={{ color: '#2563eb' }}>SmartAI Fashion</strong>
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

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getUserProfile();
        if (profile) {
          setBasicInfo(profile.basicInfo || basicInfo);
          if (profile.addresses) setAddresses(profile.addresses);
          if (profile.payments) setPayments(profile.payments);
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
      <PageHeader userLabel={userLabel} dbCategories={dbCategories} onLogout={handleLogout} />

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
                  <button className="px-5 py-1.5 text-white rounded-full text-[13px] font-medium mb-4 shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    Thay ảnh
                  </button>
                  <h2 className="text-[17px] font-bold text-gray-800 text-center uppercase tracking-wide mt-2" style={{ fontFamily: '"Playfair Display", Times, serif' }}>{basicInfo.fullName}</h2>
                  <p className="text-gray-400 text-[13px] mt-1.5 font-medium">Thành viên MatFlow</p>
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
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Giới tính</label>
                      <select readOnly disabled className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-gray-700 font-medium" value={basicInfo.gender}>
                        <option>Nam</option>
                        <option>Nữ</option>
                        <option>Khác</option>
                      </select>
                    </div>
                    <div className="col-span-2 mt-1">
                      <label className="block text-[13px] font-semibold text-gray-600 mb-2 ml-1">Địa chỉ</label>
                      <div className="flex gap-4 mb-3">
                        <select className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-12px)_center] bg-[length:10px]"><option>Chọn tỉnh/thành</option></select>
                        <select className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:calc(100%-12px)_center] bg-[length:10px]"><option>Chọn phường/xã</option></select>
                      </div>
                      <input type="text" placeholder="Số nhà, tên đường" className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl mb-3 text-gray-500" readOnly />
                      <input type="text" readOnly className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700" value={addresses[0]?.address || ''} placeholder="Đường/Phường/Xã/Tỉnh thành phố" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-14 border-t border-gray-100 pt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: '"Playfair Display", Times, serif' }}>Thông tin bổ sung</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-[14px] p-4 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    <span className="text-sm opacity-95 ml-1">Ngày tham gia:</span>
                    <span className="font-bold text-sm mr-1">15/01/2023</span>
                  </div>
                  <div className="rounded-[14px] p-4 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    <span className="text-sm opacity-95 ml-1">Tổng đơn hàng:</span>
                    <span className="font-bold text-sm mr-1">24 đơn</span>
                  </div>
                  <div className="rounded-[14px] p-4 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    <span className="text-sm opacity-95 ml-1">Điểm tích lũy:</span>
                    <span className="font-bold text-sm mr-1">1,250 điểm</span>
                  </div>
                  <div className="rounded-[14px] p-4 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    <span className="text-sm opacity-95 ml-1">Trạng thái tài khoản:</span>
                    <span className="px-3 py-1 rounded bg-[#ffb703] text-white text-[11px] uppercase tracking-wide font-bold shadow-sm mr-1">Vàng</span>
                  </div>
                  <div className="col-span-1 rounded-[14px] p-4 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#3b82f6' }}>
                    <span className="text-sm opacity-95 ml-1">Vai trò:</span>
                    <span className="font-bold text-sm mr-1">Người dùng</span>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-800 mb-5" style={{ fontFamily: '"Playfair Display", Times, serif' }}>Cài đặt tài khoản</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-4 bg-[#fbfbfb] border border-gray-100 rounded-[14px] hover:bg-gray-50 cursor-pointer transition shadow-sm">
                    <span className="text-sm text-gray-700 font-semibold ml-2 tracking-wide">Đổi mật khẩu</span>
                    <ChevronRight size={18} className="text-gray-400 mr-2" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#fbfbfb] border border-gray-100 rounded-[14px] hover:bg-gray-50 cursor-pointer transition shadow-sm">
                    <span className="text-sm text-gray-700 font-semibold ml-2 tracking-wide">Cài đặt thông báo</span>
                    <ChevronRight size={18} className="text-gray-400 mr-2" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#fbfbfb] border border-gray-100 rounded-[14px] hover:bg-gray-50 cursor-pointer transition shadow-sm">
                    <span className="text-sm text-gray-700 font-semibold ml-2 tracking-wide">Bảo mật tài khoản</span>
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