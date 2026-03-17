import { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import './Login.css';

const API_BASE = 'http://localhost:8080/api';

const VerifyForgotPasswordOtp = () => {
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy email từ state khi điều hướng từ trang ForgotPassword
    const email = location.state?.email || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    const handleChange = (e, index) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (!val && e.target.value !== '') return; // Bỏ qua nếu nhập không phải số

        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        
        if (val && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e?.preventDefault();
        setError('');
        setSuccessMsg('');

        const code = otp.join('');
        if (code.length < 6) {
            setError('Vui lòng nhập đủ 6 số OTP.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/users/verify-forgot-password-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Xác nhận thất bại');
                throw new Error(errMsg);
            }

            setSuccessMsg('Xác nhận thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/change-password', { state: { email, code } });
            }, 1000);

        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMsg('');
        setResendLoading(true);
        try {
            const response = await fetch(`${API_BASE}/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errMsg = Array.isArray(data.message) ? data.message[0] : (data.message || 'Lỗi gửi lại mã');
                throw new Error(errMsg);
            }

            setSuccessMsg('Mã xác nhận đã được gửi lại vào email của bạn.');
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon-wrapper">
                        <FaShieldAlt className="login-icon" />
                    </div>
                    <h2 className="login-title">Xác nhận mã OTP</h2>
                    <p className="login-subtitle">
                        Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email <br/>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{email}</span>
                    </p>
                </div>

                {error && <p className="login-error">{error}</p>}
                {successMsg && <p className="login-error" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>{successMsg}</p>}

                <form className="login-form" onSubmit={handleVerify}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={otp[index]}
                                className="form-input"
                                style={{ padding: 0, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', height: '3.5rem' }}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Đang xác nhận...' : 'Xác nhận mã'}
                        {!loading && <FaCheck className="btn-icon" />}
                    </button>
                </form>

                <div className="login-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ margin: 0 }}>
                        Chưa nhận được mã?{' '}
                        <button 
                            type="button" 
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="register-link"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                        >
                            {resendLoading ? 'Đang gửi...' : 'Gửi lại ngay'}
                        </button>
                    </p>
                    <Link to="/forgot-password" className="forgot-link" style={{ fontSize: '0.875rem' }}>
                        &larr; Đổi email khác
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyForgotPasswordOtp;
