import api from "./api";

// ================= NORMALIZE ROLE =================
const normalizeRole = (role) => {
  switch ((role || "").toUpperCase()) {
    case "ADMIN":
      return "Admin";
    case "SHOPOWNER":
      return "ShopOwner";
    case "CLIENT":
      return "Client";
    default:
      return "Client";
  }
};

// ================= GET ALL =================
const apiGetAllAccounts = async () => {
  try {
    const res = await api.get(`/users/getAllUsers?page=1&limit=100`);

    const users = res.data.data || res.data;

    if (!Array.isArray(users)) return [];

    return users.map((user) => ({
      id: user.UserId,
      fullName: user.FullName || "N/A",
      email: user.Email || "N/A",
      role: normalizeRole(user.Role),
      status: user.IsActive ? "Active" : "Blocked",
      joinDate: user.CreatedAt
        ? new Date(user.CreatedAt).toLocaleDateString("vi-VN")
        : "N/A",
      avatar: user.AvatarUrl || null,
    }));
  } catch (error) {
    console.error("GET ACCOUNTS ERROR:", error);
    throw new Error("Không thể tải danh sách tài khoản");
  }
};

// ================= TOGGLE STATUS (Admin) =================
const apiToggleStatus = async (userId) => {
  try {
    const res = await api.patch(`/users/admin/${userId}/toggle-status`);
    return res.data;
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    throw new Error("Không thể thay đổi trạng thái");
  }
};

// ================= DELETE =================
const apiDeleteAccount = async (email) => {
  try {
    return await api.delete(`/users`, { data: { email } });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    throw new Error("Không thể xóa tài khoản");
  }
};

// ================= UPDATE ROLE (Admin) =================
const apiUpdateAccount = async (userId, data) => {
  try {
    const res = await api.patch(`/users/admin/${userId}/update-role`, {
      role: data.role,
    });
    return res.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    throw new Error("Không thể cập nhật tài khoản");
  }
};

