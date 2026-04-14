"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import ShopOrderService from "../../services/ShopOrderService"
import InvoiceService from "../../services/InvoiceService"
import "./Vieworder.css"
import { 
  FiSearch, FiFilter, FiDownload, FiEye, FiTrash2, FiMoreVertical, 
  FiCheck, FiX, FiShoppingCart, FiPackage, FiTruck, FiCheckCircle, 
  FiAlertCircle, FiDollarSign, FiPlus, FiChevronLeft, FiChevronRight, FiTrendingUp, FiEdit2
} from "react-icons/fi"

// Validation helper functions
const validateOrderId = (id) => {
  const orderIdPattern = /^#?ORD-\d{4,}$/i
  return orderIdPattern.test(id)
}

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const validatePhoneNumber = (phone) => {
  const phonePattern = /^(0|\+84)[0-9]{9,10}$/
  return phonePattern.test(phone.replace(/\s/g, ""))
}

const validateAmount = (amount) => {
  if (!amount || amount.trim() === "") return false
  const numericAmount = amount.replace(/[^\d]/g, "")
  return numericAmount.length > 0 && parseInt(numericAmount) > 0
}

const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return true
  return new Date(startDate) <= new Date(endDate)
}

const validateSearchQuery = (query) => {
  const sanitized = query.trim().replace(/[<>]/g, "")
  return {
    isValid: sanitized.length <= 100,
    sanitized,
  }
}

