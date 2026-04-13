import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaRegEnvelope, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import './Login.css';

function ResendCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Sử dụng api.post thay vì fetch
      await api.post('/users/resend-code', {
        email
      });

      setSuccess('Mã xác thực đã được gửi lại vào email của bạn!');
      
      // Chuyển hướng sang trang nhập OTP sau 1.5s, truyền email vào state
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1500);

    } catch (err) {
      const data = err.response?.data;
      setError(Array.isArray(data?.message) ? data.message[0] : (data?.message || err.message || 'Gửi mã thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <FaShieldAlt className="login-icon" />
          </div>
          <h2 className="login-title">Xác thực tài khoản</h2>
          <p className="login-subtitle">Nhập email của bạn để nhận lại mã OTP</p>
        </div>

        {/* Thông báo */}
        {error && <p className="login-error">{error}</p>}
        {success && (
          <p className="login-error" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>
            {success}
          </p>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            {!loading && <FaArrowRight className="btn-icon" />}
          </button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          <Link to="/login" className="register-link">
            &larr; Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResendCode;
