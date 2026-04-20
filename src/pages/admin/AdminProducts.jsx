/**
 * AdminProducts.jsx
 * Trang admin quản lý duyệt sản phẩm
 * Hiển thị danh sách sản phẩm PENDING và cho phép approve/reject
 */
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  Tag,
  Calendar,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("PENDING"); // PENDING, APPROVED, REJECTED
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    action: null, // 'APPROVE' or 'REJECT'
  });

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        adminService.getPendingProducts(1, 1),
        adminService.getApprovedProducts(1, 1),
        adminService.getRejectedProducts(1, 1),
      ]);

      setStats({
        pending: pendingRes.pagination?.total || 0,
        approved: approvedRes.pagination?.total || 0,
        rejected: rejectedRes.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback: chỉ lấy pending
      try {
        const pendingRes = await adminService.getPendingProducts(1, 1);
        setStats({
          pending: pendingRes.pagination?.total || 0,
          approved: 0,
          rejected: 0,
        });
      } catch (e) {
        console.error("Error fetching pending stats:", e);
      }
    }
  };

  // Fetch dữ liệu theo status
  const fetchProductsByStatus = async (status, page) => {
    setLoading(true);
    try {
      let response;
      if (status === "PENDING") {
        response = await adminService.getPendingProducts(page, itemsPerPage);
      } else if (status === "APPROVED") {
        response = await adminService.getApprovedProducts(page, itemsPerPage);
      } else if (status === "REJECTED") {
        response = await adminService.getRejectedProducts(page, itemsPerPage);
      } else {
        response = { data: [], pagination: { total: 0 } };
      }

      setProducts(response.data || []);
      setTotalItems(response.pagination?.total || response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.message || "Lỗi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Khi thay đổi status, reset về trang 1
    if (activeStatus !== "PENDING") {
      setCurrentPage(1);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchProductsByStatus(activeStatus, currentPage);
  }, [activeStatus, currentPage]);

  // Lọc sản phẩm
  const filteredProducts = products.filter(
    (product) =>
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.store?.storeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Xem chi tiết sản phẩm
  const handleViewDetail = async (productId) => {
    try {
      const response = await adminService.getProductDetail(productId);
      const productData = response.data || response;
      setSelectedProduct(productData);
      setShowDetailModal(true);
    } catch (error) {
      toast.error(error.message || "Lỗi tải chi tiết sản phẩm");
    }
  };

  // Duyệt sản phẩm
  const handleApprove = async () => {
    if (!selectedProduct) return;
    setConfirmModal({
      show: true,
      title: "Xác nhận duyệt sản phẩm",
      message: `Bạn có chắc chắn muốn duyệt sản phẩm "${selectedProduct.productName || selectedProduct.ProductName}"?`,
      action: "APPROVE",
    });
  };

  // Xác nhận duyệt
  const confirmApprove = async () => {
    if (!selectedProduct) return;
    const productId = selectedProduct.productId || selectedProduct.ProductId;
    setConfirmModal({ show: false, title: "", message: "", action: null });
    setIsProcessing(true);
    try {
      await adminService.approveProduct(productId);
      toast.success("Duyệt sản phẩm thành công");
      setShowDetailModal(false);
      setSelectedProduct(null);
      fetchStats();
      fetchProductsByStatus(activeStatus, currentPage);
    } catch (error) {
      toast.error(error.message || "Lỗi duyệt sản phẩm");
    } finally {
      setIsProcessing(false);
    }
  };

  // Từ chối sản phẩm
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    if (!selectedProduct) return;
    const productId = selectedProduct.productId || selectedProduct.ProductId;

    setIsProcessing(true);
    try {
      await adminService.rejectProduct(productId, rejectReason);
      toast.success("Từ chối sản phẩm thành công");
      setShowRejectModal(false);
      setRejectReason("");
      setShowDetailModal(false);
      setSelectedProduct(null);
      fetchStats();
      fetchProductsByStatus(activeStatus, currentPage);
    } catch (error) {
      toast.error(error.message || "Lỗi từ chối sản phẩm");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
        <p className="text-slate-600 mt-1">
          Duyệt hoặc từ chối sản phẩm từ các shop
        </p>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { value: "PENDING", label: "Chờ duyệt", count: stats.pending },
            { value: "APPROVED", label: "Đã duyệt", count: stats.approved },
            { value: "REJECTED", label: "Bị từ chối", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                activeStatus === tab.value
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-600 border-transparent hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-slate-100">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Chờ duyệt</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {stats.pending}
              </h3>
            </div>
            <div className="text-5xl text-amber-500">
              <Clock />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Đã duyệt</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {stats.approved}
              </h3>
            </div>
            <div className="text-5xl text-green-500">
              <CheckCircle2 />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Bị từ chối</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {stats.rejected}
              </h3>
            </div>
            <div className="text-5xl text-red-500">
              <XCircle />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm hoặc cửa hàng..."
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-slate-600">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                <span className="font-medium">Đang tải...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Giá
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Cửa hàng
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Danh mục
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Ngày tạo
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-bold text-slate-600 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-slate-200">
                              <AlertCircle
                                size={20}
                                className="text-slate-400"
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {product.productId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {product.store?.storeName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {product.category?.categoryName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {formatDate(product.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(product.productId)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">
              Trang {currentPage} của {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Chi tiết sản phẩm
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Mã: {selectedProduct.productId}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="text-blue-100 hover:text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - 2 Column Layout */}
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-8 p-8">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition">
                    {selectedProduct.thumbnailUrl ? (
                      <img
                        src={selectedProduct.thumbnailUrl}
                        alt={selectedProduct.productName}
                        className="w-full aspect-square object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-slate-200 flex items-center justify-center rounded-lg">
                        <AlertCircle size={64} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Gallery Thumbnails */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mb-3">
                          📸 Hình ảnh chi tiết
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedProduct.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md hover:scale-105"
                            >
                              <img
                                src={img.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Right Column - Info */}
                <div className="space-y-6">
                  {/* Product Name & Status */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Tên sản phẩm
                        </p>
                        <p className="text-2xl font-bold text-slate-900 leading-tight">
                          {selectedProduct.productName}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Trạng thái:
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition ${
                          (selectedProduct.approvalStatus ||
                            selectedProduct.ApprovalStatus) === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : (selectedProduct.approvalStatus ||
                                  selectedProduct.ApprovalStatus) === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        <Clock size={16} />
                        {(selectedProduct.approvalStatus ||
                          selectedProduct.ApprovalStatus) === "PENDING"
                          ? "Chờ duyệt"
                          : (selectedProduct.approvalStatus ||
                                selectedProduct.ApprovalStatus) === "APPROVED"
                            ? "Đã duyệt"
                            : "Bị từ chối"}
                      </span>
                    </div>
                  </div>

                  {/* Price & Store */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-sm">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                        💰 Giá bán
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatPrice(selectedProduct.price)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                        🏪 Cửa hàng
                      </p>
                      <p className="text-lg font-bold text-blue-900 truncate">
                        {selectedProduct.store?.storeName || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Category & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                        🏷️ Danh mục
                      </p>
                      <p className="text-sm font-bold text-purple-900">
                        {selectedProduct.category?.categoryName || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border-2 border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        📅 Ngày tạo
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {formatDate(selectedProduct.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      📝 Mô tả sản phẩm
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed line-clamp-4">
                      {selectedProduct.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* Reject Reason */}
                  {(selectedProduct.rejectReason ||
                    selectedProduct.RejectReason) && (
                    <div className="bg-red-50 p-5 rounded-xl border-2 border-red-200 space-y-2">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                        ⚠️ Lý do từ chối
                      </p>
                      <p className="text-red-700 text-sm leading-relaxed">
                        {selectedProduct.rejectReason ||
                          selectedProduct.RejectReason}
                      </p>
                    </div>
                  )}

                  {/* Reviewed Info */}
                  {(selectedProduct.reviewedAt ||
                    selectedProduct.ReviewedAt) && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        ✅ Thông tin duyệt
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-xs text-blue-700 font-medium mb-1">
                          Ngày duyệt:
                        </p>
                        <p className="text-blue-900 font-semibold">
                          {formatDate(
                            selectedProduct.reviewedAt ||
                              selectedProduct.ReviewedAt,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Variants */}
                  {selectedProduct.variants &&
                    selectedProduct.variants.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          🎨 Biến thể sản phẩm (
                          {selectedProduct.variants.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedProduct.variants.map((variant, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition flex justify-between items-center"
                            >
                              <div>
                                <span className="font-bold text-slate-900">
                                  {variant.size}{" "}
                                  {variant.color ? `- ${variant.color}` : ""}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-700">
                                  {formatPrice(variant.price)}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                  Tồn kho: {variant.stock}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 px-8 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-3 text-slate-700 font-bold border-2 border-slate-300 rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                Đóng
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg duration-200"
              >
                <XCircle size={18} />
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg duration-200"
              >
                <CheckCircle2 size={18} />
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Từ chối sản phẩm
              </h2>
              <p className="text-slate-600 text-sm">
                Vui lòng nhập lý do từ chối (sẽ được gửi cho shop owner):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thumbnail không hợp lệ, Mô tả sai lệch, v.v..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                rows={4}
                disabled={isProcessing}
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-slate-700 font-bold border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
              >
                {isProcessing ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                {confirmModal.title}
              </h2>
              <p className="text-slate-600 text-sm">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    title: "",
                    message: "",
                    action: null,
                  })
                }
                disabled={isProcessing}
                className="flex-1 px-4 py-2 text-slate-700 font-bold border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmModal.action === "APPROVE") {
                    confirmApprove();
                  }
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
