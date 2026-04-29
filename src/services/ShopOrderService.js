import api from "./api";

// Hàm hỗ trợ format tiền tệ
const formatVND = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
};

// Hàm hỗ trợ format ngày tháng
const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
};

// Ánh xạ trạng thái từ BE sang FE
const mapStatus = (beStatus) => {
  const statusLower = (beStatus || "").toLowerCase();
  const mapping = {
    pending: { label: "Chờ xử lý", type: "pending" },
    confirmed: { label: "Đã xác nhận", type: "confirmed" },
    processing: { label: "Đang xử lý", type: "confirmed" },
    shipping: { label: "Đang giao", type: "confirmed" },
    completed: { label: "Hoàn thành", type: "confirmed" },
    delivered: { label: "Đã giao", type: "confirmed" },
    cancelled: { label: "Đã hủy", type: "cancelled" },
  };
  return mapping[statusLower] || { label: beStatus, type: "pending" };
};

// Ánh xạ trạng thái thanh toán từ BE sang FE
const mapPaymentStatus = (bePaymentStatus) => {
  const statusLower = (bePaymentStatus || "").toLowerCase();
  const mapping = {
    unpaid: "Chưa thanh toán",
    success: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  };
  return mapping[statusLower] || bePaymentStatus;
};

const ShopOrderService = {
  // Lấy danh sách đơn hàng của Shop
  getOrders: async (params = {}) => {
    try {
      let res = await api.get("/order/order-shop", {
        params: { ...params, limit: 1000 },
      });

      // Trích xuất mảng dữ liệu một cách an toàn
      const body = res.data;
      let rawOrders = [];

      if (Array.isArray(body)) {
        rawOrders = body;
      } else if (body?.data) {
        if (Array.isArray(body.data)) {
          rawOrders = body.data;
        } else if (body.data.order && Array.isArray(body.data.order)) {
          rawOrders = body.data.order;
        } else if (body.data.items && Array.isArray(body.data.items)) {
          rawOrders = body.data.items;
        }
      }

      // Đảm bảo rawOrders là một mảng trước khi thực hiện các thao tác tiếp theo
      if (!Array.isArray(rawOrders)) {
        console.error("[ShopOrderService] Dữ liệu trả về không hợp lệ:", body);
        rawOrders = [];
      }

      // Sắp xếp đơn hàng mới nhất lên đầu (Mới nhất -> Cũ nhất)
      rawOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Client-side Filtering
      if (params.search) {
        const query = params.search.toLowerCase();
        rawOrders = rawOrders.filter(
          (o) =>
            o.orderId.toString().includes(query) ||
            (o.user?.FullName || "").toLowerCase().includes(query) ||
            (o.products || []).some((p) => p.toLowerCase().includes(query)),
        );
      }

      if (params.status) {
        rawOrders = rawOrders.filter(
          (o) =>
            o.orderStatus?.toLowerCase() === params.status.toLowerCase() ||
            mapStatus(o.orderStatus).type === params.status,
        );
      }

      if (params.payment) {
        rawOrders = rawOrders.filter(
          (o) =>
            (o.paymentStatus || "").toLowerCase() ===
            params.payment.toLowerCase(),
        );
      }

      if (params.startDate) {
        const start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        rawOrders = rawOrders.filter((o) => new Date(o.createdAt) >= start);
      }

      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        rawOrders = rawOrders.filter((o) => new Date(o.createdAt) <= end);
      }

      // Pagination setup
      const total = rawOrders.length;
      const page = params.page || 1;
      const limit = params.limit || 8;
      const startIndex = (page - 1) * limit;
      const paginatedOrders = rawOrders.slice(startIndex, startIndex + limit);

      const mappedData = paginatedOrders.map((order) => {
        const statusInfo = mapStatus(order.orderStatus);
        return {
          id: `#ORD-${order.orderId}`,
          name: order.user?.FullName || "Khách hàng",
          email: order.user?.Email || "",
          phone: order.user?.Phone || "",
          product: order.products?.join(", ") || "Chưa có thông tin",
          amount: formatVND(order.totalAmount),
          address: order.address || "Hệ thống",
          date: formatDateTime(order.createdAt),
          orderId: order.orderId,
          type: statusInfo.type,
          status: statusInfo.label,
          paymentStatus: order.paymentStatus,
          payment: mapPaymentStatus(order.paymentStatus),
        };
      });

      return {
        data: mappedData,
        pagination: {
          page: page,
          total: total,
          totalPages: Math.ceil(total / limit),
          hasMore: startIndex + limit < total,
        },
      };
    } catch (error) {
      console.error("Error fetching shop orders:", error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng đầy đủ (Dùng cho Modal)
  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(`/order/order-detail/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("[ShopOrderService] Lỗi khi lấy chi tiết đơn hàng:", error);
      throw error;
    }
  },

  // Lấy đơn hàng theo ID (Dùng cho các mục đích khác)
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      throw error;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await api.post("/order", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái/thông tin đơn hàng
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.patch(`/order/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  // Xóa đơn hàng
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/order/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  // Xác thực thanh toán MoMo
  verifyMomoPayment: async (orderId, resultCode) => {
    try {
      const response = await api.post("/order/verify-momo-payment", {
        orderId: String(orderId),
        resultCode: String(resultCode),
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying MoMo payment:", error);
      throw error;
    }
  },
};

export default ShopOrderService;
