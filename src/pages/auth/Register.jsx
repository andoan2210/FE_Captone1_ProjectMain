import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaLock, FaShieldAlt, FaRegUser } from 'react-icons/fa';
import { FaRegEnvelope, FaRegEye, FaRegEyeSlash, FaArrowRight } from 'react-icons/fa6';
import './Login.css';
import api from '../../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        setLoading(true);
        try {
            // Dùng api (axios) thay vì fetch
            const response = await api.post('/users', { name, email, password });
            
            // Chuyển sang trang xác nhận OTP và truyền email
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            // Axios trả lỗi trong err.response.data
            const data = err.response?.data || {};
            const errMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Có lỗi xảy ra, vui lòng thử lại');
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const baseURL = api.defaults.baseURL;
        window.location.href = `${baseURL}/auth/google/login`;
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <FaUserPlus className="login-icon" />
                    </div>
                    <h2 className="login-title">Tạo tài khoản mới</h2>
                    <p className="login-subtitle">Điền thông tin bên dưới để tham gia với chúng tôi</p>
                </div>

                {error && <p className="login-error">{error}</p>}

                <form className="login-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <div className="input-wrapper">
                            <FaRegUser className="input-icon" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input" 
                                placeholder="Nguyễn Văn A" 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
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

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <div className="input-wrapper">
                            <FaLock className="input-icon input-icon--sm" />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input form-input--password" 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-wrapper">
                            <FaShieldAlt className="input-icon input-icon--sm" />
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input form-input--password" 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                        {!loading && <FaArrowRight className="btn-icon" />}
                    </button>
                </form>

                <div className="divider">
                    <span className="divider-line"></span>
                    <span className="divider-text">hoặc đăng ký bằng</span>
                    <span className="divider-line"></span>
                </div>

                <div className="social-grid">
                    <button type="button" onClick={handleGoogleLogin} className="social-btn">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-img" />
                        <span>Google</span>
                    </button>
                </div>

                <p className="login-footer">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="register-link">Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
