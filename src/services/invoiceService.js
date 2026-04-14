

// =====================================================
// INVOICE SERVICE - Real API
// =====================================================

import api from './api';

// ========== CONFIG ==========
const API_CONFIG = {
  USE_MOCK_API: false, // Turned OFF to use real backend

  TIMEOUT: 5000,
};

// ========== MOCK DATA ==========
// Chú ý: id của MOCK_INVOICES phải khớp với key của MOCK_INVOICE_DETAILS
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
        quantity: 1,
      },
    ],
    totalAmount: 1250000,
    shippingFee: 30000,
    discount: 50000,
    finalAmount: 1230000,
    paymentMethod: 'Thẻ tín dụng',
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
        quantity: 2,
      },
      {
        id: 'p3',
        name: 'Quần Short thể thao Quick-Dry',
        image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85,format=auto/uploads/February2024/quan-short-the-thao-den-1.jpg',
        variant: 'Xanh Navy, Size L',
        price: 199000,
        quantity: 1,
      },
    ],
    totalAmount: 797000,
    shippingFee: 0,
    discount: 20000,
    finalAmount: 777000,
    paymentMethod: 'Ví ShopeePay',
  },
  {
    id: 'ORD55554444',
    shopName: 'Marc Fashion',
    shopLogo: 'https://marc.com.vn/cdn/shop/files/Logo_MARC_2023_Black.png',
    date: '2024-03-24 18:20',
    status: 'pending',
    statusText: 'Chờ xác nhận',
    items: [
      {
        id: 'p4',
        name: 'Đầm Midi Hoa Nhí Dáng Xòe tay phồng',
        image: 'https://marc.com.vn/cdn/shop/files/24-0238_1.jpg',
        variant: 'Hoa xanh, Size M',
        price: 850000,
        quantity: 1,
      },
    ],
    totalAmount: 850000,
    shippingFee: 25000,
    discount: 0,
    finalAmount: 875000,
    paymentMethod: 'Chuyển khoản ngân hàng',
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
        quantity: 1,
      },
    ],
    totalAmount: 550000,
    shippingFee: 0,
    discount: 0,
    finalAmount: 550000,
    paymentMethod: 'COD',
  },
  {
    id: 'ORD33336666',
    shopName: 'Nike Vietnam Official',
    shopLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
    date: '2024-04-01 08:00',
    status: 'confirmed',
    statusText: 'Đang chuẩn bị',
    items: [
      {
        id: 'p6',
        name: 'Nike Air Force 1 Low - White',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/air-force-1-07-shoes-WrLlWX.png',
        variant: 'Trắng, Size 43',
        price: 2890000,
        quantity: 1,
      },
    ],
    totalAmount: 2890000,
    shippingFee: 0,
    discount: 100000,
    finalAmount: 2790000,
    paymentMethod: 'Momo',
  },
];

