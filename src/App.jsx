import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import GoogleCallback from './pages/auth/GoogleCallback';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyForgotPasswordOtp from './pages/auth/VerifyForgotPasswordOtp';
import ChangePassword from './pages/auth/ChangePassword';
import ResendCode from './pages/auth/ResendCode';

// New routes from main branch
import UserProfile from "./pages/profile/UserProfile";
import UpdateProfile from './pages/profile/UpdateProfile';
import Vieworder from './pages/order/Vieworder';
import Manageinvoice from './pages/manage/Manageinvoice';
import LandingPage from './pages/LandingPage/LandingPage';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import ShoppingCart from './pages/ShoppingCart-AddtoCart/ShoppingCart';

// Shop Owner components
import ShopOwnerLayout from './components/shop-owner/ShopOwnerLayout';
import Products from './pages/shop-owner/Products';
import AddProduct from './pages/shop-owner/AddProduct';
import EditProduct from './pages/shop-owner/EditProduct';
import QuanLyCuaHang from './pages/shop-owner/ShopOwner';

import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin components (if needed separately)
// import AdminLayout from './components/Admin/AdminLayout';
// import AdminProducts from './pages/admin/Products';
// import AdminAddProduct from './pages/admin/AddProduct';
// import AdminEditProduct from './pages/admin/EditProduct';
// import AdminQuanLyCuaHang from './pages/admin/ShopOwner';

function App() {
  return (
    <Routes>
      {/* Mặc định luôn hiển thị Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<ShoppingCart />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/resend-code" element={<ResendCode />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-forgot-password-otp" element={<VerifyForgotPasswordOtp />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* New functional routes */}
      <Route path="/profile/UserProfile" element={<UserProfile />} />
      <Route path="/profile/UpdateProfile" element={<UpdateProfile />} />
      <Route path="/order/Vieworder" element={<Vieworder />} />
      <Route path="/manage/Manageinvoice" element={<Manageinvoice />} />

      {/* Shop Owner Routes - Protected by ShopOwner role */}
      <Route element={<ProtectedRoute allowedRoles={['ShopOwner']} />}>
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
      </Route>

      {/* Admin Routes - (Kept from user's attempt if they wanted it, otherwise focus on ShopOwner) */}
      {/* <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="store" replace />} />
        <Route path="store" element={<AdminQuanLyCuaHang />} />
        <Route path="dashboard" element={<div className="p-6">Trang Dashboard Admin</div>} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AdminAddProduct />} />
        <Route path="products/edit/:id" element={<AdminEditProduct />} />
      </Route> */}

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
