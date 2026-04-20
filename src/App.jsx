import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import GoogleCallback from "./pages/auth/GoogleCallback";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyForgotPasswordOtp from "./pages/auth/VerifyForgotPasswordOtp";
import ChangePassword from "./pages/auth/ChangePassword";
import ResendCode from "./pages/auth/ResendCode";

// New routes from main branch
import UserProfile from "./pages/user/UserProfile";
import UpdateProfile from "./pages/user/UpdateProfile";
import Vieworder from "./pages/shop-owner/Vieworder";
import Manageinvoice from "./pages/manage/Manageinvoice";
import InvoiceDetail from "./pages/manage/InvoiceDetail";
import LandingPage from "./pages/LandingPage/LandingPage";
import CategoryProducts from "./pages/CategoryProducts/CategoryProducts";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import AIVirtualTryOn from "./pages/AIVirtualTryOn/AIVirtualTryOn";
import ShoppingCart from "./pages/ShoppingCart-AddtoCart/ShoppingCart";
import ChatPage from "./pages/chat/ChatPage";
import Checkout from "./pages/checkout/Checkout";
import SearchPage from "./pages/search/SearchPage";
import MomoCallback from "./pages/checkout/MomoCallback";

// Shop Owner components
import ShopOwnerLayout from "./components/shop-owner/ShopOwnerLayout";
import Products from "./pages/shop-owner/Products";
import ApprovalProducts from "./pages/shop-owner/ApprovalProducts";
import AddProduct from "./pages/shop-owner/AddProduct";
import EditProduct from "./pages/shop-owner/EditProduct";
import CuaHang from "./pages/shop-owner/CuaHang";
import Vouchers from "./pages/shop-owner/Vouchers";

// Admin components
import AdminLayout from "./components/admin/AdminLayout";
import AccountManagement from "./pages/admin/AccountManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import AdminProducts from "./pages/admin/AdminProducts";

import ProtectedRoute from "./pages/auth/ProtectedRoute";
import ChatbotWidget from "./pages/chat/ChatbotWidget";

const RootRedirect = () => {
  const role = localStorage.getItem("userRole");
  const lowerRole = (role || "").toLowerCase();
  if (lowerRole.includes("shop")) {
    return <Navigate to="/shop-owner/store" replace />;
  }
  if (lowerRole.includes("admin")) {
    return <Navigate to="/admin/accounts" replace />;
  }
  return <LandingPage />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Mặc định điều hướng thông minh dựa trên Role */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/ai-virtual-tryon" element={<AIVirtualTryOn />} />

        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/callback" element={<MomoCallback />} />

        <Route path="/login" element={<Login />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/resend-code" element={<ResendCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/verify-forgot-password-otp"
          element={<VerifyForgotPasswordOtp />}
        />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* New functional routes */}
        <Route path="/user/UserProfile" element={<UserProfile />} />
        <Route path="/user/UpdateProfile" element={<UpdateProfile />} />

        <Route path="/manage/Manageinvoice" element={<Manageinvoice />} />

        <Route
          path="/manage/invoice-detail/:orderId"
          element={<InvoiceDetail />}
        />

        {/* Chat Routes */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Shop Owner Routes - Protected by ShopOwner role */}
        <Route element={<ProtectedRoute allowedRoles={["ShopOwner"]} />}>
          <Route path="/shop-owner" element={<ShopOwnerLayout />}>
            <Route index element={<Navigate to="store" replace />} />
            <Route path="store" element={<CuaHang />} />
            <Route
              path="dashboard"
              element={
                <div className="p-6">Trang Dashboard đang phát triển</div>
              }
            />
            <Route path="products" element={<Products />} />
            <Route path="approval-products" element={<ApprovalProducts />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<Vieworder />} />
            <Route path="messages" element={<ChatPage />} />

            <Route path="vouchers" element={<Vouchers />} />

            <Route
              path="settings"
              element={<div className="p-6">Settings Preview</div>}
            />
          </Route>
        </Route>

        {/* Admin Routes - Protected by Admin role */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="accounts" replace />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route
              path="dashboard"
              element={<div className="p-6">Trang Dashboard Admin</div>}
            />
            {/* Các quản lý khác có thể thêm vào đây */}
            <Route
              path="stores"
              element={<div className="p-6">Quản lý Cửa hàng</div>}
            />
            <Route
              path="categories"
              element={<div className="p-6">Quản lý Danh mục</div>}
            />
            <Route path="products" element={<AdminProducts />} />
            <Route
              path="orders"
              element={<div className="p-6">Đơn hàng toàn sàn</div>}
            />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}

export default App;
