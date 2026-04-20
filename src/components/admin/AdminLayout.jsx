import React, { useMemo } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, List, Package,
  ReceiptText, Sparkles, LogOut, Bell, Search, Box, AlertTriangle
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

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

const AdminLayout = () => {
  const navigate = useNavigate();
  const userName = useMemo(() => getUserDisplayNameFromToken(), []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'Tổng quan (Dashboard)', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
    { name: 'Tài khoản (Users)', icon: <Users size={18} />, path: '/admin/accounts' },
    { name: 'Cửa hàng (Stores)', icon: <Store size={18} />, path: '/admin/stores' },
    { name: 'Danh mục (Categories)', icon: <List size={18} />, path: '/admin/categories' },
    { name: 'Sản phẩm (Products)', icon: <Package size={18} />, path: '/admin/products' },
    { name: 'Báo cáo (Reports)', icon: <AlertTriangle size={18} />, path: '/admin/reports' },
    { name: 'Đơn hàng toàn sàn', icon: <ReceiptText size={18} />, path: '/admin/orders' },
    { name: 'AI & Thử đồ ảo', icon: <Sparkles size={18} />, path: '/admin/ai' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0A101D] text-gray-400 flex flex-col h-screen sticky top-0 overflow-hidden shrink-0">

        {/* LOGO */}
        <div className="pt-8 pb-6 px-6 flex items-center gap-3">
          <div className="w-[30px] h-[30px] bg-blue-500 rounded-md flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Box className="text-white fill-white stroke-blue-500" size={18} />
          </div>
          <h1 className="text-[17px] font-bold tracking-widest mt-1">
            <span className="text-white">CAPSTONE</span>
            <span className="text-blue-500">ADMIN</span>
          </h1>
        </div>

        {/* NAV ITEMS */}
        <nav
          className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 mt-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Hiding scrollbar for Chrome/Safari */}
          <style>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[14px] font-medium ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'hover:bg-white/5 hover:text-gray-200'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 mt-auto border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 text-[14px] font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar */}
        <div className="bg-white h-[76px] flex items-center px-8 justify-between shrink-0 shadow-sm border-b border-gray-100 z-10">
          {/* Search */}
          <div className="relative w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, email ..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F4F6F8] border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium text-gray-700 placeholder-gray-400 transition"
            />
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-blue-600 transition relative">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-gray-100 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                AS
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-gray-800 leading-tight">Admin System</span>
                <span className="text-[12px] text-gray-500 font-medium">Quản trị viên</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
