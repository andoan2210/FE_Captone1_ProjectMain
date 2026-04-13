/**
 * File: Sidebar.jsx
 * Mục đích: Hiển thị thanh menu điều hướng (Navigation) bên trái của giao diện Admin.
 * Chứa các link dẫn tới các trang như Dashboard, Sản phẩm, Đơn hàng, v.v.
 */
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingCart, FiTag, FiSettings, FiBriefcase, FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';

const menuItems = [
  { name: 'Dashboard', path: '/shop-owner/dashboard', icon: FiGrid },
  { name: 'Sản phẩm', path: '/shop-owner/products', icon: FiBox },
  { name: 'Đơn hàng', path: '/shop-owner/orders', icon: FiShoppingCart },
  { name: 'Tin nhắn', path: '/shop-owner/messages', icon: FiMessageSquare },
  { name: 'Vouchers', path: '/shop-owner/vouchers', icon: FiTag },
  { name: 'Cửa hàng', path: '/shop-owner/store', icon: FiBriefcase },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: 'Chủ cửa hàng', email: 'Đang tải...' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // 1. Phải giải mã CHÍNH TẠI ĐÂY để lấy thông tin Token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Trích xuất FullName hoặc Name tùy theo cách thiết lập của Backend (Payload JWT)
        setUser({
          fullName: decoded.FullName || decoded.fullName || decoded.name || 'Chủ cửa hàng',
          email: decoded.Email || decoded.email || '',
        });
      } catch (error) {
        console.error('Lỗi giải mã token', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Gọi API logout
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi gọi API logout, vẫn tiếp tục xóa token ở trình duyệt', error);
    } finally {
      // Clear storage & redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  };

  const firstLetter = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A';

  return (
    <div className="w-64 bg-white border-r border-slate-100/80 h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] sticky top-0 z-20 text-left">
      <div className="h-20 flex items-center px-6 border-b border-slate-100/50 mb-6">
        <div className="text-2xl font-extrabold tracking-tight text-slate-800">
          ShopOwnerPanel<span className="text-blue-600">.</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Quản lý</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100/50'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon
              className={({ isActive }) =>
                `mr-3 text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`
              }
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/50 shadow-sm transition-shadow hover:shadow-md">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner shrink-0">
            {firstLetter}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Đăng xuất"
            className={`p-2 rounded-xl transition-colors shrink-0 flex items-center justify-center ${isLoggingOut
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiLogOut className="text-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
