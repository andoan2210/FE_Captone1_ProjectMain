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
    id: 'ORD12345678',
    shopName: 'Ananas Official Store',
    shopLogo: 'https://ananas.vn/wp-content/uploads/logo_ananas.png',
    date: '2024-03-20 14:30',
    status: 'completed',
    statusText: 'Hoàn thành',
    items: [
      {
        id: 'p1',
        name: 'Giày Sneaker Ananas Track 6 - Classics Grey',
        image: 'https://ananas.vn/wp-content/uploads/Track6_Grey_1.jpg',
        variant: 'Grey, Size 42',
        price: 1250000,
        quantity: 1
      }
    ],
    totalAmount: 1250000,
    shippingFee: 30000,
    discount: 50000,
    finalAmount: 1230000,
    paymentMethod: 'Thẻ tín dụng'
  },
  {
    id: 'ORD88889999',
    shopName: 'Coolmate Official',
    shopLogo: 'https://mms.businesswire.com/media/20210518005459/en/878954/5/Coolmate_Logo.jpg',
    date: '2024-03-22 09:15',
    status: 'shipping',
    statusText: 'Đang vận chuyển',
    items: [
      {
        id: 'p2',
        name: 'Áo thun Cotton Compact phiên bản Premium',
        image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85,format=auto/uploads/January2024/ao-thun-cotton-compact-premium-den-1.jpg',
        variant: 'Đen, Size L',
        price: 299000,
        quantity: 2
      },
      {
        id: 'p3',
        name: 'Quần Short thể thao Quick-Dry',
        image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85,format=auto/uploads/February2024/quan-short-the-thao-den-1.jpg',
        variant: 'Xanh Navy, Size L',
        price: 199000,
        quantity: 1
      }
    ],
    totalAmount: 797000,
    shippingFee: 0,
    discount: 20000,
    finalAmount: 777000,
    paymentMethod: 'Ví ShopeePay'
  },
  {
    id: 'ORD55554444',
    shopName: 'Marc Fashion',
    shopLogo: 'https://marc.com.vn/cdn/shop/files/Logo_MARC_2023_Black.png',
    date: '2024-03-24 18:20',
    status: 'pending_payment',
    statusText: 'Chờ thanh toán',
    items: [
      {
        id: 'p4',
        name: 'Đầm Midi Hoa Nhí Dáng Xòe tay phồng',
        image: 'https://marc.com.vn/cdn/shop/files/24-0238_1.jpg',
        variant: 'Hoa xanh, Size M',
        price: 850000,
        quantity: 1
      }
    ],
    totalAmount: 850000,
    shippingFee: 25000,
    discount: 0,
    finalAmount: 875000,
    paymentMethod: 'Chuyển khoản ngân hàng'
  },
  {
    id: 'ORD11112222',
    shopName: 'DirtyCoins Studio',
    shopLogo: 'https://dirtycoins.vn/images/logo.png',
    date: '2024-03-10 11:00',
    status: 'cancelled',
    statusText: 'Đã hủy',
    items: [
      {
        id: 'p5',
        name: 'Hoodie Box Logo Limited Edition',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=85&auto=format&fit=crop',
        variant: 'Trắng, Size XL',
        price: 550000,
        quantity: 1
      }
    ],
    totalAmount: 550000,
    shippingFee: 0,
    discount: 0,
    finalAmount: 550000,
    paymentMethod: 'COD'
  }
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
