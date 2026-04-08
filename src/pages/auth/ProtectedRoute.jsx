import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute: Thành phần bảo vệ route.
 * @param {string[]} allowedRoles - Danh sách các role được phép truy cập (vd: ['SHOP_OWNER', 'ADMIN']).
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // Giả định role được lưu vào đây sau khi login

  // 1. Nếu chưa đăng nhập -> Chuyển hướng sang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu đã đăng nhập nhưng không có role hợp lệ -> Chuyển về trang chủ (hoặc trang báo lỗi)
  if (allowedRoles.length > 0) {
    const hasValidRole = allowedRoles.some(
      role => role.toLowerCase() === (userRole || '').toLowerCase()
    );
    if (!hasValidRole) {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Nếu thỏa mãn cả 2 điều kiện -> Render các component bên trong (Route con)
  return <Outlet />;
};

export default ProtectedRoute;
