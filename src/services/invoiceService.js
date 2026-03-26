// =====================================================
// INVOICE SERVICE - Mock API & Real API
// =====================================================
// Chuyển đổi dễ dàng giữa Mock API (test UI) và Real API (production)

// ========== CONFIG ==========
const API_CONFIG = {
  USE_MOCK_API: true, // TRUE: Mock API | FALSE: Real API
  API_BASE_URL: 'http://localhost:8080/api', // Thay đổi URL backend
  TIMEOUT: 5000,
};

// ========== MOCK DATA ==========
const MOCK_INVOICES = [
  {
    id: 'HD-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    address: '123 Đường Phố, Quận 1, TP.HCM',
    date: '2024-01-15',
    product: 'Áo thun cao cấp',
    amount: '500.000đ',
    payment: 'Đã thanh toán',
    status: 'completed',
    type: 'normal',
  },
  {
    id: 'HD-002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987654321',
    address: '456 Đường Lớn, Quận 3, TP.HCM',
    date: '2024-01-16',
    product: 'Quần jean nam',
    amount: '750.000đ',
    payment: 'Chưa thanh toán',
    status: 'pending',
    type: 'normal',
  },
  {
    id: 'HD-003',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    phone: '0978123456',
    address: '789 Đường Mới, Quận 5, TP.HCM',
    date: '2024-01-10',
    product: 'Váy nữ cao cấp',
    amount: '1.200.000đ',
    payment: 'Chưa thanh toán',
    status: 'pending',
    type: 'overdue',
  },
  {
    id: 'HD-004',
    name: 'Phạm Thị D',
    email: 'phamthid@email.com',
    phone: '0901234567',
    address: '321 Đường Ngắn, Quận 7, TP.HCM',
    date: '2024-01-18',
    product: 'Áo khoác nam',
    amount: '950.000đ',
    payment: 'Đã thanh toán',
    status: 'completed',
    type: 'normal',
  },
  {
    id: 'HD-005',
    name: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    phone: '0945678901',
    address: '654 Đường Dài, Quận 2, TP.HCM',
    date: '2024-01-19',
    product: 'Giày thể thao',
    amount: '650.000đ',
    payment: 'Đã thanh toán',
    status: 'completed',
    type: 'normal',
  },
];

const MOCK_INVOICE_DETAILS = {
  'HD-001': {
    id: 'HD-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    address: '123 Đường Phố, Quận 1, TP.HCM',
    date: '2024-01-15',
    product: 'Áo thun cao cấp',
    amount: '500.000đ',
    payment: 'Đã thanh toán',
    status: 'completed',
    type: 'normal',
    items: [
      { name: 'Áo thun cao cấp - Tím', quantity: 2, price: '250.000đ', total: '500.000đ' },
    ],
    subtotal: '500.000đ',
    tax: '50.000đ',
    total: '550.000đ',
    notes: 'Đơn hàng được thanh toán bằng chuyển khoản',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 14:45:00',
  },
  'HD-002': {
    id: 'HD-002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0987654321',
    address: '456 Đường Lớn, Quận 3, TP.HCM',
    date: '2024-01-16',
    product: 'Quần jean nam',
    amount: '750.000đ',
    payment: 'Chưa thanh toán',
    status: 'pending',
    type: 'normal',
    items: [
      { name: 'Quần jean nam - Đen', quantity: 1, price: '750.000đ', total: '750.000đ' },
    ],
    subtotal: '750.000đ',
    tax: '75.000đ',
    total: '825.000đ',
    notes: 'Chờ khách hàng thanh toán',
    createdAt: '2024-01-16 09:15:00',
    updatedAt: '2024-01-16 09:15:00',
  },
};

// ========== HELPER FUNCTIONS ==========
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleError = (error) => {
  console.error('[Invoice Service Error]:', error);
  return {
    success: false,
    error: error.message || 'Có lỗi xảy ra',
    data: null,
  };
};

