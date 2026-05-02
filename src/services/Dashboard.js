import api from "./api";

const DashboardService = {
  /**
   * Lấy thống kê tổng quan của admin
   */
  getAdminStats: async () => {
    try {
      const [usersRes, storesRes, productsRes] = await Promise.all([
        api.get("/users/getAllUsers?page=1&limit=1"),
        api.get("/store/admin/all"),
        api.get("/product/admin/approved?page=1&limit=1"),
      ]);

      const userData = usersRes.data || {};
      const storeData = storesRes.data || storesRes || [];
      const productData = productsRes.data || {};

      // Calculate Users
      const totalUsers = userData.pagination?.total || 
                        (Array.isArray(userData.data) ? userData.data.length : 0) || 
                        (Array.isArray(userData) ? userData.length : 0);

      // Calculate Stores
      const storesArray = Array.isArray(storeData) ? storeData : (storeData.data || []);
      const totalStores = storesArray.length;
      const activeStores = storesArray.filter(s => s.isActive).length;

      // Calculate Products
      const totalProducts = productData.pagination?.total || 
                           (Array.isArray(productData.data) ? productData.data.length : 0) ||
                           (Array.isArray(productData) ? productData.length : 0);

      return {
        totalUsers,
        totalStores,
        totalProducts,
        activeStores,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê doanh thu hệ thống (Admin)
   */
  getSystemRevenue: async () => {
    return [
      { month: "Jan", revenue: 45000000 },
      { month: "Feb", revenue: 52000000 },
      { month: "Mar", revenue: 48000000 },
      { month: "Apr", revenue: 61000000 },
      { month: "May", revenue: 55000000 },
      { month: "Jun", revenue: 67000000 },
    ];
  },

  /**
   * Lấy thống kê chi tiết cho Shop Owner
   */
  getShopDashboardStats: async () => {
    try {
      // Vì các service đã có logic fetch riêng, ta chỉ cần gọi và tổng hợp
      // Tuy nhiên để tối ưu, ta có thể fetch 1 lượt ở component Dashboard.jsx
      // Service này đóng vai trò helper nếu cần reuse logic
      return null; 
    } catch (error) {
      console.error("Error in getShopDashboardStats:", error);
      throw error;
    }
  }
};

export default DashboardService;
