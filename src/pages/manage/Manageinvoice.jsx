import { useState, useEffect, useMemo } from 'react';
import invoiceService from '../../services/invoiceService';
import './Manageinvoice.css';

export default function Manageinvoice() {
  // ==================== STATE ====================
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.getMockInvoices();
      setInvoices(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn. Vui lòng thử lại.');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERED DATA ====================
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    
    // Filter by tab
    if (activeTab === 'pending') {
      result = result.filter(inv => inv.payment === 'Chưa thanh toán');
    } else if (activeTab === 'completed') {
      result = result.filter(inv => inv.payment === 'Đã thanh toán');
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(inv => 
        inv.id.toLowerCase().includes(term) ||
        inv.name.toLowerCase().includes(term) ||
        inv.email.toLowerCase().includes(term) ||
        inv.phone.includes(term)
      );
    }
    
    return result;
  }, [invoices, activeTab, searchTerm]);

  // ==================== STATISTICS ====================
  const statistics = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.replace(/[^\d]/g, '')) || 0;
      return sum + amount;
    }, 0);
    
    const pendingInvoices = invoices.filter(inv => inv.payment === 'Chưa thanh toán');
    const completedInvoices = invoices.filter(inv => inv.payment === 'Đã thanh toán');
    
    const pendingAmount = pendingInvoices.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.replace(/[^\d]/g, '')) || 0;
      return sum + amount;
    }, 0);
    
    const completedAmount = completedInvoices.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.replace(/[^\d]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const overdueInvoices = invoices.filter(inv => inv.type === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => {
      const amount = parseInt(inv.amount.replace(/[^\d]/g, '')) || 0;
      return sum + amount;
    }, 0);
    
    return {
      totalRevenue,
      pendingCount: pendingInvoices.length,
      pendingAmount,
      completedAmount,
      overdueCount: overdueInvoices.length,
      overdueAmount
    };
  }, [invoices]);

  // ==================== VALIDATION ====================
  const validateSearchInput = (value) => {
    // Cho phep chu cai, so, tieng Viet, email ky tu
    const regex = /^[a-zA-Z0-9\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ@._#-]*$/;
    return regex.test(value);
  };

  // ==================== HANDLERS ====================
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (validateSearchInput(value) || value === '') {
      setSearchTerm(value);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // View Invoice
  const handleViewInvoice = async (invoiceId) => {
    try {
      setIsProcessing(true);
      const response = await invoiceService.getMockInvoiceById(invoiceId);
      if (response && response.data) {
        setInvoiceDetail(response.data);
        setShowViewModal(true);
      } else {
        alert('Không tìm thấy hóa đơn!');
      }
    } catch (err) {
      console.error('Error fetching invoice detail:', err);
      alert('Có lỗi xảy ra khi tải chi tiết hóa đơn!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print Invoice
  const handlePrintInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      alert('Không tìm thấy hóa đơn!');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1e3a5f; }
          .invoice-title { font-size: 20px; margin-top: 10px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block { flex: 1; }
          .info-block h3 { color: #1e3a5f; margin-bottom: 10px; font-size: 14px; }
          .info-block p { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #1e3a5f; color: white; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-amount { font-size: 20px; font-weight: bold; color: #1e3a5f; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
          .status.paid { background: #dcfce7; color: #166534; }
          .status.pending { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SMART AI FASHION</div>
          <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>THÔNG TIN KHÁCH HÀNG</h3>
            <p><strong>Họ tên:</strong> ${invoice.name}</p>
            <p><strong>Email:</strong> ${invoice.email}</p>
            <p><strong>Điện thoại:</strong> ${invoice.phone}</p>
            <p><strong>Địa chỉ:</strong> ${invoice.address}</p>
          </div>
          <div class="info-block">
            <h3>THÔNG TIN HÓA ĐƠN</h3>
            <p><strong>Mã HD:</strong> ${invoice.id}</p>
            <p><strong>Ngày xuất:</strong> ${invoice.date}</p>
            <p><strong>Hình thức:</strong> ${invoice.product}</p>
            <p><strong>Trạng thái:</strong> <span class="status ${invoice.payment === 'Đã thanh toán' ? 'paid' : 'pending'}">${invoice.payment}</span></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.product}</td>
              <td>1</td>
              <td>${invoice.amount}</td>
              <td>${invoice.amount}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <p>Tạm tính: ${invoice.amount}</p>
          <p>VAT (10%): ${Math.round(parseInt(invoice.amount.replace(/[^\d]/g, '')) * 0.1).toLocaleString('vi-VN')}đ</p>
          <p class="total-amount">Tổng cộng: ${Math.round(parseInt(invoice.amount.replace(/[^\d]/g, '')) * 1.1).toLocaleString('vi-VN')}đ</p>
        </div>

        <div class="footer">
          <p>Cảm ơn quý khách đã mua hàng!</p>
          <p>Smart AI Fashion - Thời trang thông minh</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Delete Invoice
  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return;
    
    try {
      setIsProcessing(true);
      const response = await invoiceService.deleteMockInvoice(selectedInvoice.id);
      
      if (response && response.success) {
        setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id));
        setShowDeleteModal(false);
        setSelectedInvoice(null);
        alert('Xóa hóa đơn thành công!');
      } else {
        alert('Không thể xóa hóa đơn. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Có lỗi xảy ra khi xóa hóa đơn!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }
    
    // Tao CSV content
    const headers = ['Mã HD', 'Khách hàng', 'Email', 'SĐT', 'Ngày xuất', 'Số tiền', 'Trạng thái', 'Thanh toán'];
    const rows = filteredInvoices.map(inv => [
      inv.id,
      inv.name,
      inv.email,
      inv.phone,
      inv.date,
      inv.amount,
      inv.status,
      inv.payment
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hoa-don-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="material-symbols-outlined error-icon">error</span>
        <p>{error}</p>
        <button onClick={fetchInvoices} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div className="logo-text">
              <span className="logo-title">Smart AI Fashion</span>
              <span className="logo-subtitle">MANAGEMENT PORTAL</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Products</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>Orders</span>
          </a>
          <a href="#" className="nav-item active">
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Invoices</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">group</span>
            <span>Customers</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="create-invoice-btn">
            <span className="material-symbols-outlined">add_circle</span>
            <div className="btn-text">
              <span>Create New</span>
              <span>Invoice</span>
            </div>
          </button>

          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">contact_support</span>
            <span>Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search invoices, clients..." />
          </div>
          <div className="header-actions">
            <button className="header-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="header-btn">
              <span className="material-symbols-outlined">help</span>
            </button>
            <button className="header-btn">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Alex+Taylor&background=random" alt="User" className="user-avatar" />
              <span className="user-name">Alex Taylor</span>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {/* Page Header */}
          <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Quản lý Hóa đơn</h1>
          <p className="page-description">
            Theo dõi và quản lý các giao dịch tài chính của bạn
          </p>
        </div>
        <div className="page-header-right">
          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span>
            Tạo hóa đơn mới
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon blue">
              <span className="material-symbols-outlined">payments</span>
            </span>
            <span className="metric-change positive">+12.5%</span>
          </div>
          <p className="metric-label">TỔNG DOANH THU</p>
          <p className="metric-value">{formatCurrency(statistics.totalRevenue)}</p>
          <div className="metric-bar blue"></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon yellow">
              <span className="material-symbols-outlined">pending_actions</span>
            </span>
            <span className="metric-badge">{statistics.pendingCount} hóa đơn</span>
          </div>
          <p className="metric-label">HÓA ĐƠN CHỜ</p>
          <p className="metric-value">{formatCurrency(statistics.pendingAmount)}</p>
          <div className="metric-bar yellow"></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon green">
              <span className="material-symbols-outlined">verified</span>
            </span>
            <span className="metric-change positive">+8%</span>
          </div>
          <p className="metric-label">ĐÃ THANH TOÁN</p>
          <p className="metric-value">{formatCurrency(statistics.completedAmount)}</p>
          <div className="metric-bar green"></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon red">
              <span className="material-symbols-outlined">error</span>
            </span>
            <span className="metric-badge red">{statistics.overdueCount} ca</span>
          </div>
          <p className="metric-label">SỐ CA QUÁ HẠN</p>
          <p className="metric-value">{formatCurrency(statistics.overdueAmount)}</p>
          <div className="metric-bar red"></div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="tab-filters">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            Tất cả
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            Chờ thanh toán
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => handleTabChange('completed')}
          >
            Hoàn thành
          </button>
        </div>

        <div className="search-actions">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Tìm mã HD hoặc khách hàng..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          <button className="btn-secondary">
            <span className="material-symbols-outlined">filter_list</span>
            Bộ lọc
          </button>
          <button className="btn-secondary" onClick={handleExportExcel}>
            <span className="material-symbols-outlined">file_download</span>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>MÃ HĐ</th>
              <th>KHÁCH HÀNG</th>
              <th>NGÀY XUẤT</th>
              <th>SỐ TIỀN</th>
              <th>HÌNH THỨC</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  <span className="material-symbols-outlined">receipt_long</span>
                  <p>Không có hóa đơn nào</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-id">#{invoice.id.replace('#', '').replace('HD-', '')}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {invoice.name.charAt(0)}
                      </div>
                      <div className="customer-details">
                        <span className="customer-name">{invoice.name}</span>
                        <span className="customer-email">{invoice.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{invoice.date.split(' ')[0]}</td>
                  <td className="amount">{invoice.amount}</td>
                  <td>{invoice.product.includes('Visa') ? 'Thẻ Visa' : invoice.product.includes('chuyển khoản') ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                  <td>
                    <span className={`status-badge ${invoice.payment === 'Đã thanh toán' ? 'paid' : 'pending'}`}>
                      {invoice.payment === 'Đã thanh toán' ? 'ĐÃ THANH TOÁN' : 'CHỜ XÁC NHẬN'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn"
                      title="Xem"
                      onClick={() => handleViewInvoice(invoice.id)}
                      disabled={isProcessing}
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button
                      className="action-btn"
                      title="In"
                      onClick={() => handlePrintInvoice(invoice.id)}
                      disabled={isProcessing}
                    >
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button
                      className="action-btn delete"
                      title="Xóa"
                      onClick={() => handleDeleteClick(invoice)}
                      disabled={isProcessing}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Invoice Modal */}
      {showViewModal && invoiceDetail && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowViewModal(false)}
                disabled={isProcessing}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail-grid">
                <div className="detail-section">
                  <h3>Thông tin hóa đơn</h3>
                  <div className="detail-row">
                    <span className="detail-label">Mã HĐ:</span>
                    <span className="detail-value">{invoiceDetail.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ngày xuất:</span>
                    <span className="detail-value">{invoiceDetail.date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`status-badge ${invoiceDetail.payment === 'Đã thanh toán' ? 'paid' : 'pending'}`}>
                      {invoiceDetail.payment}
                    </span>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="detail-row">
                    <span className="detail-label">Họ tên:</span>
                    <span className="detail-value">{invoiceDetail.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{invoiceDetail.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Điện thoại:</span>
                    <span className="detail-value">{invoiceDetail.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Địa chỉ:</span>
                    <span className="detail-value">{invoiceDetail.address}</span>
                  </div>
                </div>
              </div>
              <div className="detail-section full-width">
                <h3>Chi tiết thanh toán</h3>
                <div className="detail-row">
                  <span className="detail-label">Sản phẩm:</span>
                  <span className="detail-value">{invoiceDetail.product}</span>
                </div>
                <div className="detail-row total">
                  <span className="detail-label">Tổng tiền:</span>
                  <span className="detail-value highlight">{invoiceDetail.amount}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={() => handlePrintInvoice(invoiceDetail.id)}>
                <span className="material-symbols-outlined">print</span>
                In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowDeleteModal(false)}>
          <div className="modal modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-delete">
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa hóa đơn <strong>{selectedInvoice.id}</strong>?</p>
            <p className="warning-text">Hành động này không thể hoàn tác!</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button 
                className="btn-danger" 
                onClick={handleConfirmDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang xóa...' : 'Xóa hóa đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Alert Banners */}
          <div className="alert-banners">
            <div className="alert-banner success">
              <div className="alert-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="alert-content">
                <strong>Báo cáo tháng đã sẵn sàng</strong>
                <p>Phân tích chi tiết doanh thu và xu hướng khách hàng tháng 5.</p>
              </div>
              <button className="alert-action">Xem ngay</button>
            </div>
            <div className="alert-banner warning">
              <div className="alert-icon">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="alert-content">
                <strong>Cảnh báo thanh toán chậm</strong>
                <p>3 hóa đơn đã vượt quá hạn thanh toán 7 ngày.</p>
              </div>
              <button className="alert-action warning">Xử lý</button>
            </div>
          </div>

        </div>{/* End content-wrapper */}

        {/* Footer */}
        <footer className="main-footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="material-symbols-outlined">storefront</span>
                <div>
                  <h4>SMART AI FASHION</h4>
                  <p>Smart AI Fashion là nền tảng quản lý may mặc và vải, điều hành việc cắt, đo, tính toán nguyên vật liệu và quản lý vận hành sản xuất.</p>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <h4>CHĂM SÓC KHÁCH HÀNG</h4>
              <ul>
                <li>Hướng dẫn mua hàng</li>
                <li>Hướng dẫn thanh toán</li>
                <li>Chính sách vận chuyển</li>
                <li>Tra hàng & hoàn trả</li>
                <li>Chính sách bảo hành</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>VỀ SMART AI FASHION</h4>
              <ul>
                <li>Giới thiệu</li>
                <li>Tuyển dụng</li>
                <li>Liên hệ với chúng tôi</li>
                <li>Chính sách bảo mật</li>
                <li>Chương trình đại lý</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>THANH TOÁN & VẬN CHUYỂN</h4>
              <div className="payment-methods">
                <span>Hỗ trợ thanh toán</span>
                <div className="payment-icons">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" />
                </div>
              </div>
              <div className="shipping-partners">
                <span>Đối tác vận chuyển</span>
                <div className="shipping-icons">
                  <span>GHN</span>
                  <span>GHTK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 SMART AI FASHION. E-COMMERCE SOLUTION. ĐẦU LÂU GIÂY PHÚT.</p>
          </div>
        </footer>
      </main>{/* End main-content */}
    </div>
  );
}