// ================= PRODUCT MANAGEMENT =================
const apiGetPendingProducts = async (page = 1, limit = 10) => {
  try {
    const res = await api.get(`/product/admin/pending`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("GET PENDING PRODUCTS ERROR:", error);
    throw new Error("Không thể tải danh sách sản phẩm chờ duyệt");
  }
};

const apiGetProductDetail = async (id) => {
  try {
    const res = await api.get(`/product/admin/${id}`);
    return res.data;
  } catch (error) {
    console.error("GET PRODUCT DETAIL ERROR:", error);
    throw new Error("Không thể tải chi tiết sản phẩm");
  }
};

const apiApproveProduct = async (id) => {
  try {
    console.log(`Approving product ${id}`);
    const res = await api.patch(`/product/admin/${id}/approve`, {});
    console.log("Approve response:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "APPROVE PRODUCT ERROR - Full error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || "Không thể duyệt sản phẩm",
    );
  }
};

const apiRejectProduct = async (id, reason) => {
  try {
    const res = await api.patch(`/product/admin/${id}/reject`, { reason });
    return res.data;
  } catch (error) {
    console.error("REJECT PRODUCT ERROR:", error);
    throw new Error("Không thể từ chối sản phẩm");
  }
};

const apiGetApprovedProducts = async (page = 1, limit = 10) => {
  try {
    const res = await api.get(`/product/admin/approved`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("GET APPROVED PRODUCTS ERROR:", error);
    return { data: [], pagination: { total: 0 } };
  }
};

const apiGetRejectedProducts = async (page = 1, limit = 10) => {
  try {
    const res = await api.get(`/product/admin/rejected`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error("GET REJECTED PRODUCTS ERROR:", error);
    return { data: [], pagination: { total: 0 } };
  }
};

const apiAdminUpdateProduct = async (id, data) => {
  try {
    const formData = new FormData();
    if (data.productName) formData.append("productName", data.productName);
    if (data.description) formData.append("description", data.description);
    if (data.price) formData.append("price", data.price);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.isActive !== undefined) formData.append("isActive", data.isActive);
    
    // Nếu có thumbnail mới
    if (data.thumbnailFile) {
      formData.append("thumbnail", data.thumbnailFile);
    }
    
    // Nếu có variants (json string)
    if (data.variants) {
      formData.append("variants", JSON.stringify(data.variants));
    }

    const res = await api.patch(`/product/admin/${id}/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật sản phẩm");
  }
};

// ================= ADMIN CREATE USER =================
const apiAdminCreateUser = async (data) => {
  try {
    const res = await api.post(`/users/admin/create`, data);
    return res.data;
  } catch (error) {
    console.error("ADMIN CREATE USER ERROR:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo tài khoản");
  }
};

// ================= ADMIN UPDATE USER INFO =================
const apiAdminUpdateInfo = async (userId, data) => {
  try {
    const res = await api.patch(`/users/admin/${userId}/update-info`, data);
    return res.data;
  } catch (error) {
    console.error("ADMIN UPDATE INFO ERROR:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật thông tin");
  }
};

// ================= GET ACCOUNT DETAIL =================
const apiGetAccountDetail = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    console.error("GET ACCOUNT DETAIL ERROR:", error);
    throw new Error("Không thể tải chi tiết tài khoản");
  }
};

// ================= SELLER APPROVALS (Store) =================
const apiGetPendingStores = async () => {
  try {
    const res = await api.get(`/store/admin/pending`);
    return res.data;
  } catch (error) {
    console.error("GET PENDING STORES ERROR:", error);
    throw new Error("Không thể tải danh sách đơn đăng ký");
  }
};

const apiApproveStore = async (storeId) => {
  try {
    const res = await api.patch(`/store/admin/${storeId}/approve`);
    return res.data;
  } catch (error) {
    console.error("APPROVE STORE ERROR:", error);
    throw new Error("Không thể duyệt đơn đăng ký");
  }
};

const apiRejectStore = async (storeId) => {
  try {
    const res = await api.patch(`/store/admin/${storeId}/reject`);
    return res.data;
  } catch (error) {
    console.error("REJECT STORE ERROR:", error);
    throw new Error("Không thể từ chối đơn đăng ký");
  }
};
// ================= STORE MANAGEMENT =================
const apiGetAllStores = async () => {
  try {
    const res = await api.get(`/store/admin/all`);
    return res.data;
  } catch (error) {
    console.error("GET ALL STORES ERROR:", error);
    throw new Error("Không thể tải danh sách cửa hàng");
  }
};

const apiGetStoreDetail = async (storeId) => {
  try {
    const res = await api.get(`/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error("GET STORE DETAIL ERROR:", error);
    throw new Error("Không thể tải chi tiết cửa hàng");
  }
};

const apiToggleStoreStatus = async (storeId) => {
  try {
    const res = await api.patch(`/store/admin/${storeId}/toggle-status`);
    return res.data;
  } catch (error) {
    console.error("TOGGLE STORE STATUS ERROR:", error);
    throw new Error("Không thể thay đổi trạng thái cửa hàng");
  }
};

// ================= REPORT MANAGEMENT =================
const apiGetReports = async (filters = {}) => {
  try {
    const res = await api.get(`/report/admin`, { params: filters });
    return res.data;
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    throw new Error("Không thể tải danh sách báo cáo");
  }
};

const apiGetReportDetail = async (id) => {
  try {
    const res = await api.get(`/report/admin/${id}`);
    return res.data;
  } catch (error) {
    console.error("GET REPORT DETAIL ERROR:", error);
    throw new Error("Không thể tải chi tiết báo cáo");
  }
};

const apiUpdateReportStatus = async (id, data) => {
  try {
    const res = await api.patch(`/report/admin/${id}/status`, data);
    return res.data;
  } catch (error) {
    console.error("UPDATE REPORT STATUS ERROR:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật trạng thái báo cáo");
  }
};

const apiCreateReport = async (data) => {
  try {
    const res = await api.post(`/report`, data);
    return res.data;
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error);
    throw new Error(error.response?.data?.message || "Không thể gửi báo cáo");
  }
};

// ================= EXPORT =================
export const adminService = {
  getAllAccounts: apiGetAllAccounts,
  toggleAccountStatus: apiToggleStatus,
  deleteAccount: apiDeleteAccount,
  updateAccount: apiUpdateAccount,
  getPendingProducts: apiGetPendingProducts,
  getProductDetail: apiGetProductDetail,
  approveProduct: apiApproveProduct,
  rejectProduct: apiRejectProduct,
  getApprovedProducts: apiGetApprovedProducts,
  getRejectedProducts: apiGetRejectedProducts,
  updateProduct: apiAdminUpdateProduct,
  // Seller Approvals
  getPendingStores: apiGetPendingStores,
  approveStore: apiApproveStore,
  rejectStore: apiRejectStore,
  // Account Detail
  getAccountDetail: apiGetAccountDetail,
  // Admin CRUD
  createUser: apiAdminCreateUser,
  updateUserInfo: apiAdminUpdateInfo,
  // Store Management
  getAllStores: apiGetAllStores,
  getStoreDetail: apiGetStoreDetail,
  toggleStoreStatus: apiToggleStoreStatus,
  // Report Management
  getReports: apiGetReports,
  getReportDetail: apiGetReportDetail,
  updateReportStatus: apiUpdateReportStatus,
  createReport: apiCreateReport,
};


export default adminService;
