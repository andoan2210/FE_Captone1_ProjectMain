import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import { FaRegEye, FaRegEyeSlash, FaCheck } from 'react-icons/fa6';
import './Login.css';
import userService from '../../services/userService';

const ChangePassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy email và code từ state
    const email = location.state?.email || '';
    const code = location.state?.code || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        setLoading(true);
        try {
            await userService.changeForgotPassword(email, password);
            
            setSuccessMsg('Đổi mật khẩu thành công! Chuyển hướng đến đăng nhập...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
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
                        <FaLock className="login-icon" />
                    </div>
                    <h2 className="login-title">Tạo mật khẩu mới</h2>
                    <p className="login-subtitle">
                        Vui lòng nhập mật khẩu mới cho tài khoản <br/>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{email}</span>
                    </p>
                </div>

                {error && <p className="login-error">{error}</p>}
                {successMsg && <p className="login-error" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>{successMsg}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
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
                        <label className="form-label">Xác nhận mật khẩu mới</label>
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
                        {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        {!loading && <FaCheck className="btn-icon" />}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/login" className="forgot-link" style={{ fontSize: '0.875rem' }}>
                        &larr; Về trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
