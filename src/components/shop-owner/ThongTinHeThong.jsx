/**
 * File: ThongTinHeThong.jsx
 * Mục đích: Hiển thị các thông tin "hệ thống" (Read-only) của cửa hàng cho Shop Owner như StoreID, Ngày tạo....
 * Component này chỉ đơn thuần nhận props (storeInfo) từ trang cha truyền xuống và render, không tự fetch API.
 */
// Cửa hàng
import React from 'react';
import { FiInfo, FiCalendar, FiUser, FiHash } from 'react-icons/fi';

export default function ThongTinHeThong({ storeInfo }) {
  if (!storeInfo) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 p-7 w-full lg:w-80 h-fit animate-pulse text-left text-slate-800">
        <div className="h-6 w-1/2 bg-slate-200 rounded-md mb-8"></div>
        <div className="space-y-5">
          <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
          <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
          <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100/60 p-7 w-full lg:w-80 h-fit text-left text-slate-800">
      <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100/60 pb-5 flex items-center gap-2">
        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg"><FiInfo className="text-lg" /></div>
        Thông tin hệ thống
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors">
          <div className="bg-white p-2.5 rounded-lg text-slate-400 shadow-sm border border-slate-100/50"><FiUser /></div>
          <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Tên cửa hàng</p><p className="text-sm font-bold text-slate-800 line-clamp-1">{storeInfo.name || 'Chưa cập nhật'}</p></div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors">
          <div className="bg-white p-2.5 rounded-lg text-slate-400 shadow-sm border border-slate-100/50"><FiHash /></div>
          <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Store ID</p><p className="text-sm font-mono text-slate-800 bg-slate-200/50 px-1.5 py-0.5 rounded text-xs mt-0.5">{storeInfo.storeId || '#STR-UNKNOWN'}</p></div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors">
          <div className="bg-white p-2.5 rounded-lg text-slate-400 shadow-sm border border-slate-100/50"><FiUser /></div>
          <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Chủ sở hữu</p><p className="text-sm font-medium text-slate-800">{storeInfo.ownerName || 'Chủ cửa hàng'}</p></div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors">
          <div className="bg-white p-2.5 rounded-lg text-slate-400 shadow-sm border border-slate-100/50"><FiCalendar /></div>
          <div><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Ngày tạo</p><p className="text-sm font-medium text-slate-800">{formatDate(storeInfo.createdAt) || '18 Tháng 03, 2026'}</p></div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100/80">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium relative z-10"><span className="font-bold text-blue-900 absolute -top-5 bg-white px-2 py-0.5 rounded-full border border-blue-100 shadow-sm">Mẹo</span><br />Cập nhật thông tin cửa hàng đầy đủ, chuyên nghiệp sẽ giúp tăng mức độ nhận diện thương hiệu và sự tin tưởng của khách hàng lên 40%.</p>
        </div>
      </div>
    </div>
  );
}
