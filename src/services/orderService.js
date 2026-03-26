// ========== CONFIG ==========
const API_CONFIG = {
  USE_MOCK_API: true, // TRUE: Mock API | FALSE: Real API
  API_BASE_URL: 'http://localhost:8080/api', // Thay đổi URL backend
  TIMEOUT: 5000,
};

// ========== MOCK DATA ==========
const MOCK_ORDERS = [
  {
    id: "#ORD-1001",
    name: "Nguyễn Văn A",
    email: "a@gmail.com",
    phone: "0901234567",
    product: "Áo thun",
    amount: "200000đ",
    address: "Đà Nẵng",
    date: "26/03/2026 10:00",
    type: "pending",
    status: "Chờ xử lý",
    payment: "Chưa thanh toán",
  },
  {
    id: "#ORD-1002",
    name: "Trần Thị B",
    email: "b@gmail.com",
    phone: "0912345678",
    product: "Quần jean",
    amount: "500000đ",
    address: "Hà Nội",
    date: "25/03/2026 14:20",
    type: "completed",
    status: "Hoàn thành",
    payment: "Đã thanh toán",
  },
  {
    id: "#ORD-1003",
    name: "Lê Văn C",
    email: "c@gmail.com",
    phone: "0923456789",
    product: "Giày thể thao",
    amount: "1200000đ",
    address: "Hồ Chí Minh",
    date: "24/03/2026 09:15",
    type: "shipping",
    status: "Đang giao",
    payment: "Đã thanh toán",
  },
  {
    id: "#ORD-1004",
    name: "Phạm Thị D",
    email: "d@gmail.com",
    phone: "0934567890",
    product: "Mũ lưỡi trai",
    amount: "350000đ",
    address: "Cần Thơ",
    date: "23/03/2026 16:45",
    type: "cancelled",
    status: "Đã hủy",
    payment: "Chưa thanh toán",
  },
  {
    id: "#ORD-1005",
    name: "Hoàng Văn E",
    email: "e@gmail.com",
    phone: "0945678901",
    product: "Túi xách",
    amount: "750000đ",
    address: "Hải Phòng",
    date: "22/03/2026 11:30",
    type: "pending",
    status: "Chờ xử lý",
    payment: "Chưa thanh toán",
  },
];

// ========== HELPER FUNCTIONS ==========
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeout = API_CONFIG.TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// ========== MOCK API FUNCTIONS ==========
const mockGetOrders = async (params = {}) => {
  await delay(800); // Mô phỏng delay API
  
  let filtered = [...MOCK_ORDERS];
  
  // Lọc theo tên/email/mã đơn
  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(order => 
      order.name.toLowerCase().includes(search) ||
      order.email.toLowerCase().includes(search) ||
      order.id.toLowerCase().includes(search)
    );
  }
  
  // Lọc theo trạng thái
  if (params.status && params.status !== '') {
    filtered = filtered.filter(order => order.type === params.status);
  }
  
  // Lọc theo thanh toán
  if (params.payment && params.payment !== '') {
    filtered = filtered.filter(order => {
      if (params.payment === 'paid') return order.payment.includes('Đã thanh toán');
      if (params.payment === 'unpaid') return order.payment.includes('Chưa thanh toán');
      if (params.payment === 'refunded') return order.payment.includes('Đã hoàn tiền');
      return true;
    });
  }
  
  // Phân trang
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  
  const paginatedData = filtered.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filtered.length / limit);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      total: filtered.length,
      totalPages,
      hasMore: page < totalPages,
    }
  };
};

const mockGetOrderById = async (id) => {
  await delay(500);
  const order = MOCK_ORDERS.find(o => o.id === id);
  if (!order) throw new Error('Order not found');
  return order;
};

const mockCreateOrder = async (order) => {
  await delay(800);
  const newOrder = {
    ...order,
    id: `#ORD-${Math.floor(Math.random() * 9000) + 1000}`,
  };
  MOCK_ORDERS.push(newOrder);
  return newOrder;
};

const mockUpdateOrder = async (id, order) => {
  await delay(800);
  const index = MOCK_ORDERS.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Order not found');
  MOCK_ORDERS[index] = { ...MOCK_ORDERS[index], ...order };
  return MOCK_ORDERS[index];
};

const mockDeleteOrder = async (id) => {
  await delay(600);
  const index = MOCK_ORDERS.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Order not found');
  MOCK_ORDERS.splice(index, 1);
  return { success: true };
};

// ========== REAL API FUNCTIONS ==========
const apiGetOrders = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.payment) query.append('payment', params.payment);
    
    const response = await fetchWithTimeout(
      `${API_CONFIG.API_BASE_URL}/orders?${query.toString()}`
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    return {
      data: Array.isArray(data) ? data : data.data || [],
      pagination: data.pagination || {
        page: params.page || 1,
        total: Array.isArray(data) ? data.length : data.total || 0,
        totalPages: 1,
        hasMore: false,
      }
    };
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

const apiGetOrderById = async (id) => {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.API_BASE_URL}/orders/${id}`
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

const apiCreateOrder = async (order) => {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.API_BASE_URL}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

const apiUpdateOrder = async (id, order) => {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.API_BASE_URL}/orders/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

const apiDeleteOrder = async (id) => {
  try {
    const response = await fetchWithTimeout(
      `${API_CONFIG.API_BASE_URL}/orders/${id}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ========== SERVICE EXPORT ==========
const orderService = {
  // Config methods
  setUseMockAPI: (useMock) => {
    API_CONFIG.USE_MOCK_API = useMock;
  },
  
  setAPIBaseURL: (url) => {
    API_CONFIG.API_BASE_URL = url;
  },
  
  getConfig: () => ({ ...API_CONFIG }),
  
  // Get Orders
  getOrders: async (params = {}) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Using MOCK data');
        return await mockGetOrders(params);
      } else {
        console.log('[v0] Calling REAL API:', `${API_CONFIG.API_BASE_URL}/orders`);
        return await apiGetOrders(params);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error (fallback):', error.message);
        return await mockGetOrders(params);
      } else {
        console.error('[v0] REAL API failed - NO FALLBACK:', error.message);
        throw error; // Không fallback, để component xử lý error
      }
    }
  },
  
  // Get Order By ID
  getOrderById: async (id) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        console.log('[v0] Using MOCK data for ID:', id);
        return await mockGetOrderById(id);
      } else {
        console.log('[v0] Calling REAL API for ID:', id);
        return await apiGetOrderById(id);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        return await mockGetOrderById(id);
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },
  
  // Create Order
  createOrder: async (order) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        return await mockCreateOrder(order);
      } else {
        return await apiCreateOrder(order);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },
  
  // Update Order
  updateOrder: async (id, order) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        return await mockUpdateOrder(id, order);
      } else {
        return await apiUpdateOrder(id, order);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },
  
  // Delete Order
  deleteOrder: async (id) => {
    try {
      if (API_CONFIG.USE_MOCK_API) {
        return await mockDeleteOrder(id);
      } else {
        return await apiDeleteOrder(id);
      }
    } catch (error) {
      if (API_CONFIG.USE_MOCK_API) {
        console.warn('[v0] Mock API error:', error.message);
        throw error;
      } else {
        console.error('[v0] REAL API failed:', error.message);
        throw error;
      }
    }
  },
};

export default orderService;
