/**
 * userService.js
 * Gọi API BE theo đúng endpoint:
 *   GET/PATCH /api/users/profile       (multipart cho avatar)
 *   POST /api/users/change-password
 *   GET/POST/PATCH/DELETE /api/address
 *   GET/POST/PATCH/DELETE /api/payment-method
 * Tất cả request đi qua Vite proxy /api → http://localhost:8080 để tránh CORS.
 */
import axios from 'axios';

// Instance dùng chung – prefix /api đi qua Vite proxy
const api = axios.create({ baseURL: '/api' });

// Gắn Bearer token tự động
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- helper map address từ BE → FE ----------
const mapAddress = (addr) => ({
  id: addr.id,
  fullName: addr.fullName,
  phone: addr.phone,
  province: addr.province,
  district: addr.district,
  ward: addr.ward,
  detailAddress: addr.detailAddress,
  isDefault: addr.isDefault,
  // Hiển thị tóm tắt cho UI cũ
  type: addr.isDefault ? 'Nhà (Mặc định)' : 'Địa chỉ',
  address: [addr.detailAddress, addr.ward, addr.district, addr.province].filter(Boolean).join(', '),
});

// ---------- helper map payment từ BE → FE ----------
const mapPayment = (p) => ({
  id: p.id,
  type: p.paymentType,
  number: p.accountNumber || p.cardNumber || '',
});

const userService = {
  // ───────────────── PROFILE ─────────────────

  /**
   * GET /api/users/profile
   * BE trả về: { message, data: { userId, email, fullName, phone, gender, birthDate, avatarUrl, createdAt } }
   */
  getUserProfile: async () => {
    const res = await api.get('/users/profile');
    const raw = res.data?.data || {};
    return {
      userId: raw.userId,
      fullName: raw.fullName || '',
      email: raw.email || '',
      phone: raw.phone || '',
      gender: raw.gender || 'Nam',
      birthDate: raw.birthDate || '',
      avatarUrl: raw.avatarUrl || '',
      createdAt: raw.createdAt || '',
    };
  },

  /**
   * PATCH /api/users/profile (multipart/form-data)
   * Fields: fullName?, phone?, gender?, birthDate?  +  file 'avatar'?
   */
  updateUserProfile: async (dto, avatarFile) => {
    const formData = new FormData();
    if (dto.fullName !== undefined) formData.append('fullName', dto.fullName);
    if (dto.phone !== undefined) formData.append('phone', dto.phone);
    if (dto.gender !== undefined) formData.append('gender', dto.gender);
    if (dto.birthDate !== undefined) formData.append('birthDate', dto.birthDate);
    if (avatarFile) formData.append('avatar', avatarFile);

    const res = await api.patch('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * POST /api/users/change-password
   * Body: { oldPassword, newPassword, confirmPassword }
   */
  changePassword: async (body) => {
    const res = await api.post('/users/change-password', body);
    return res.data;
  },

  // ───────────────── ADDRESS ─────────────────

  /**
   * GET /api/address
   * BE trả về: { message, data: [ { id, fullName, phone, province, district, ward, detailAddress, isDefault } ] }
   */
  getAddresses: async () => {
    const res = await api.get('/address');
    const list = res.data?.data || [];
    return list.map(mapAddress);
  },

  /**
   * POST /api/address
   * Body: { fullName, phone, province, district, ward, detailAddress, isDefault }
   */
  addAddress: async (dto) => {
    const res = await api.post('/address', dto);
    const addr = res.data?.data || {};
    return mapAddress({ ...dto, id: addr.id, isDefault: addr.isDefault ?? dto.isDefault });
  },

  /**
   * PATCH /api/address/:id
   */
  updateAddress: async (id, dto) => {
    const res = await api.patch(`/address/${id}`, dto);
    return res.data;
  },

  /**
   * DELETE /api/address/:id
   */
  deleteAddress: async (id) => {
    const res = await api.delete(`/address/${id}`);
    return res.data;
  },

  // ───────────────── PAYMENT METHOD ─────────────────

  /**
   * GET /api/payment-method
   */
  getPaymentMethods: async () => {
    const res = await api.get('/payment-method');
    const list = res.data?.data || res.data || [];
    return list.map(mapPayment);
  },

  /**
   * POST /api/payment-method
   * Body: { paymentType, accountNumber/cardNumber, ... }
   */
  addPayment: async (dto) => {
    const res = await api.post('/payment-method', dto);
    const p = res.data?.data || res.data || {};
    return mapPayment({ ...dto, id: p.id });
  },

  /**
   * PATCH /api/payment-method/:id
   */
  updatePayment: async (id, dto) => {
    const res = await api.patch(`/payment-method/${id}`, dto);
    return res.data;
  },

  /**
   * DELETE /api/payment-method/:id
   */
  deletePayment: async (id) => {
    const res = await api.delete(`/payment-method/${id}`);
    return res.data;
  },
};

export default userService;