const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} không được để trống` }
  }
  return { isValid: true, message: "" }
}

// Vietnamese text constants
const TEXTS = {
  // Header
  brandName: "Seller Center",
  navDashboard: "Dashboard",
  navOrders: "Đơn hàng",
  navProducts: "Sản phẩm",
  navCustomers: "Khách hàng",
  navReports: "Báo cáo",
  searchPlaceholder: "Tìm kiếm đơn hàng...",

  // Page header
  pageTitle: "Quản lý đơn hàng",
  btnExport: "Xuất dữ liệu",
  btnCreate: "Thống kê",

  // KPIs
  kpiTotal: "Tổng đơn hàng",
  kpiPending: "Chờ xử lý",
  kpiShipping: "Đang giao",
  kpiCompleted: "Đã giao",
  kpiRevenue: "Doanh thu",

  // Filters
  filterSearch: "Tìm kiếm theo mã đơn, khách hàng...",
  filterStatus: "Trạng thái đơn",
  filterPayment: "Thanh toán",
  filterReset: "Làm mới",
  statusPending: "Chờ xử lý",
  statusShipping: "Đang giao",
  statusCompleted: "Hoàn thành",
  statusCancelled: "Đã hủy",
  paymentPaid: "Đã thanh toán",
  paymentUnpaid: "Chưa thanh toán",
  paymentRefunded: "Đã hoàn tiền",

  // Table headers
  thOrderId: "Mã đơn",
  thCustomer: "Khách hàng",
  thProduct: "Sản phẩm",
  thAmount: "Tổng tiền",
  thStatus: "Trạng thái",
  thPayment: "Thanh toán",
  thDate: "Ngày tạo",
  thActions: "Thao tác",

  // Modals
  modalCreateTitle: "Tạo đơn hàng mới",
  modalEditTitle: "Chỉnh sửa đơn hàng",
  modalDetailTitle: "Chi tiết đơn hàng",
  modalExportTitle: "Xuất dữ liệu đơn hàng",
  formCustomerName: "Tên khách hàng",
  formEmail: "Email",
  formPhone: "Số điện thoại",
  formProduct: "Sản phẩm",
  formAmount: "Tổng tiền",
  formStatus: "Trạng thái đơn hàng",
  formAddress: "Địa chỉ giao hàng",
  placeholderName: "Nhập tên khách hàng",
  placeholderEmail: "khachhang@example.com",
  placeholderPhone: "090xxxxxxx",
  placeholderProduct: "Tên sản phẩm",
  placeholderAmount: "Nhập số tiền",
  placeholderAddress: "Số nhà, tên đường, quận/huyện...",
  btnCancel: "Hủy bỏ",
  btnSave: "Lưu thay đổi",
  btnCreate2: "Tạo đơn hàng",
  btnClose: "Đóng lại",

  // Actions
  actionView: "Xem chi tiết",
  actionEdit: "Chỉnh sửa",
  actionDelete: "Xóa đơn hàng",
  clearSelection: "Bỏ chọn tất cả",

  // Messages
  emptyState: "Không tìm thấy đơn hàng nào phù hợp",
  loadingMore: "Đang tải thêm...",
  loadMore: "Xem thêm",
  remainingOrders: "đơn hàng còn lại",
  allLoaded: "Đã hiển thị tất cả đơn hàng",
  showing: "Hiển thị",
  of: "trên",
  results: "kết quả",
  paginationMode: "Phân trang",
  loadMoreMode: "Cuộn trang",
}

// Icons mapping for KPI cards
const Icons = {
  Download: FiDownload,
  Eye: FiEye,
  Search: FiSearch,
  Plus: FiPlus,
  Loader: () => <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />,
  Trash: FiTrash2,
  Check: FiCheck,
  Close: FiX,
  More: FiMoreVertical,
  AlertCircle: FiAlertCircle,
  Edit: FiEdit2,
  ShoppingCart: FiShoppingCart,
  Package: FiPackage,
  Truck: FiTruck,
  CheckCircle: FiCheckCircle,
  DollarSign: FiDollarSign,
}

export default function Vieworder() {
  // State management
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [viewMode, setViewMode] = useState("pagination") // "pagination" or "loadmore"
  const [selectedOrders, setSelectedOrders] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    amount: "",
    status: "pending",
    address: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [showActionMenu, setShowActionMenu] = useState(null)
  const [errors, setErrors] = useState([])

  const itemsPerPage = 8

  // Validation methods
  const validateOrderForm = () => {
    const newErrors = {}
    
    // Required fields
    const nameCheck = validateRequired(orderForm.name, "Tên khách hàng")
    if (!nameCheck.isValid) newErrors.name = nameCheck.message

    const emailCheck = validateRequired(orderForm.email, "Email")
    if (!emailCheck.isValid) {
      newErrors.email = emailCheck.message
    } else if (!validateEmail(orderForm.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    const phoneCheck = validateRequired(orderForm.phone, "Số điện thoại")
    if (!phoneCheck.isValid) {
      newErrors.phone = phoneCheck.message
    } else if (!validatePhoneNumber(orderForm.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    const amountCheck = validateRequired(orderForm.amount, "Tổng tiền")
    if (!amountCheck.isValid) {
      newErrors.amount = amountCheck.message
    } else if (!validateAmount(orderForm.amount)) {
      newErrors.amount = "Số tiền phải lớn hơn 0"
    }

    const addressCheck = validateRequired(orderForm.address, "Địa chỉ")
    if (!addressCheck.isValid) newErrors.address = addressCheck.message

    const productCheck = validateRequired(orderForm.product, "Sản phẩm")
    if (!productCheck.isValid) newErrors.product = productCheck.message

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const showToastNotification = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  const getErrorMessage = (field) => {
    const error = errors.find((e) => e.field === field)
    return error ? error.message : ""
  }

  // Fetch orders based on current filters and page
  const fetchOrders = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true)
    else setIsLoading(true)

    try {
      // Input validation for performance and security
      const { sanitized: cleanSearch } = validateSearchQuery(searchQuery)
      
      const params = {
        page,
        limit: itemsPerPage,
        search: cleanSearch,
        status: statusFilter,
        payment: paymentFilter,
        startDate,
        endDate,
      }

      const response = await ShopOrderService.getOrders(params)
      
      const newOrders = response.data || []
      const total = response.pagination?.total || 0

      if (isLoadMore) {
        setOrders(prev => [...prev, ...newOrders])
      } else {
        setOrders(newOrders)
      }
      setTotalOrders(total)
      setErrors([])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setErrors([{ field: "general", message: "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại." }])
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [searchQuery, statusFilter, paymentFilter, startDate, endDate])

  // Effects
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1)
      fetchOrders(1, false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, statusFilter, paymentFilter, startDate, endDate, fetchOrders])

  // Actions
  const handleSearchChange = (e) => {
    const val = e.target.value
    const { isValid, sanitized } = validateSearchQuery(val)
    if (isValid) {
      setSearchQuery(val)
      setErrors(errors.filter(e => e.field !== "search"))
    } else {
      setErrors(prev => [...prev, { field: "search", message: "Từ khóa quá dài (tối đa 100 ký tự)" }])
    }
  }

  const handleDateChange = (type, value) => {
    if (type === "start") {
      if (validateDateRange(value, endDate)) {
        setStartDate(value)
        setErrors(errors.filter(e => e.field !== "dateRange"))
      } else {
        setErrors(prev => [...prev, { field: "dateRange", message: "Ngày bắt đầu không được lớn hơn ngày kết thúc" }])
      }
    } else {
      if (validateDateRange(startDate, value)) {
        setEndDate(value)
        setErrors(errors.filter(e => e.field !== "dateRange"))
      } else {
        setErrors(prev => [...prev, { field: "dateRange", message: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu" }])
      }
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      fetchOrders(page, false)
    }
  }

  const handleLoadMore = () => {
    if (orders.length < totalOrders) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchOrders(nextPage, true)
    }
  }

  const handleSwitchMode = (mode) => {
    setViewMode(mode)
    setCurrentPage(1)
    fetchOrders(1, false)
  }

  const handleSelectOrder = (id) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (filteredOrders) => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id))
    }
  }

  const handleReset = () => {
    setSearchQuery("")
    setStatusFilter("")
    setPaymentFilter("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
    setErrors([])
    showToastNotification("Đã đặt lại tất cả bộ lọc", "info")
  }

  const handleFormChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      const newErrors = { ...formErrors }
      delete newErrors[field]
      setFormErrors(newErrors)
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateOrderForm()) return

    try {
      if (isEditing) {
        await ShopOrderService.updateOrder(selectedOrder.id, orderForm)
        showToastNotification(`Đã cập nhật đơn hàng ${selectedOrder.id} thành công`)
      } else {
        await ShopOrderService.createOrder(orderForm)
        showToastNotification("Tạo đơn hàng mới thành công")
      }
      setShowCreateModal(false)
      fetchOrders(currentPage, false)
    } catch (error) {
      showToastNotification("Không thể thực hiện tác vụ. Vui lòng thử lại.", "error")
    }
  }

  const handleEdit = (order) => {
    setIsEditing(true)
    setSelectedOrder(order)
    setOrderForm({
      name: order.name,
      email: order.email,
      phone: order.phone || "",
      product: order.product,
      amount: order.amount.replace(/[^\d]/g, ""),
      status: order.type,
      address: order.address || "",
    })
    setShowCreateModal(true)
    setShowActionMenu(null)
  }

  const handleView = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
    setShowActionMenu(null)
  }

  const handleDelete = (order) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
    setShowActionMenu(null)
  }

  const handleDeleteOrder = async () => {
    try {
      await ShopOrderService.deleteOrder(selectedOrder.id)
      showToastNotification(`Đã xóa đơn hàng ${selectedOrder.id}`)
      setShowDeleteModal(false)
      fetchOrders(currentPage, false)
    } catch (error) {
      showToastNotification("Hành động xóa thất bại", "error")
    }
  }

  const handleDeleteSelected = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedOrders.length} đơn hàng đã chọn?`)) {
      try {
        await Promise.all(selectedOrders.map(id => ShopOrderService.deleteOrder(id)))
        showToastNotification(`Đã xóa ${selectedOrders.length} đơn hàng`)
        setSelectedOrders([])
        fetchOrders(1, false)
      } catch (error) {
        showToastNotification("Xóa thất bại", "error")
      }
    }
  }

  const handleExport = (format) => {
    if (orders.length === 0) {
      showToastNotification("Không có dữ liệu để xuất!", "error")
      return
    }

    showToastNotification(`Đang chuẩn bị file ${format.toUpperCase()}...`, "info")
    
    setTimeout(() => {
      let content = ""
      let fileName = `Order_Export_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}`
      let mimeType = ""

      const dataToExport = selectedOrders.length > 0 
        ? orders.filter(o => selectedOrders.includes(o.id))
        : orders

      if (format === "json") {
        content = JSON.stringify(dataToExport, null, 2)
        fileName += ".json"
        mimeType = "application/json"
      } else {
        // CSV & Basic Excel (also CSV)
        const headers = ["Mã đơn", "Khách hàng", "Email", "Sản phẩm", "Tổng tiền", "Trạng thái", "Thanh toán", "Ngày tạo"]
        const rows = dataToExport.map(o => [
          o.id, 
          o.name, 
          o.email, 
          o.product.replace(/,/g, ";"), 
          o.amount.replace(/[^\d]/g, ""), 
          o.status, 
          o.payment, 
          o.date
        ])
        
        content = "\uFEFF" + [headers, ...rows].map(r => r.join(",")).join("\n")
        fileName += format === "csv" ? ".csv" : ".xlsx"
        mimeType = format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }

      try {
        const blob = new Blob([content], { type: mimeType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        showToastNotification(`Đã tải file ${format.toUpperCase()} thành công!`)
      } catch (err) {
        showToastNotification("Lỗi khi xuất file!", "error")
      }
    }, 1000)

    setShowExportModal(false)
  }

  const formatCurrency = (val) => {
    if (!val) return "0đ"
    return parseInt(val).toLocaleString("vi-VN") + "đ"
  }

  // Memoized calculations
  const totalPages = useMemo(() => Math.ceil(totalOrders / itemsPerPage), [totalOrders])
  const hasMore = orders.length < totalOrders
  const remainingOrders = totalOrders - orders.length

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  // Statistics data
  const stats = [
    { 
      title: TEXTS.kpiTotal, 
      value: totalOrders, 
      trend: '+5% tháng này', 
      icon: FiShoppingCart, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      title: TEXTS.kpiPending, 
      value: orders.filter(o => o.type === "pending").length, 
      trend: '+2 mới', 
      icon: FiPackage, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      title: TEXTS.kpiShipping, 
      value: orders.filter(o => o.type === "shipping").length, 
      trend: 'Đang giao', 
      icon: FiTruck, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      title: TEXTS.kpiCompleted, 
      value: orders.filter(o => o.type === "completed").length, 
      trend: 'Hoàn thành', 
      icon: FiCheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      title: TEXTS.kpiRevenue, 
      value: formatCurrency(orders
        .filter(o => o.type === "completed")
        .reduce((sum, o) => {
          const num = parseInt(o.amount.replace(/[^\d]/g, ""))
          return sum + (isNaN(num) ? 0 : num)
        }, 0).toString()), 
      trend: '+12% so với tháng trước', 
      icon: FiDollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
  ];

  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .custom-scrollbar-mini::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-8 right-8 z-[9999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
          toast.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
        }`}>
          {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {TEXTS.pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <FiDownload size={18} />
            {TEXTS.btnExport}
          </button>
          <button
             onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <FiTrendingUp size={18} />
            {TEXTS.btnCreate}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100 uppercase tracking-wider">
                Đơn hàng
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
              <p className={`text-xs font-bold leading-relaxed flex items-center gap-1 ${stat.title === TEXTS.kpiRevenue ? 'text-emerald-500' : 'text-slate-400'}`}>
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-end gap-6">
          {/* Search Section */}
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Tìm kiếm đơn hàng</label>
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all duration-300 z-10" size={18} />
              <input
                type="text"
                placeholder={TEXTS.filterSearch}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer min-w-[150px] shadow-sm hover:bg-slate-50 transition-all"
              >
                <option value="">{TEXTS.filterStatus}</option>
                <option value="pending">{TEXTS.statusPending}</option>
                <option value="shipping">{TEXTS.statusShipping}</option>
                <option value="completed">{TEXTS.statusCompleted}</option>
                <option value="cancelled">{TEXTS.statusCancelled}</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Thanh toán</label>
              <select
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer min-w-[150px] shadow-sm hover:bg-slate-50 transition-all"
              >
                <option value="">{TEXTS.filterPayment}</option>
                <option value="paid">{TEXTS.paymentPaid}</option>
                <option value="unpaid">{TEXTS.paymentUnpaid}</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Khoảng thời gian</label>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className={`bg-white border rounded-2xl px-3 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 transition-all shadow-sm hover:bg-slate-50 ${
                      errors.some(e => e.field === "dateRange") ? 'border-rose-300 ring-rose-50' : 'border-slate-200 focus:ring-blue-500/5 focus:border-blue-500'
                    }`}
                  />
                </div>
                <span className="text-slate-300 font-bold">-</span>
                <div className="relative group">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className={`bg-white border rounded-2xl px-3 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 transition-all shadow-sm hover:bg-slate-50 ${
                      errors.some(e => e.field === "dateRange") ? 'border-rose-300 ring-rose-50' : 'border-slate-200 focus:ring-blue-500/5 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
              {getErrorMessage("dateRange") && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold ml-2 animate-in fade-in slide-in-from-top-1">
                  <FiAlertCircle size={12} />
                  {getErrorMessage("dateRange")}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleReset}
                className="text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-6 py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm border border-blue-100 whitespace-nowrap"
              >
                {TEXTS.filterReset}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions & Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedOrders.length}
              </span>
              <span className="text-blue-700 font-bold text-sm">Đơn hàng được chọn</span>
            </div>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
            >
              <FiTrash2 size={16} />
              Xóa các mục đã chọn
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={() => handleSelectAll(orders)}
                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-200 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">{TEXTS.thOrderId}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">{TEXTS.thCustomer}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">{TEXTS.thProduct}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">{TEXTS.thAmount}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{TEXTS.thStatus}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{TEXTS.thPayment}</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{TEXTS.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && !isLoadingMore ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/30">
                    <div className="flex flex-col items-center gap-3">
                      <FiPackage size={48} className="opacity-20" />
                      {TEXTS.emptyState}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedOrders.includes(o.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(o.id)}
                        onChange={() => handleSelectOrder(o.id)}
                        className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-200 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-blue-600">{o.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{o.name}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{o.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-600 block max-w-[150px] truncate">{o.product}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-slate-800">{o.amount}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          o.type === 'pending' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' :
                          o.type === 'shipping' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' :
                          o.type === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' :
                          'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             o.type === 'pending' ? 'bg-amber-500' :
                             o.type === 'shipping' ? 'bg-blue-500' :
                             o.type === 'completed' ? 'bg-emerald-500' :
                             'bg-rose-500'
                          }`} />
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          o.payment === TEXTS.paymentPaid ? 'bg-emerald-100/50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {o.payment}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{o.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(o)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleView(o)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(o)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Mode */}
        {viewMode === "pagination" && (
          <div className="px-6 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
            <p className="text-sm font-medium text-slate-500">
              {TEXTS.showing} <span className="text-slate-800 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalOrders)}-{Math.min(currentPage * itemsPerPage, totalOrders)}</span> {TEXTS.of} <span className="text-slate-800 font-bold">{totalOrders}</span> {TEXTS.results}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || isLoading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-300">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`min-w-[36px] h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        page === currentPage
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button
                disabled={currentPage === totalPages || isLoading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Load More Mode */}
        {viewMode === "loadmore" && (
          <div className="flex flex-col items-center gap-4 py-8 bg-slate-50/20 border-t border-slate-50">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              {TEXTS.showing} {orders.length} {TEXTS.of} {totalOrders}
            </span>
            {hasMore ? (
              <button
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-bold shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? <Icons.Loader /> : <FiPlus />}
                {TEXTS.loadMore} ({remainingOrders} {TEXTS.remainingOrders})
              </button>
            ) : (
              <span className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider ring-1 ring-emerald-100">
                {TEXTS.allLoaded}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-end text-xs font-bold text-slate-400">
        <span className="uppercase tracking-widest">Chế độ xem:</span>
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => handleSwitchMode("pagination")}
            className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'pagination' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-600'}`}
          >
            {TEXTS.paginationMode}
          </button>
          <button 
            onClick={() => handleSwitchMode("loadmore")}
            className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'loadmore' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-600'}`}
          >
            {TEXTS.loadMoreMode}
          </button>
        </div>
      </div>

      {/* CREATE/EDIT ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isEditing ? TEXTS.modalEditTitle : TEXTS.modalCreateTitle}
              </h2>
              <button 
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all"
                onClick={() => setShowCreateModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formCustomerName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder={TEXTS.placeholderName}
                    disabled={isEditing}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.name ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  />
                  {formErrors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{formErrors.name}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formPhone} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder={TEXTS.placeholderPhone}
                    disabled={isEditing}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  />
                  {formErrors.phone && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{formErrors.phone}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formProduct} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderForm.product}
                    onChange={(e) => handleFormChange("product", e.target.value)}
                    placeholder={TEXTS.placeholderProduct}
                    disabled={isEditing}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.product ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  />
                  {formErrors.product && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{formErrors.product}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formAmount} (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderForm.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value.replace(/[^\d]/g, ""))}
                    placeholder={TEXTS.placeholderAmount}
                    disabled={isEditing}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.amount ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  />
                  {formErrors.amount && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{formErrors.amount}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formStatus}
                  </label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                    disabled={isEditing}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all appearance-none cursor-pointer font-bold text-slate-700"
                  >
                    <option value="pending">{TEXTS.statusPending}</option>
                    <option value="shipping">{TEXTS.statusShipping}</option>
                    <option value="completed">{TEXTS.statusCompleted}</option>
                    <option value="cancelled">{TEXTS.statusCancelled}</option>
                  </select>
                </div>
                <div className="space-y-1.5 text-left md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {TEXTS.formAddress} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderForm.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    placeholder={TEXTS.placeholderAddress}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${formErrors.address ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-100 focus:ring-blue-100 focus:bg-white'}`}
                  />
                  {formErrors.address && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{formErrors.address}</p>}
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    onClick={() => setShowCreateModal(false)}
                >
                  {TEXTS.btnCancel}
                </button>
                <button 
                  className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                  onClick={handleSubmitOrder}
                >
                  {isEditing ? TEXTS.btnSave : TEXTS.btnCreate2}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {TEXTS.modalDetailTitle} {selectedOrder.id}
              </h2>
              <button 
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all"
                onClick={() => setShowDetailModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-8 text-left space-y-6">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</p>
                    <p className="font-bold text-slate-800">{selectedOrder.name}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      selectedOrder.type === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                    <span className="text-sm font-bold text-slate-500">Tổng thanh toán:</span>
                    <span className="text-xl font-black text-blue-600">{selectedOrder.amount}</span>
                  </div>
               </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button 
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 border border-slate-200 bg-white"
                onClick={() => setShowDetailModal(false)}
              >
                {TEXTS.btnClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL - Simplified for new UI */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowStatsModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Phân tích đơn hàng</h3>
              <div className="grid grid-cols-1 gap-3">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`${s.bg} ${s.color} p-2 rounded-xl`}>
                        <s.icon size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{s.title}</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowStatsModal(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 mt-4"
              >
                Đóng phân tích
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xác nhận xóa?</h3>
            <p className="text-slate-500 mt-2 font-medium">Bạn có chắc muốn xóa đơn hàng này? Thao tác này không thể khôi phục.</p>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-3 font-bold text-slate-500 rounded-2xl hover:bg-slate-50" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-100 hover:bg-rose-600" onClick={handleDeleteOrder}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

       {/* Export Modal */}
       {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Xuất dữ liệu</h3>
            <div className="grid grid-cols-1 gap-2 mt-6">
              {['csv', 'excel', 'json'].map(fmt => (
                <button 
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <span className="font-bold text-slate-700 uppercase">Tải file {fmt}</span>
                  <FiDownload className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
