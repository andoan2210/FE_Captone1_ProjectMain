// Cửa hàng
/**
 * File: TheThongKe.jsx
 * Mục đích: Thành phần hiển thị 1 thẻ nhỏ thống kê trạng thái cửa hàng cho Shop Owner.
 * Component này sẽ tự động gọi API ShopCuahangService.getStoreStats() để hiển thị số liệu thực tế.
 */
import React, { useEffect, useState } from 'react';
import { FiBox, FiShoppingCart, FiTag, FiActivity } from 'react-icons/fi';
import { ShopCuahangService } from '@/services/ShopCuahangService';

const TheThongKe = ({ isActive: propIsActive, stats: externalStats }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (externalStats) {
      // Dữ liệu đã có sẵn từ prop
      const currentActive = propIsActive !== undefined ? propIsActive : externalStats.activeStatus;
      
      setStats([
        { name: 'Tổng sản phẩm', value: externalStats.totalProducts || 0, icon: FiBox, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconColor: 'text-blue-500' },
        { name: 'Tổng đơn hàng', value: externalStats.totalOrders || 0, icon: FiShoppingCart, color: 'text-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', iconColor: 'text-indigo-500' },
        { name: 'Tổng voucher', value: externalStats.totalVouchers || 0, icon: FiTag, color: 'text-violet-600', bg: 'bg-gradient-to-br from-violet-50 to-violet-100', iconColor: 'text-violet-500' },
        { name: 'Trạng thái', value: currentActive ? 'Hoạt động' : 'Tạm nghỉ', icon: FiActivity, color: currentActive ? 'text-emerald-600' : 'text-amber-600', bg: currentActive ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-amber-50 to-amber-100', iconColor: currentActive ? 'text-emerald-500' : 'text-amber-500' },
      ]);
      setLoading(false);
    }
  }, [externalStats, propIsActive]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100/60 p-6 h-28 animate-pulse">
            <div className="h-full bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats && stats.map((stat, idx) => (
        <div key={idx} className="group bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 p-6 flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden cursor-default">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 ease-in-out -translate-x-full z-10"></div>

          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 ${stat.bg} shadow-inner transition-transform duration-300 group-hover:scale-110`}>
            <stat.icon className={`text-2xl ${stat.iconColor}`} />
          </div>
          <div className="z-0">
            <p className="text-sm font-semibold text-slate-400 mb-1">{stat.name}</p>
            <h3 className={`text-2xl font-extrabold ${stat.color} tracking-tight`}>{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TheThongKe;