// MOCK_INVOICE_DETAILS — key phải KHỚP với id trong MOCK_INVOICES
const MOCK_INVOICE_DETAILS = {
  'ORD12345678': {
    orderId: 'ORD12345678',
    orderStatus: 'Completed',
    paymentStatus: 'Paid',
    createdAt: '2024-03-20T14:30:00.000Z',
    shippingAddress: '123 Đường Phố, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 1230000,
    shippingFee: 30000,
    discount: 50000,
    payment: { method: 'Thẻ tín dụng', transactionCode: 'TXN-001-20240320' },
    invoice: { invoiceNumber: 'INV-2024-001' },
    store: { storeName: 'Ananas Official Store' },
    items: [
      {
        productName: 'Giày Sneaker Ananas Track 6 - Classics Grey',
        image: 'https://ananas.vn/wp-content/uploads/Track6_Grey_1.jpg',
        variant: 'Grey, Size 42',
        price: 1250000,
        quantity: 1,
        total: 1250000,
      },
    ],
  },
  'ORD88889999': {
    orderId: 'ORD88889999',
    orderStatus: 'Shipping',
    paymentStatus: 'Paid',
    createdAt: '2024-03-22T09:15:00.000Z',
    shippingAddress: '456 Đường Lớn, Phường 5, Quận 3, TP. Hồ Chí Minh',
    totalAmount: 777000,
    shippingFee: 0,
    discount: 20000,
    payment: { method: 'Ví ShopeePay', transactionCode: 'TXN-002-20240322' },
    invoice: { invoiceNumber: 'INV-2024-002' },
    store: { storeName: 'Coolmate Official' },

    items: [
      {
        productName: 'Áo thun Cotton Compact phiên bản Premium',
        image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85,format=auto/uploads/January2024/ao-thun-cotton-compact-premium-den-1.jpg',
        variant: 'Đen, Size L',
        price: 299000,
        quantity: 2,
        total: 598000,
      },
      {
        productName: 'Quần Short thể thao Quick-Dry',
        image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85,format=auto/uploads/February2024/quan-short-the-thao-den-1.jpg',
        variant: 'Xanh Navy, Size L',
        price: 199000,
        quantity: 1,
        total: 199000,
      },
    ],
  },
  'ORD55554444': {
    orderId: 'ORD55554444',
    orderStatus: 'Pending',
    paymentStatus: 'Unpaid',
    createdAt: '2024-03-24T18:20:00.000Z',
    shippingAddress: '789 Lý Thái Tổ, Phường 9, Quận 10, TP. Hồ Chí Minh',
    totalAmount: 875000,
    shippingFee: 25000,
    discount: 0,
    payment: { method: 'Chuyển khoản ngân hàng', transactionCode: null },
    invoice: null,
    store: { storeName: 'Marc Fashion' },
    items: [
      {
        productName: 'Đầm Midi Hoa Nhí Dáng Xòe tay phồng',
        image: 'https://marc.com.vn/cdn/shop/files/24-0238_1.jpg',
        variant: 'Hoa xanh, Size M',
        price: 850000,
        quantity: 1,
        total: 850000,
      },
    ],
  },
  'ORD11112222': {
    orderId: 'ORD11112222',
    orderStatus: 'Cancelled',
    paymentStatus: 'Unpaid',
    createdAt: '2024-03-10T11:00:00.000Z',
    shippingAddress: '101 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 550000,
    shippingFee: 0,
    discount: 0,
    payment: { method: 'COD', transactionCode: null },
    invoice: null,
    store: { storeName: 'DirtyCoins Studio' },
    items: [
      {

        productName: 'Hoodie Box Logo Limited Edition',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=85&auto=format&fit=crop',
        variant: 'Trắng, Size XL',
        price: 550000,
        quantity: 1,
        total: 550000,
      },
    ],
  },
  'ORD33336666': {
    orderId: 'ORD33336666',
    orderStatus: 'Confirmed',
    paymentStatus: 'Paid',
    createdAt: '2024-04-01T08:00:00.000Z',
    shippingAddress: '50 Pasteur, Phường Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh',
    totalAmount: 2790000,
    shippingFee: 0,
    discount: 100000,
    payment: { method: 'Momo', transactionCode: 'TXN-003-20240401' },
    invoice: { invoiceNumber: 'INV-2024-003' },
    store: { storeName: 'Nike Vietnam Official' },
    items: [
      {
        productName: 'Nike Air Force 1 Low - White',
        image: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e6da41fa-1be4-4ce5-b89c-22be4f1f02d4/air-force-1-07-shoes-WrLlWX.png',
        variant: 'Trắng, Size 43',
        price: 2890000,
        quantity: 1,
        total: 2890000,
      },
    ],
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
  getAllInvoices: async () => {
    try {
      await delay(400);
      return { success: true, data: MOCK_INVOICES, message: 'Lấy danh sách đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },

  getInvoiceById: async (id) => {
    try {
      await delay(300);
      const detail = MOCK_INVOICE_DETAILS[id];
      if (!detail) {
        return { success: false, error: `Không tìm thấy đơn hàng ${id}`, data: null };
      }
      return { success: true, data: detail, message: 'Lấy chi tiết đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },

  cancelOrder: async (id) => {
    try {
      await delay(400);
      const detail = MOCK_INVOICE_DETAILS[id];
      if (!detail) return { success: false, error: `Không tìm thấy đơn hàng ${id}` };
      // Check cancellable status
      const s = detail.orderStatus.toLowerCase();
      if (!['pending', 'confirmed'].includes(s)) {
        return { success: false, error: 'Không thể hủy đơn hàng ở trạng thái này' };
      }
      detail.orderStatus = 'Cancelled';
      const inv = MOCK_INVOICES.find(i => i.id === id);
      if (inv) { inv.status = 'cancelled'; inv.statusText = 'Đã hủy'; }
      return { success: true, data: detail, message: 'Hủy đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },

  deleteInvoice: async (id) => {
    try {
      await delay(400);
      const index = MOCK_INVOICES.findIndex((inv) => inv.id === id);
      if (index === -1) return { success: false, error: `Không tìm thấy đơn hàng ${id}` };
      MOCK_INVOICES.splice(index, 1);
      delete MOCK_INVOICE_DETAILS[id];
      return { success: true, message: 'Xóa đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },

  createInvoice: async (invoiceData) => {
    try {
      await delay(500);
      const newInvoice = {
        id: `ORD${Date.now()}`,
        ...invoiceData,
        createdAt: new Date().toISOString(),
      };
      MOCK_INVOICES.push(newInvoice);
      return { success: true, data: newInvoice, message: 'Tạo đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },

  updateInvoice: async (id, updateData) => {
    try {
      await delay(400);
      const index = MOCK_INVOICES.findIndex((inv) => inv.id === id);
      if (index === -1) return { success: false, error: `Không tìm thấy đơn hàng ${id}` };
      const updated = { ...MOCK_INVOICES[index], ...updateData };
      MOCK_INVOICES[index] = updated;
      if (MOCK_INVOICE_DETAILS[id]) MOCK_INVOICE_DETAILS[id] = { ...MOCK_INVOICE_DETAILS[id], ...updateData };
      return { success: true, data: updated, message: 'Cập nhật đơn hàng thành công' };
    } catch (error) {
      return handleError(error);
    }
  },
};

// ========== REAL API FUNCTIONS ==========
const realAPI = {

  // Get all invoices for the current user
  getAllInvoices: async () => {
    try {
      // Backend: /order/order-user returns list of user's orders
      const response = await api.get('/order/order-user');
      // Assume structure is response.data.data.order or response.data.data
      const rawData = response.data?.data?.order || response.data?.data || response.data || [];
      return {
        success: true,
        data: rawData,

        message: 'Lấy danh sách đơn hàng thành công',
      };
    } catch (error) {
      console.warn('[Invoice] Real API failed, falling back to mock:', error.message);
      return mockAPI.getAllInvoices();
    }
  },

  getInvoiceById: async (id) => {
    try {

      const response = await api.get(`/order/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Lấy chi tiết đơn hàng thành công',
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: `Không tìm thấy đơn hàng ${id}`,
          data: null,
        };
      }
      return handleError(error);
    }
  },

  // Delete/Cancel invoice (Backend usually uses patch/delete)
  deleteInvoice: async (id) => {
    try {
      const response = await api.patch(`/order/${id}`, { orderStatus: 'cancelled' });
      return {
        success: true,
        message: response.data.message || 'Hủy đơn hàng thành công',

      };

    } catch (error) {
      console.warn('[Invoice] Real API failed, falling back to mock:', error.message);
      return mockAPI.cancelOrder(id);
    }
  },

  deleteInvoice: async (id) => {
    try {
      const response = await apiRequest.delete(`/invoices/${id}`);
      return { success: true, message: response.data?.message || 'Xóa thành công' };
    } catch (error) {
      return handleError(error);
    }
  },



  // Create invoice (Usually part of checkout)
  createInvoice: async (orderData) => {
    try {
      const response = await api.post('/order', orderData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Tạo đơn hàng thành công',
      };

    } catch (error) {
      return handleError(error);
    }
  },

  updateInvoice: async (id, updateData) => {
    try {


      const response = await api.patch(`/order/${id}`, updateData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cập nhật đơn hàng thành công',
      };

    } catch (error) {
      return handleError(error);
    }
  },
};

// ========== INVOICE SERVICE (EXPORTED) ==========
const InvoiceService = {
  _getAPI: () => (API_CONFIG.USE_MOCK_API ? mockAPI : realAPI),



  // Get all invoices
  getAllInvoices: async () => {
    const api = InvoiceService._getAPI();
    return api.getAllInvoices();
  },

  // Get invoice detail by ID
  getInvoiceById: async (id) => {
    const api = InvoiceService._getAPI();
    return api.getInvoiceById(id);
  },

  // Delete/Cancel invoice
  deleteInvoice: async (id) => {
    const api = InvoiceService._getAPI();
    return api.deleteInvoice(id);
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    const api = InvoiceService._getAPI();
    return api.createInvoice(invoiceData);
  },

  // Update invoice
  updateInvoice: async (id, updateData) => {
    const api = InvoiceService._getAPI();
    return api.updateInvoice(id, updateData);
  },

  // Switch between Mock and Real API


  setUseMockAPI: (useMock) => {
    API_CONFIG.USE_MOCK_API = useMock;
    console.log(`[Invoice Service] Switched to ${useMock ? 'MOCK' : 'REAL'} API`);
  },



  // Get current config

  getConfig: () => ({ ...API_CONFIG }),
};

export default InvoiceService;
