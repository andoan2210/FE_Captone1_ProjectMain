import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFingerprint, FaLock } from 'react-icons/fa';
import { FaRegEnvelope, FaRegEye, FaRegEyeSlash, FaArrowRight } from 'react-icons/fa6';
import './Login.css';

const API_BASE = 'http://localhost:8080/api';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Đăng nhập bằng email & mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The backend's LocalStrategy expects a 'username' field by default
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      // In ra response để kiểm tra cấu trúc dữ liệu trả về từ backend
      console.log('Login response:', data);

      // Lưu token (có thể backend trả về với key là accessToken hoặc token)
      const token = data.accessToken || data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập bằng Google – chuyển hướng tới OAuth endpoint
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google/login`;
  };

  return (
    <div className="login-page">
      {/* Card */}
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <FaFingerprint className="login-icon" />
          </div>
          <h2 className="login-title">Chào mừng trở lại</h2>
          <p className="login-subtitle">Vui lòng điền thông tin để tiếp tục</p>
        </div>

        {/* Thông báo lỗi */}
        {error && <p className="login-error">{error}</p>}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email của bạn</label>
            <div className="input-wrapper">
              <FaRegEnvelope className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="nguyenvana@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Mật khẩu</label>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </div>
            <div className="input-wrapper">
              <FaLock className="input-icon input-icon--sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input--password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </div>

          {/* Nút đăng nhập */}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            {!loading && <FaArrowRight className="btn-icon" />}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span className="divider-line" />
          <span className="divider-text">hoặc đăng nhập bằng</span>
          <span className="divider-line" />
        </div>

        {/* Social login */}
        <div className="social-grid">
          <button type="button" className="social-btn" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="social-img"
            />
            <span>Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer">
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="register-link">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
