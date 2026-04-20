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

// ================= TOGGLE STATUS =================
const apiToggleStatus = async (id, currentStatus) => {
  try {
    // Lưu ý: BE hiện tại chưa có endpoint riêng cho toggleStatus của Admin trong UsersController
    // Chúng ta tạm thời để đây hoặc bạn có thể bổ sung BE sau.
    return await api.patch(`/users/profile`, {
      isActive: currentStatus === "Active" ? false : true,
    });
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

const apiUpdateAccount = async (id, data) => {
  try {
    // Lưu ý: NestJS UsersController của bạn đang dùng @Patch('profile')
    return await api.patch(`/users/profile`, data);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    throw new Error("Không thể cập nhật tài khoản");
  }
};

// ================= CREATE =================
const apiCreateAccount = async (data) => {
  try {
    return await api.post(`/users`, {
      ...data,
      role: (data.role || "").toUpperCase(),
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    throw new Error("Không thể tạo tài khoản");
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
    // NOTE: Backend cần cung cấp endpoint này
    // Temporarily fetch from /product/admin/pending để lấy pending
    const res = await api.get(`/product/admin/approved`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    // Fallback nếu backend chưa có endpoint approved
    console.error("GET APPROVED PRODUCTS ERROR:", error);
    return { data: [], pagination: { total: 0 } };
  }
};

const apiGetRejectedProducts = async (page = 1, limit = 10) => {
  try {
    // NOTE: Backend cần cung cấp endpoint này
    const res = await api.get(`/product/admin/rejected`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    // Fallback nếu backend chưa có endpoint rejected
    console.error("GET REJECTED PRODUCTS ERROR:", error);
    return { data: [], pagination: { total: 0 } };
  }
};

// ================= EXPORT =================
export const adminService = {
  getAllAccounts: apiGetAllAccounts,
  toggleAccountStatus: apiToggleStatus,
  deleteAccount: apiDeleteAccount,
  updateAccount: apiUpdateAccount,
  createAccount: apiCreateAccount,
  getPendingProducts: apiGetPendingProducts,
  getProductDetail: apiGetProductDetail,
  approveProduct: apiApproveProduct,
  rejectProduct: apiRejectProduct,
  getApprovedProducts: apiGetApprovedProducts,
  getRejectedProducts: apiGetRejectedProducts,
};

export default adminService;
