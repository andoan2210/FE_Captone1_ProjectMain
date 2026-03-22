/**
 * File: AdminLayout.jsx
 * Mục đích: Component Layout tổng (Khung sườn chính) cho toàn bộ khu vực Admin.
 * Đóng gói Sidebar ở bên trái và chừa khoảng trống (Outlet) ở giữa để render các trang con tương ứng.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 w-full overflow-hidden text-left selection:bg-blue-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý cửa hàng</div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 bg-white rounded-full border border-slate-200 shadow-sm hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