// ========== MOCK API FUNCTIONS ==========
const mockAPI = {
  // Get all invoices
  getAllInvoices: async () => {
    try {
      await delay(500); // Simulate network delay
      return {
        success: true,
        data: MOCK_INVOICES,
        message: 'Lấy danh sách hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id) => {
    try {
      await delay(300);
      const invoice = MOCK_INVOICE_DETAILS[id];
      if (!invoice) {
        return {
          success: false,
          error: `Không tìm thấy hóa đơn ${id}`,
          data: null,
        };
      }
      return {
        success: true,
        data: invoice,
        message: 'Lấy chi tiết hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete invoice
  deleteInvoice: async (id) => {
    try {
      await delay(400);
      const index = MOCK_INVOICES.findIndex((inv) => inv.id === id);
      if (index === -1) {
        return {
          success: false,
          error: `Không tìm thấy hóa đơn ${id}`,
        };
      }
      MOCK_INVOICES.splice(index, 1);
      delete MOCK_INVOICE_DETAILS[id];
      return {
        success: true,
        message: 'Xóa hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Create invoice
  createInvoice: async (invoiceData) => {
    try {
      await delay(500);
      const newInvoice = {
        id: `HD-${String(MOCK_INVOICES.length + 1).padStart(3, '0')}`,
        ...invoiceData,
        createdAt: new Date().toISOString(),
      };
      MOCK_INVOICES.push(newInvoice);
      return {
        success: true,
        data: newInvoice,
        message: 'Tạo hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Update invoice
  updateInvoice: async (id, updateData) => {
    try {
      await delay(400);
      const invoice = MOCK_INVOICES.find((inv) => inv.id === id);
      if (!invoice) {
        return {
          success: false,
          error: `Không tìm thấy hóa đơn ${id}`,
        };
      }
      const updated = { ...invoice, ...updateData, updatedAt: new Date().toISOString() };
      const index = MOCK_INVOICES.findIndex((inv) => inv.id === id);
      MOCK_INVOICES[index] = updated;
      MOCK_INVOICE_DETAILS[id] = updated;
      return {
        success: true,
        data: updated,
        message: 'Cập nhật hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ========== REAL API FUNCTIONS ==========
const realAPI = {
  // Get all invoices
  getAllInvoices: async () => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token')}`, // Nếu có token
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: 'Lấy danh sách hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/invoices/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: `Không tìm thấy hóa đơn ${id}`,
            data: null,
          };
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: 'Lấy chi tiết hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete invoice
  deleteInvoice: async (id) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Xóa hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Create invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Tạo hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },

  // Update invoice
  updateInvoice: async (id, updateData) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Cập nhật hóa đơn thành công',
      };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ========== INVOICE SERVICE (EXPORTED) ==========
const invoiceService = {
  // Chọn API (Mock hoặc Real)
  _getAPI: () => (API_CONFIG.USE_MOCK_API ? mockAPI : realAPI),

  // Get all invoices
  getMockInvoices: async () => {
    const api = invoiceService._getAPI();
    return api.getAllInvoices();
  },

  // Get invoice detail by ID
  getMockInvoiceById: async (id) => {
    const api = invoiceService._getAPI();
    return api.getInvoiceById(id);
  },

  // Delete invoice
  deleteMockInvoice: async (id) => {
    const api = invoiceService._getAPI();
    return api.deleteInvoice(id);
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    const api = invoiceService._getAPI();
    return api.createInvoice(invoiceData);
  },

  // Update invoice
  updateInvoice: async (id, updateData) => {
    const api = invoiceService._getAPI();
    return api.updateInvoice(id, updateData);
  },

  // Switch between Mock and Real API
  setUseMockAPI: (useMock) => {
    API_CONFIG.USE_MOCK_API = useMock;
    console.log(
      `[Invoice Service] Switched to ${useMock ? 'MOCK' : 'REAL'} API`
    );
  },

  // Set API Base URL
  setAPIBaseURL: (url) => {
    API_CONFIG.API_BASE_URL = url;
    console.log(`[Invoice Service] API Base URL set to: ${url}`);
  },

  // Get current config
  getConfig: () => ({ ...API_CONFIG }),
};

export default invoiceService;
