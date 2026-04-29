import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import './Login.css';

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const code = searchParams.get('code');

    const handleLoginSuccess = (token) => {
      localStorage.setItem('token', token);
      try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role || (decoded.User && decoded.User.role);
        
        if (userRole) {
          localStorage.setItem('userRole', userRole);
          const lowerRole = userRole.toLowerCase();
          if (lowerRole.includes('shop')) {
            navigate('/shop-owner/store');
          } else if (lowerRole.includes('admin')) {
            navigate('/admin/accounts');
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } catch (decodeErr) {
        console.error('Lỗi giải mã token Google:', decodeErr);
        navigate('/');
      }
    };

    if (token) {
      // Trường hợp BE redirect về kèm token
      handleLoginSuccess(token);
    } else if (code) {
      // Trường hợp cũ: FE nhận code rồi gọi BE (để dự phòng)
      const fetchToken = async () => {
        try {
          const response = await api.get(`/auth/google/callback?code=${encodeURIComponent(code)}`);
          const data = response.data;
          const accessToken = data.accessToken || data.token;
          if (accessToken) {
            handleLoginSuccess(accessToken);
          } else {
            setError('Không nhận được mã truy cập.');
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Đăng nhập Google thất bại');
        }
      };
      fetchToken();
    } else {
      setError('Không tìm thấy thông tin đăng nhập từ Google.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="login-page">
      <div className="login-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', minHeight: '300px' }}>
        {error ? (
          <>
            <p className="login-error" style={{ width: '100%' }}>{error}</p>
            <button
              className="btn-login"
              onClick={() => navigate('/login')}
            >
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <>
            <div className="login-icon-wrapper" style={{ margin: 0 }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '32px', height: '32px' }} />
            </div>
            <p className="login-title" style={{ fontSize: '1.25rem' }}>Đang xác thực Google...</p>
            <p className="login-subtitle">Vui lòng chờ trong giây lát</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;
