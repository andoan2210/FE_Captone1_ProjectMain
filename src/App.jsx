import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './Logins/Login';
import GoogleCallback from './Logins/GoogleCallback';
import Register from './Logins/Register';
import VerifyOtp from './Logins/VerifyOtp';
import ForgotPassword from './Logins/ForgotPassword';
import VerifyForgotPasswordOtp from './Logins/VerifyForgotPasswordOtp';
import ChangePassword from './Logins/ChangePassword';
import UserProfile from "./pages/profile/UserProfile";
import UpdateProfile from './pages/profile/UpdateProfile';
import Vieworder from './pages/order/Vieworder';
import Manageinvoice from './pages/manage/Manageinvoice';

import Login from './pages/auth/Login';
import GoogleCallback from './pages/auth/GoogleCallback';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyForgotPasswordOtp from './pages/auth/VerifyForgotPasswordOtp';
import ChangePassword from './pages/auth/ChangePassword';
import AdminLayout from './components/Admin/AdminLayout';
import Products from './pages/admin/Products';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import QuanLyCuaHang from './pages/admin/ShopOwner';
import LandingPage from './pages/LandingPage/LandingPage';


function App() {
  return (
    <Routes>
      {/* Mặc định chuyển đến trang đăng nhập */}
      <Route path="/" element={localStorage.getItem('token') ? <LandingPage /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-forgot-password-otp" element={<VerifyForgotPasswordOtp />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="/profile/UserProfile" element={<UserProfile />} />
       <Route path="/profile/UpdateProfile" element={<UpdateProfile />} />
      <Route path="/order/Vieworder" element={<Vieworder />} />
      <Route path="/manage/Manageinvoice" element={<Manageinvoice />} />
   

      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
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
