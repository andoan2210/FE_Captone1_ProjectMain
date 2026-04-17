import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUnlock } from 'react-icons/fa';
import { FaRegEnvelope, FaPaperPlane } from 'react-icons/fa6';
import './Login.css';
import userService from '../../services/userService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        try {
            await userService.forgotPassword(email);
            
            // Chuyển sang trang xác nhận mã OTP của forgot password
            navigate('/verify-forgot-password-otp', { state: { email } });
        } catch (err) {
            const data = err.response?.data || {};
            const errMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Có lỗi xảy ra, vui lòng thử lại');
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <FaUnlock className="login-icon" />
                    </div>
                    <h2 className="login-title">Quên mật khẩu?</h2>
                    <p className="login-subtitle">Đừng lo lắng! Vui lòng nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã để đặt lại mật khẩu.</p>
                </div>

                {error && <p className="login-error">{error}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email của bạn</label>
                        <div className="input-wrapper">
                            <FaRegEnvelope className="input-icon" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input" 
                                placeholder="nguyenvana@gmail.com" 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                        {!loading && <FaPaperPlane className="btn-icon" />}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/login" className="forgot-link" style={{ fontSize: '0.875rem' }}>
                        &larr; Quay lại trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
