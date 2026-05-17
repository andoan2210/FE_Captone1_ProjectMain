/**
 * File: ShopOwnerLayout.jsx
 * Mục đích: Component Layout tổng (Khung sườn chính) cho toàn bộ khu vực Shop Owner.
 * Đóng gói Sidebar ở bên trái và chừa khoảng trống (Outlet) ở giữa để render các trang con tương ứng.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiBell, FiTrash2 } from 'react-icons/fi';
import { useNotification } from '../../hooks/useNotification';

export default function ShopOwnerLayout() {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    nextCursor,
  } = useNotification();

  const handleNotificationClick = async (n) => {
    // 1. Mark as read
    if (!n.IsRead) {
      await markAsRead(n.NotificationId);
    }
    // 2. Hide panel
    setShowNotif(false);
    // 3. Smart navigation
    const titleLower = (n.Title || '').toLowerCase();
    const contentLower = (n.Content || '').toLowerCase();
    if (
      n.Type === 'NEW_ORDER' ||
      n.Type === 'ORDER_CANCELLED' ||
      titleLower.includes('đơn hàng') ||
      contentLower.includes('đơn hàng') ||
      titleLower.includes('thanh toán') ||
      contentLower.includes('thanh toán')
    ) {
      navigate('/shop-owner/orders');
    } else if (
      titleLower.includes('sản phẩm') ||
      contentLower.includes('sản phẩm') ||
      titleLower.includes('duyệt') ||
      contentLower.includes('duyệt')
    ) {
      navigate('/shop-owner/approval-products');
    }
  };

  // Đóng notification panel khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 w-full overflow-hidden text-left selection:bg-blue-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <header className="relative h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-30">
          <div className="text-2xl font-bold text-slate-800 tracking-tight"></div>
          <div className="flex items-center gap-4">

            {/* Nút Thông Báo (Real-Time) */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotif((prev) => {
                    if (!prev) fetchNotifications();
                    return !prev;
                  });
                }}
                className="relative p-2.5 text-slate-500 bg-white rounded-full border border-slate-200 shadow-sm hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Panel dropdown thông báo */}
              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50 flex flex-col max-h-[480px]">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 && !loading && (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        Chưa có thông báo nào
                      </div>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n.NotificationId}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 flex gap-3 transition-colors hover:bg-slate-50 cursor-pointer ${!n.IsRead ? 'bg-blue-50/40' : ''
                          }`}
                      >
                        <div className="flex-1 text-left">
                          <h4 className="text-sm font-bold text-slate-800">{n.Title}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.Content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-slate-400">
                               {n.CreatedAt ? new Date(typeof n.CreatedAt === 'string' ? n.CreatedAt.replace('Z', '') : n.CreatedAt).toLocaleString('vi-VN') : ''}
                            </span>
                            {!n.IsRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.NotificationId);
                                }}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.NotificationId);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 self-start"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {loading && (
                      <div className="p-4 text-center text-slate-400 text-sm">
                        Đang tải...
                      </div>
                    )}
                    {nextCursor && !loading && (
                      <button
                        onClick={loadMore}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-blue-600 transition-colors"
                      >
                        Xem thêm
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
