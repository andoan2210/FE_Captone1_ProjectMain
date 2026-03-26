import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

const API_BASE = '/api';

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Không tìm thấy mã xác thực từ Google.');
      return;
    }

    // Gửi code đến backend để đổi lấy token
    const fetchToken = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/google/callback?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Đăng nhập Google thất bại');
        }
        // In ra response để kiểm tra cấu trúc dữ liệu trả về từ backend
        console.log('Google login response:', data);

        const token = data.accessToken || data.token || data.access_token;
        if (token) {
          localStorage.setItem('token', token);
        }
        navigate('/shop-owner/dashboard');
      } catch (err) {
        setError(err.message);
      }
    };

    fetchToken();
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
