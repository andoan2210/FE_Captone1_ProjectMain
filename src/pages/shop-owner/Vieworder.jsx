"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import orderService from "../../services/orderService"
import "./Vieworder.css"

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
  
  // Breadcrumb
  breadcrumbHome: "Dashboard",
  breadcrumbOrders: "Đơn hàng",
  breadcrumbList: "Danh sách đơn hàng",
  
  // Page header
  pageTitle: "Danh sách đơn hàng",
  pageSubtitle: "Quản lý và xử lý tất cả các giao dịch bán hàng từ mọi nền tảng phân phối của bạn tại đây",
  btnExport: "Xuất dữ liệu",
  btnCreate: "Tạo đơn hàng",
  
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
  filterReset: "Đặt lại",
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
  thStatus: "Trạng thái đơn hàng",
  thPayment: "Thanh toán",
  thDate: "Ngày tạo",
  thActions: "Thao tác",
  
  // Actions
  actionView: "Xem chi tiết",
  actionEdit: "Sửa",
  actionDelete: "Xóa",
  
  // Selected actions
  selectedCount: "đã chọn",
  deleteSelected: "Xóa đã chọn",
  clearSelection: "Bỏ chọn",
  
// Pagination
  showing: "Hiển thị",
  of: "trên",
  results: "kết quả",
  loadMore: "Tải thêm",
  loadingMore: "Đang tải...",
  remainingOrders: "đơn hàng còn lại",
  paginationMode: "Phân trang",
  loadMoreMode: "Tải thêm",
  allLoaded: "Đã tải hết tất cả đơn hàng",
  
  // Empty state
  emptyState: "Không tìm thấy đơn hàng nào phù hợp với bộ lọc",
  
  // Footer
  copyright: "© 2023 Seller Center Inc. Đã đăng ký bản quyền.",
  footerHelp: "Hỗ trợ",
  footerPrivacy: "Điều khoản bảo mật",
  footerTerms: "Chính sách bán hàng",
  footerVersion: "Phiên bản 2.1.0",
  
  // Modals
  modalCreateTitle: "Tạo đơn hàng mới",
  modalEditTitle: "Sửa đơn hàng",
  modalDetailTitle: "Chi tiết đơn hàng",
  modalDeleteTitle: "Xác nhận xóa",
  modalExportTitle: "Xuất dữ liệu",
  
  // Form labels
  formCustomerName: "Tên khách hàng",
  formEmail: "Email",
  formPhone: "Số điện thoại",
  formProduct: "Sản phẩm",
  formAmount: "Số tiền",
  formAddress: "Địa chỉ giao hàng",
  formStatus: "Trạng thái",
  formPaymentStatus: "Thanh toán",
  
  // Form placeholders
  placeholderName: "Nhập tên khách hàng",
  placeholderEmail: "Nhập email",
  placeholderPhone: "Nhập số điện thoại",
  placeholderProduct: "Nhập tên sản phẩm",
  placeholderAmount: "Nhập số tiền",
  placeholderAddress: "Nhập địa chỉ giao hàng",
  
  // Buttons
  btnCancel: "Hủy",
  btnSave: "Lưu",
  btnCreate2: "Tạo đơn",
  btnClose: "Đóng",
  btnConfirmDelete: "Xác nhận xóa",
  
  // Validation errors
  errRequired: "không được để trống",
  errEmail: "Email không hợp lệ",
  errPhone: "Số điện thoại không hợp lệ (VD: 0901234567)",
  errAmount: "Số tiền phải lớn hơn 0",
  errSearch: "Từ khóa tìm kiếm không được vượt quá 100 ký tự",
  errDateRange: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
  
  // Toast messages
  toastCreateSuccess: "Tạo đơn hàng thành công!",
  toastUpdateSuccess: "Cập nhật đơn hàng thành công!",
  toastDeleteSuccess: "Xóa đơn hàng thành công!",
  toastExportSuccess: "Xuất dữ liệu thành công!",
  
  // Export modal
  exportInfo: "Chọn định dạng xuất dữ liệu",
  exportCSV: "Xuất CSV",
  exportExcel: "Xuất Excel", 
  exportJSON: "Xuất JSON",
  
  // Delete confirm
  deleteConfirm: "Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.",
  
  // Detail labels
  detailOrderId: "Mã đơn hàng",
  detailCustomer: "Khách hàng",
  detailEmail: "Email",
  detailPhone: "Số điện thoại",
  detailProduct: "Sản phẩm",
  detailAmount: "Tổng tiền",
  detailStatus: "Trạng thái",
  detailPayment: "Thanh toán",
  detailAddress: "Địa chỉ giao hàng",
  detailDate: "Ngày tạo",
}

