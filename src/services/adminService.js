import api from './api';

// ================= NORMALIZE ROLE =================
const normalizeRole = (role) => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'SHOPOWNER':
      return 'ShopOwner';
    case 'CLIENT':
      return 'Client';
    default:
      return 'Client';
  }
};

// ================= GET ALL =================
const apiGetAllAccounts = async () => {
  try {
    const res = await api.get(`/api/admin/accounts?page=1&limit=100`);

    const users = res.data.data || res.data;

    if (!Array.isArray(users)) return [];

    return users.map(user => ({
      id: user.UserId,
      fullName: user.FullName || 'N/A',
      email: user.Email || 'N/A',
      role: normalizeRole(user.Role),
      status: user.IsActive ? 'Active' : 'Blocked',
      joinDate: user.CreatedAt
        ? new Date(user.CreatedAt).toLocaleDateString('vi-VN')
        : 'N/A',
      avatar: user.AvatarUrl || null,
    }));
  } catch (error) {
    console.error('GET ACCOUNTS ERROR:', error);
    throw new Error('Không thể tải danh sách tài khoản');
  }
};

// ================= TOGGLE STATUS =================
const apiToggleStatus = async (id, currentStatus) => {
  try {
    return await api.patch(`/api/admin/accounts/${id}`, {
      isActive: currentStatus === 'Active' ? false : true,
    });
  } catch (error) {
    console.error('TOGGLE STATUS ERROR:', error);
    throw new Error('Không thể thay đổi trạng thái');
  }
};

// ================= DELETE =================
const apiDeleteAccount = async (id) => {
  try {
    return await api.delete(`/api/admin/accounts/${id}`);
  } catch (error) {
    console.error('DELETE ERROR:', error);
    throw new Error('Không thể xóa tài khoản');
  }
};

// ================= UPDATE =================
const apiUpdateAccount = async (id, data) => {
  try {
    return await api.patch(`/api/admin/accounts/${id}`, data);
  } catch (error) {
    console.error('UPDATE ERROR:', error);
    throw new Error('Không thể cập nhật tài khoản');
  }
};

// ================= CREATE =================
const apiCreateAccount = async (data) => {
  try {
    return await api.post(`/api/admin/accounts`, {
      ...data,
      role: (data.role || '').toUpperCase(), // 👈 FIX Ở ĐÂY
    });
  } catch (error) {
    console.error('CREATE ERROR:', error);
    throw new Error('Không thể tạo tài khoản');
  }
};

// ================= EXPORT =================
export const adminService = {
  getAllAccounts: apiGetAllAccounts,
  toggleAccountStatus: apiToggleStatus,
  deleteAccount: apiDeleteAccount,
  updateAccount: apiUpdateAccount,
  createAccount: apiCreateAccount,
};

export default adminService;