import { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import userService from '../../services/userService';

const VerifyOtp = () => {
    const inputRefs = useRef([]);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy email từ state khi điều hướng từ trang Register
    const email = location.state?.email || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!email) {
            // Nếu không có email (người dùng truy cập trực tiếp url này), quay lại trang đăng ký
            navigate('/register');
            return;
        }
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        // Chỉ lấy ký tự cuối cùng nếu người dùng nhập đè
        const lastChar = value.substring(value.length - 1);
        
        if (!/^\d*$/.test(lastChar)) return; // Bỏ qua nếu không phải số

        const newOtp = [...otp];
        newOtp[index] = lastChar;
        setOtp(newOtp);
        
        // Tự động chuyển focus sang ô tiếp theo
        if (lastChar && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Nếu ô hiện tại trống, quay lại ô trước đó
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            } else {
                // Xóa giá trị ô hiện tại
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
        const newOtp = [...otp];
        
        pasteData.forEach((char, i) => {
            if (i < 6 && /^\d$/.test(char)) {
                newOtp[i] = char;
            }
        });
        
        setOtp(newOtp);
        
        // Focus vào ô cuối cùng được điền hoặc ô tiếp theo
        const lastIndex = Math.min(pasteData.length, 5);
        inputRefs.current[lastIndex].focus();
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
            await userService.verifyEmail(email, code);

            setSuccessMsg('Xác nhận thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            const data = err.response?.data;
            const errMsg = Array.isArray(data?.message) ? data.message[0] : (data?.message || err.message || 'Xác nhận thất bại');
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMsg('');
        setResendLoading(true);
        try {
            await userService.resendVerificationCode(email);
            setSuccessMsg('Mã xác nhận đã được gửi lại vào email của bạn.');
        } catch (err) {
            const data = err.response?.data;
            const errMsg = Array.isArray(data?.message) ? data.message[0] : (data?.message || err.message || 'Lỗi gửi lại mã');
            setError(errMsg);
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
                    <h2 className="login-title">Xác nhận email</h2>
                    <p className="login-subtitle">
                        Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email <br/>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{email}</span>
                    </p>
                </div>

                {error && <p className="login-error">{error}</p>}
                {successMsg && <p className="login-error" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>{successMsg}</p>}

                <form className="login-form" onSubmit={handleVerify}>
                    <div className="otp-container">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                autoComplete="one-time-code"
                                value={otp[index]}
                                className="otp-input"
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
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
                    <Link to="/register" className="forgot-link" style={{ fontSize: '0.875rem' }}>
                        &larr; Quay lại
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