// Format currency
const formatCurrency = (value) => {
  const num = parseInt(value.replace(/[^\d]/g, ""))
  if (isNaN(num)) return ""
  return num.toLocaleString("vi-VN") + "đ"
}

// Generate order ID
const generateOrderId = () => {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `#ORD-${num}`
}

// Get current date time
const getCurrentDateTime = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, "0")
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, "0")
  const mins = String(now.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${mins}`
}

const Icons = {
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#2563eb" />
      <path
        d="M7 11V17H17V11M7 11L12 7L17 11M7 11H17"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.12" />
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  Truck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M9 18h5" />
      <path d="M16 18h3a1 1 0 0 0 1-1v-3.05a2.5 2.5 0 0 0-.66-1.71l-2.15-2.24A2.5 2.5 0 0 0 15.41 10H14" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  More: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-icon">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
}

// ===========================================
// MOCK API - Thay thế bằng orderService.getOrders() của bạn
// ===========================================



export default function Vieworder() {
  // Orders state
  const initialOrders = []
  const [orders, setOrders] = useState(initialOrders)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [errors, setErrors] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const itemsPerPage = 10
  
  // View mode: "pagination" hoặc "loadmore"
  const [viewMode, setViewMode] = useState("pagination")
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // Debounce ref for search
  const searchTimeoutRef = useRef(null)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(null)
  
  // Form states
 
  const [formErrors, setFormErrors] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
// Toast state
  const emptyOrderForm = {
  name: "",
  email: "",
  phone: "",
  product: "",
  amount: "",
  address: "",
  status: "pending",
  payment: "unpaid",
}
   const [orderForm, setOrderForm] = useState(emptyOrderForm)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })

  // ===========================================
  // LOAD ORDERS FROM API

const loadOrders = useCallback(async (page = 1, append = false) => {
  if (append) {
    setIsLoadingMore(true)
  } else {
    setIsLoading(true)
  }

  try {
    const response = await orderService.getOrders({
      page,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
      payment: paymentFilter,
    })

    const { data, pagination } = response

    if (append) {
      setOrders(prev => [...prev, ...data])
    } else {
      setOrders(data)
    }

    setCurrentPage(pagination.page)
    setTotalOrders(pagination.total)
    setTotalPages(pagination.totalPages)
    setHasMore(pagination.hasMore)

  } catch (error) {
    console.error("Lỗi load orders:", error)
    // Service đã có fallback về mock data, không cần MOCK_ORDERS
    // UI sẽ show empty hoặc retry logic

  } finally {
    setIsLoading(false)
    setIsLoadingMore(false)
  }
}, [searchQuery, statusFilter, paymentFilter, itemsPerPage])
  
  // Initial load
  useEffect(() => {
    loadOrders(1, false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Reload khi filter thay đổi (với debounce cho search)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1)
      loadOrders(1, false)
    }, 500)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, statusFilter, paymentFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle page change (Pagination mode)
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadOrders(page, false)
      setSelectedOrders([])
    }
  }

  // Handle load more (Load More mode)
  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadOrders(currentPage + 1, true)
    }
  }

  // Switch view mode
  const handleSwitchMode = (mode) => {
    setViewMode(mode)
    setCurrentPage(1)
    loadOrders(1, false)
    setSelectedOrders([])
  }
  
  // ===========================================
  // END LOAD ORDERS
  // ===========================================

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000)
  }

  // Validation handlers
  const handleSearchChange = useCallback((e) => {
    const { isValid, sanitized } = validateSearchQuery(e.target.value)
    if (isValid) {
      setSearchQuery(sanitized)
      setErrors((prev) => prev.filter((err) => err.field !== "search"))
    } else {
      setErrors((prev) => [
        ...prev.filter((err) => err.field !== "search"),
        { field: "search", message: TEXTS.errSearch },
      ])
    }
    setCurrentPage(1)
  }, [])

  const handleDateChange = useCallback(
    (field, value) => {
      if (field === "start") {
        setStartDate(value)
        if (endDate && !validateDateRange(value, endDate)) {
          setErrors((prev) => [
            ...prev.filter((err) => err.field !== "dateRange"),
            { field: "dateRange", message: TEXTS.errDateRange },
          ])
        } else {
          setErrors((prev) => prev.filter((err) => err.field !== "dateRange"))
        }
      } else {
        setEndDate(value)
        if (startDate && !validateDateRange(startDate, value)) {
          setErrors((prev) => [
            ...prev.filter((err) => err.field !== "dateRange"),
            { field: "dateRange", message: "Ngày kết thúc phải lớn hơn ngày bắt đầu" },
          ])
        } else {
          setErrors((prev) => prev.filter((err) => err.field !== "dateRange"))
        }
      }
      setCurrentPage(1)
    },
    [startDate, endDate]
  )

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }, [])

  const handleSelectAll = useCallback(
    (ordersList) => {
      if (selectedOrders.length === ordersList.length) {
        setSelectedOrders([])
      } else {
        setSelectedOrders(ordersList.map((o) => o.id))
      }
    },
    [selectedOrders]
  )

  const handleReset = useCallback(() => {
    setSearchQuery("")
    setStatusFilter("")
    setPaymentFilter("")
    setStartDate("")
    setEndDate("")
    setErrors([])
    setSelectedOrders([])
    setCurrentPage(1)
  }, [])

  const getErrorMessage = (field) => {
    const error = errors.find((err) => err.field === field)
    return error ? error.message : undefined
  }

// KPIs calculations (giữ nguyên để tính từ orders đã load)
  const kpis = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.type === "pending").length
    const shippingOrders = orders.filter(o => o.type === "shipping").length
    const completedOrders = orders.filter(o => o.type === "completed").length
    const totalRevenue = orders
      .filter(o => o.type === "completed")
      .reduce((sum, o) => {
        const num = parseInt(o.amount.replace(/[^\d]/g, ""))
        return sum + (isNaN(num) ? 0 : num)
      }, 0)

    return [
      { label: TEXTS.kpiTotal, value: totalOrders.toLocaleString(), trend: "+12.5%", icon: <Icons.ShoppingCart />, color: "#3b82f6", bg: "#eff6ff" },
      { label: TEXTS.kpiPending, value: pendingOrders.toString(), trend: "+5.2%", icon: <Icons.Package />, color: "#f97316", bg: "#fff7ed" },
      { label: TEXTS.kpiShipping, value: shippingOrders.toString(), trend: "+8.1%", icon: <Icons.Truck />, color: "#a855f7", bg: "#faf5ff" },
      { label: TEXTS.kpiCompleted, value: completedOrders.toString(), trend: "+10.4%", icon: <Icons.CheckCircle />, color: "#22c55e", bg: "#f0fdf4" },
      { label: TEXTS.kpiRevenue, value: (totalRevenue / 1000000).toFixed(0) + "M đ", trend: "+15.3%", icon: <Icons.DollarSign />, color: "#2563eb", bg: "#eff6ff" },
    ]
  }, [orders])

  // Form validation
  const validateForm = () => {
    const newErrors = {}
    
    const nameValid = validateRequired(orderForm.name, TEXTS.formCustomerName)
    if (!nameValid.isValid) newErrors.name = nameValid.message

    if (!validateEmail(orderForm.email)) {
      newErrors.email = TEXTS.errEmail
    }

    if (!validatePhoneNumber(orderForm.phone)) {
      newErrors.phone = TEXTS.errPhone
    }

    const productValid = validateRequired(orderForm.product, TEXTS.formProduct)
    if (!productValid.isValid) newErrors.product = productValid.message

    if (!validateAmount(orderForm.amount)) {
      newErrors.amount = TEXTS.errAmount
    }

    const addressValid = validateRequired(orderForm.address, TEXTS.formAddress)
    if (!addressValid.isValid) newErrors.address = addressValid.message

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input change
  const handleFormChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Create/Update order
  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    const statusMap = {
      pending: { status: TEXTS.statusPending, payment: orderForm.payment === "paid" ? TEXTS.paymentPaid : TEXTS.paymentUnpaid },
      shipping: { status: TEXTS.statusShipping, payment: TEXTS.paymentPaid },
      completed: { status: TEXTS.statusCompleted, payment: TEXTS.paymentPaid },
      cancelled: { status: TEXTS.statusCancelled, payment: TEXTS.paymentRefunded },
    }

    if (isEditing && selectedOrder) {
      // Update existing order
      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrder.id) {
        return {
  ...o,
  name: orderForm.name,
  email: orderForm.email,
  phone: orderForm.phone,
  product: orderForm.product,
  amount: formatCurrency(orderForm.amount),
  address: orderForm.address,
  type: orderForm.status,
}
        }
        return o
      }))
      showToast(TEXTS.toastUpdateSuccess)
    } else {
      // Create new order
      const newOrder = {
        id: generateOrderId(),
        name: orderForm.name,
        email: orderForm.email,
        phone: orderForm.phone,
        product: orderForm.product,
        amount: formatCurrency(orderForm.amount),
        address: orderForm.address,
        date: getCurrentDateTime(),
        type: orderForm.status,
        status: statusMap[orderForm.status].status,
        payment: statusMap[orderForm.status].payment,
      }
     await orderService.createOrder(orderForm)
await loadOrders(1, false)

showToast(TEXTS.toastCreateSuccess)
    }

    setShowCreateModal(false)
    setOrderForm(emptyOrderForm)
    setFormErrors({})
    setIsEditing(false)
    setSelectedOrder(null)
  }

  // Delete order
  const handleDeleteOrder = () => {
    if (selectedOrder) {
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id))
      setSelectedOrders(prev => prev.filter(id => id !== selectedOrder.id))
      showToast(TEXTS.toastDeleteSuccess)
    }
    setShowDeleteModal(false)
    setSelectedOrder(null)
  }

  // Delete selected orders
  const handleDeleteSelected = () => {
    setOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)))
    setSelectedOrders([])
    showToast(`Xóa ${selectedOrders.length} đơn hàng thành công!`)
  }

  // Export data
  const handleExport = (format) => {
  const dataToExport = selectedOrders.length > 0 
  ? orders.filter(o => selectedOrders.includes(o.id))
  : orders

    if (format === "csv") {
      const headers = [TEXTS.thOrderId, TEXTS.thCustomer, TEXTS.formEmail, TEXTS.thProduct, TEXTS.thAmount, TEXTS.thStatus, TEXTS.thPayment, TEXTS.thDate]
      const rows = dataToExport.map(o => [o.id, o.name, o.email, o.product, o.amount, o.status, o.payment, o.date])
      const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      showToast(`Xuất ${dataToExport.length} đơn hàng thành công (CSV)!`)
    } else if (format === "json") {
      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `orders_${new Date().toISOString().split("T")[0]}.json`
      link.click()
      showToast(`Xuất ${dataToExport.length} đơn hàng thành công (JSON)!`)
    } else if (format === "excel") {
      // Simple Excel XML format
      const headers = [TEXTS.thOrderId, TEXTS.thCustomer, TEXTS.formEmail, TEXTS.thProduct, TEXTS.thAmount, TEXTS.thStatus, TEXTS.thPayment, TEXTS.thDate]
      let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">'
      xml += '<Worksheet ss:Name="Orders"><Table>'
      xml += '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("") + '</Row>'
      dataToExport.forEach(o => {
        xml += '<Row>'
        xml += `<Cell><Data ss:Type="String">${o.id}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.name}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.email}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.product}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.amount}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.status}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.payment}</Data></Cell>`
        xml += `<Cell><Data ss:Type="String">${o.date}</Data></Cell>`
        xml += '</Row>'
      })
      xml += '</Table></Worksheet></Workbook>'
      
      const blob = new Blob([xml], { type: "application/vnd.ms-excel" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `orders_${new Date().toISOString().split("T")[0]}.xls`
      link.click()
      showToast(`Xuất ${dataToExport.length} đơn hàng thành công (Excel)!`)
    }
    setShowExportModal(false)
  }

  // Open edit modal
  const handleEdit = (order) => {
    setSelectedOrder(order)
    setOrderForm({
      name: order.name,
      email: order.email,
      phone: order.phone || "",
      product: order.product,
      amount: order.amount.replace(/[^\d]/g, ""),
      address: order.address || "",
      status: order.type,
      payment: order.payment === "Đã thanh toán" ? "paid" : "unpaid",
    })
    setIsEditing(true)
    setShowCreateModal(true)
    setShowActionMenu(null)
  }

  // Open view modal
  const handleView = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
    setShowActionMenu(null)
  }

  // Open delete modal
  const handleDelete = (order) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
    setShowActionMenu(null)
  }

// Pagination handlers - Tạo mảng số trang với ellipsis
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    
    return pages
  }
  
  // Số đơn hàng còn lại cho load more
  const remainingOrders = totalOrders - orders.length

  return (
    <div className="order-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? <Icons.Check /> : <Icons.AlertCircle />}
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <header className="main-header">
        <div className="header-left">
          <div className="logo-box">
            <Icons.Logo /> <span>Seller Center</span>
          </div>
          <nav className="main-nav">
            <a href="#">{TEXTS.navDashboard}</a>
            <a href="#" className="active">{TEXTS.navOrders}</a>
            <a href="#">{TEXTS.navProducts}</a>
            <a href="#">{TEXTS.navCustomers}</a>
            <a href="#">{TEXTS.navReports}</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="quick-search">
            <Icons.Search />
            <input type="text" placeholder={TEXTS.searchPlaceholder} />
          </div>
          <button className="icon-btn">
            <Icons.Bell />
          </button>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="User"
            className="user-avatar"
          />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="order-container">
        <nav className="breadcrumb">
          {TEXTS.breadcrumbHome} &rsaquo; {TEXTS.breadcrumbOrders} &rsaquo; <span>{TEXTS.breadcrumbList}</span>
        </nav>

        <div className="header-row">
          <div className="title-area">
            <h1>{TEXTS.pageTitle}</h1>
            <p className="subtitle">{TEXTS.pageSubtitle}</p>
          </div>
          <div className="button-group">
            <button className="btn btn-outline" onClick={() => setShowExportModal(true)}>
              <Icons.Download /> {TEXTS.btnExport}
            </button>
            <button className="btn btn-primary" onClick={() => { setShowCreateModal(true); setIsEditing(false); setOrderForm(emptyOrderForm); }}>
              <Icons.Plus /> {TEXTS.btnCreate}
            </button>
          </div>
        </div>

        {/* Selected actions */}
        {selectedOrders.length > 0 && (
          <div className="selected-actions">
            <span>Đã chọn {selectedOrders.length} đơn hàng</span>
            <button className="btn btn-outline btn-sm" onClick={() => setShowExportModal(true)}>
              <Icons.Download /> {TEXTS.btnExport}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>
              <Icons.Trash /> {TEXTS.actionDelete}
            </button>
            <button className="btn-link" onClick={() => setSelectedOrders([])}>{TEXTS.clearSelection}</button>
          </div>
        )}

        {/* KPI Grid */}
        <div className="kpi-grid">
          {kpis.map((kpi, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <span className="trend-badge">{kpi.trend}</span>
              </div>
              <div className="kpi-info">
                <span className="kpi-label">{kpi.label}</span>
                <span className="kpi-value">{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className={`search-wrapper ${getErrorMessage("search") ? "has-error" : ""}`}>
            <Icons.Search />
            <input
              type="text"
              placeholder={TEXTS.filterSearch}
              value={searchQuery}
              onChange={handleSearchChange}
              maxLength={100}
            />
          </div>
          <div className="filter-controls">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">{TEXTS.filterStatus}</option>
              <option value="pending">{TEXTS.statusPending}</option>
              <option value="shipping">{TEXTS.statusShipping}</option>
              <option value="completed">{TEXTS.statusCompleted}</option>
              <option value="cancelled">{TEXTS.statusCancelled}</option>
            </select>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">{TEXTS.filterPayment}</option>
              <option value="paid">{TEXTS.paymentPaid}</option>
              <option value="unpaid">{TEXTS.paymentUnpaid}</option>
            </select>
            <div className={`date-range ${getErrorMessage("dateRange") ? "has-error" : ""}`}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
              />
            </div>
            <button className="btn-reset" onClick={handleReset}>{TEXTS.filterReset}</button>
          </div>
        </div>

{/* Validation Errors */}
        {errors.length > 0 && (
          <div className="validation-errors">
            {errors.map((err, i) => (
              <div key={i} className="error-item">{err.message}</div>
            ))}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <span className="view-mode-label">Chế độ hiển thị:</span>
          <div className="toggle-buttons">
            <button 
              className={`toggle-btn ${viewMode === "pagination" ? "active" : ""}`}
              onClick={() => handleSwitchMode("pagination")}
            >
              {TEXTS.paginationMode}
            </button>
            <button 
              className={`toggle-btn ${viewMode === "loadmore" ? "active" : ""}`}
              onClick={() => handleSwitchMode("loadmore")}
            >
              {TEXTS.loadMoreMode}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <Icons.Loader />
                <span>Đang tải dữ liệu...</span>
              </div>
            </div>
          )}
          <table className="order-table">
            <thead>
              <tr>
<th>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={() => handleSelectAll(orders)}
                  />
                </th>
                <th>{TEXTS.thOrderId}</th>
                <th>{TEXTS.thCustomer}</th>
                <th>{TEXTS.thProduct}</th>
                <th>{TEXTS.thAmount}</th>
                <th>{TEXTS.thStatus}</th>
                <th>{TEXTS.thPayment}</th>
                <th>{TEXTS.thDate}</th>
                <th>{TEXTS.thActions}</th>
              </tr>
            </thead>
<tbody>
              {orders.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    {TEXTS.emptyState}
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className={selectedOrders.includes(o.id) ? "selected" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(o.id)}
                        onChange={() => handleSelectOrder(o.id)}
                      />
                    </td>
                    <td className="order-id">{o.id}</td>
                    <td>
                      <div className="cust-name">{o.name}</div>
                      <div className="cust-email">{o.email}</div>
                    </td>
                    <td className="product-cell">{o.product}</td>
                    <td className="amount">{o.amount}</td>
                    <td>
                      <span className={`status-dot dot-${o.type}`}>{o.status}</span>
                    </td>
                    <td>
                      <span className={`pay-status pay-${o.type}`}>{o.payment}</span>
                    </td>
                    <td className="date-cell">{o.date}</td>
                    <td className="action-cell">
                      <button className="btn-more" onClick={() => setShowActionMenu(showActionMenu === o.id ? null : o.id)}>
                        <Icons.More />
                      </button>
                      {showActionMenu === o.id && (
                        <div className="action-menu">
                          <button onClick={() => handleView(o)}><Icons.Eye /> {TEXTS.actionView}</button>
                          <button onClick={() => handleEdit(o)}><Icons.Edit /> {TEXTS.actionEdit}</button>
                          <button className="danger" onClick={() => handleDelete(o)}><Icons.Trash /> {TEXTS.actionDelete}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
</tbody>
          </table>
          
          {/* Pagination Mode */}
          {viewMode === "pagination" && (
            <div className="pagination">
              <span>
                {TEXTS.showing} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalOrders)} {TEXTS.of} {totalOrders} {TEXTS.results}
              </span>
              <div className="page-numbers">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1 || isLoading}
                  className="page-btn"
                >
                  {"<"}
                </button>
                {getPageNumbers().map((page, index) => (
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="ellipsis">...</span>
                  ) : (
                    <button 
                      key={page} 
                      className={`page-btn ${page === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages || isLoading}
                  className="page-btn"
                >
                  {">"}
                </button>
              </div>
            </div>
          )}
          
          {/* Load More Mode */}
          {viewMode === "loadmore" && (
            <div className="load-more-section">
              <span className="load-more-info">
                {TEXTS.showing} {orders.length} {TEXTS.of} {totalOrders} {TEXTS.results}
              </span>
              {hasMore && (
                <button 
                  className="btn btn-load-more" 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Icons.Loader />
                      {TEXTS.loadingMore}
                    </>
                  ) : (
                    <>
                      <Icons.Plus />
                      {TEXTS.loadMore} ({remainingOrders} {TEXTS.remainingOrders})
                    </>
                  )}
                </button>
              )}
              {!hasMore && orders.length > 0 && (
                <span className="all-loaded">{TEXTS.allLoaded}</span>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <span>{TEXTS.copyright}</span>
          <div className="footer-links">
            <a href="#">{TEXTS.footerHelp}</a>
            <a href="#">{TEXTS.footerTerms}</a>
            <a href="#">{TEXTS.footerPrivacy}</a>
          </div>
        </div>
      </footer>

      {/* CREATE/EDIT ORDER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setFormErrors({}); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? TEXTS.modalEditTitle : TEXTS.modalCreateTitle}</h2>
              <button className="btn-close" onClick={() => { setShowCreateModal(false); setFormErrors({}); }}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>{TEXTS.formCustomerName} <span className="required">*</span></label>
                  <input
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder={TEXTS.placeholderName}
                    className={formErrors.name ? "has-error" : ""}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>{TEXTS.formEmail} <span className="required">*</span></label>
                  <input
                    type="email"
                    value={orderForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder={TEXTS.placeholderEmail}
                    className={formErrors.email ? "has-error" : ""}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label>{TEXTS.formPhone} <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder={TEXTS.placeholderPhone}
                    className={formErrors.phone ? "has-error" : ""}
                  />
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>{TEXTS.formProduct} <span className="required">*</span></label>
                  <input
                    type="text"
                    value={orderForm.product}
                    onChange={(e) => handleFormChange("product", e.target.value)}
                    placeholder={TEXTS.placeholderProduct}
                    className={formErrors.product ? "has-error" : ""}
                  />
                  {formErrors.product && <span className="field-error">{formErrors.product}</span>}
                </div>
                <div className="form-group">
                  <label>{TEXTS.formAmount} (VND) <span className="required">*</span></label>
                  <input
                    type="text"
                    value={orderForm.amount}
                    onChange={(e) => handleFormChange("amount", e.target.value.replace(/[^\d]/g, ""))}
                    placeholder={TEXTS.placeholderAmount}
                    className={formErrors.amount ? "has-error" : ""}
                  />
                  {formErrors.amount && <span className="field-error">{formErrors.amount}</span>}
                </div>
                <div className="form-group">
                  <label>{TEXTS.formStatus}</label>
                  <select value={orderForm.status} onChange={(e) => handleFormChange("status", e.target.value)}>
                    <option value="pending">{TEXTS.statusPending}</option>
                    <option value="shipping">{TEXTS.statusShipping}</option>
                    <option value="completed">{TEXTS.statusCompleted}</option>
                    <option value="cancelled">{TEXTS.statusCancelled}</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>{TEXTS.formAddress} <span className="required">*</span></label>
                  <input
                    type="text"
                    value={orderForm.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    placeholder={TEXTS.placeholderAddress}
                    className={formErrors.address ? "has-error" : ""}
                  />
                  {formErrors.address && <span className="field-error">{formErrors.address}</span>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => { setShowCreateModal(false); setFormErrors({}); }}>{TEXTS.btnCancel}</button>
              <button className="btn btn-primary" onClick={handleSubmitOrder}>
                {isEditing ? TEXTS.btnSave : TEXTS.btnCreate2}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAIL MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{TEXTS.modalDetailTitle} {selectedOrder.id}</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>{TEXTS.detailOrderId}</label>
                  <span className="order-id">{selectedOrder.id}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailStatus}</label>
                  <span className={`status-dot dot-${selectedOrder.type}`}>{selectedOrder.status}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailCustomer}</label>
                  <span>{selectedOrder.name}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailEmail}</label>
                  <span>{selectedOrder.email}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailPhone}</label>
                  <span>{selectedOrder.phone || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailProduct}</label>
                  <span>{selectedOrder.product}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailAmount}</label>
                  <span className="amount">{selectedOrder.amount}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailPayment}</label>
                  <span className={`pay-status pay-${selectedOrder.type}`}>{selectedOrder.payment}</span>
                </div>
                <div className="detail-item">
                  <label>{TEXTS.detailDate}</label>
                  <span>{selectedOrder.date}</span>
                </div>
                <div className="detail-item full-width">
                  <label>{TEXTS.detailAddress}</label>
                  <span>{selectedOrder.address || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>{TEXTS.btnClose}</button>
              <button className="btn btn-primary" onClick={() => { setShowDetailModal(false); handleEdit(selectedOrder); }}>
                {TEXTS.actionEdit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xac nhan xoa</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Ban co chac chan muon xoa don hang <strong>{selectedOrder.id}</strong>?
                <br />Hanh dong nay khong the hoan tac.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Huy</button>
              <button className="btn btn-danger" onClick={handleDeleteOrder}>Xoa</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xuat du lieu</h2>
              <button className="btn-close" onClick={() => setShowExportModal(false)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <p className="export-info">
                {selectedOrders.length > 0 
                  ? `Xuat ${selectedOrders.length} don hang da chon`
                  : `Xuat ${orders.length} don hang (theo bo loc hien tai)`
                }
              </p>
              <div className="export-options">
                <button className="export-btn" onClick={() => handleExport("csv")}>
                  <span className="export-icon">CSV</span>
                  <span>File CSV</span>
                </button>
                <button className="export-btn" onClick={() => handleExport("excel")}>
                  <span className="export-icon">XLS</span>
                  <span>File Excel</span>
                </button>
                <button className="export-btn" onClick={() => handleExport("json")}>
                  <span className="export-icon">JSON</span>
                  <span>File JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div className="action-menu-overlay" onClick={() => setShowActionMenu(null)} />
      )}
    </div>
  )
}
