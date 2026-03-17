import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Logins/Login';
import GoogleCallback from './Logins/GoogleCallback';
import Register from './Logins/Register';
import VerifyOtp from './Logins/VerifyOtp';
import ForgotPassword from './Logins/ForgotPassword';
import VerifyForgotPasswordOtp from './Logins/VerifyForgotPasswordOtp';
import ChangePassword from './Logins/ChangePassword';

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
      {/* Thêm các route khác ở đây */}
    </Routes>
  );
}

export default App;
