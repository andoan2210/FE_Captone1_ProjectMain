import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import GoogleCallback from './pages/auth/GoogleCallback';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyForgotPasswordOtp from './pages/auth/VerifyForgotPasswordOtp';
import ChangePassword from './pages/auth/ChangePassword';

import ShopOwnerLayout from './components/shop-owner/ShopOwnerLayout';
import Products from './pages/shop-owner/Products';
import AddProduct from './pages/shop-owner/AddProduct';
import EditProduct from './pages/shop-owner/EditProduct';
import QuanLyCuaHang from './pages/shop-owner/ShopOwner';

function App() {
  return (
    <Routes>
      {/* Mặc định chuyển đến trang đăng nhập */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-forgot-password-otp" element={<VerifyForgotPasswordOtp />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Shop Owner Routes */}
      <Route path="/shop-owner" element={<ShopOwnerLayout />}>
        <Route index element={<Navigate to="store" replace />} />
        <Route path="store" element={<QuanLyCuaHang />} />
        <Route path="dashboard" element={<div className="p-6">Trang Dashboard đang phát triển</div>} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="orders" element={<div className="p-6">Orders Preview</div>} />
        <Route path="vouchers" element={<div className="p-6">Vouchers Preview</div>} />
        <Route path="settings" element={<div className="p-6">Settings Preview</div>} />
      </Route>
      {/* Thêm các route khác ở đây */}
    </Routes>
  );
}

export default App;
