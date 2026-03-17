import axios from "axios";

// Default API URL fallback if env vars are not set
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Quan trọng: Gửi kèm cookie khi gọi API
});

// Biến cờ để ngăn gọi refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: tự động thêm AccessToken vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: xử lý khi AccessToken hết hạn (lỗi 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua nếu lỗi là do gọi refresh token thất bại, hoặc gọi đăng nhập
    if (
      originalRequest.url.includes('/auth/refresh') || 
      originalRequest.url.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // Nếu mã lỗi là 401 (Unauthorized) và request chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh -> Đưa các request hiện tại vào hàng đợi
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        // Nhờ withCredentials: true, RefreshToken (lưu trong httpOnly cookie) sẽ tự động được gửi đi
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true 
        });

        // Lấy token mới từ dữ liệu trả về
        const newAccessToken = response.data.accessToken || response.data.token || response.data.access_token;
        
        if (newAccessToken) {
          // Lưu token mới
          localStorage.setItem('token', newAccessToken);

          // Cập nhật lại header của phiên làm việc axios
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Cập nhật lại request cũ bị lỗi và gọi lại
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Không nhận được token mới');
        }
      } catch (err) {
        processQueue(err, null);
        
        // Refresh thất bại (VD: refresh token cũng hết hạn) -> Xóa token và bắt đăng nhập lại
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
