/**
 * ApprovalProducts.jsx
 * Trang quản lý sản phẩm chờ duyệt cho Shop Owner
 * Hiển thị danh sách sản phẩm với các tab: Tất cả, Chờ duyệt, Đã duyệt, Bị từ chối
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiInfo,
  FiEdit2,
} from "react-icons/fi";
import ApprovalBadge from "../../components/shop-owner/ApprovalBadge";
import { ShopProductService } from "../../services/ShopProductService";

const ApprovalProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Tab configuration
  const tabs = [
    { id: "ALL", label: "Tất cả", icon: FiBox, status: null },
    {
      id: "PENDING",
      label: "Đang chờ duyệt",
      icon: FiClock,
      status: "PENDING",
    },
    {
      id: "APPROVED",
      label: "Đã duyệt",
      icon: FiCheckCircle,
      status: "APPROVED",
    },
    {
      id: "REJECTED",
      label: "Bị từ chối",
      icon: FiXCircle,
      status: "REJECTED",
    },
  ];

  // Gọi API lấy sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let response;

      if (activeTab === "ALL") {
        // Lấy tất cả sản phẩm
        response = await ShopProductService.getMyProducts(
          currentPage,
          itemsPerPage,
        );
      } else {
        // Lấy sản phẩm theo status
        response = await ShopProductService.getMyProductsByStatus(
          activeTab,
          currentPage,
          itemsPerPage,
          searchTerm,
        );
      }

      if (response && response.data) {
        setProducts(response.data);
        setTotalItems(response.total || response.data.length);
      } else {
        setProducts([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, currentPage, searchTerm]);

  // Lọc sản phẩm theo search term (client-side)
  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Tính toán pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Format ngày tháng
  const formatDate = (date) => {
    if (!date) return "--";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  // Thống kê
  const stats = [
    {
      label: "Chờ duyệt",
      count: products.filter((p) => p.approvalStatus === "PENDING").length,
      icon: FiClock,
      color: "text-amber-600",
    },
    {
      label: "Đã duyệt",
      count: products.filter((p) => p.approvalStatus === "APPROVED").length,
      icon: FiCheckCircle,
      color: "text-emerald-600",
    },
    {
      label: "Bị từ chối",
      count: products.filter((p) => p.approvalStatus === "REJECTED").length,
      icon: FiXCircle,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý duyệt sản phẩm
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi trạng thái duyệt sản phẩm của shop
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {stat.count}
                </h3>
              </div>
              <div className={`text-3xl ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative group">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all duration-300 z-10"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-100">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all duration-300 ${isActive
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                  }`}
              >
                <TabIcon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-slate-600">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                <span className="font-medium">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <FiBox className="mx-auto text-4xl text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">
                Không tìm thấy sản phẩm nào
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cập nhật
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                  >
                    {/* Sản phẩm */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiBox className="text-slate-400" size={24} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {product.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.category?.categoryName || "Chưa phân loại"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Giá */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-slate-900">
                        {formatPrice(product.price)}
                      </p>
                    </td>

                    {/* Tồn kho */}
                    <td className="px-6 py-4">
                      <p
                        className={`text-sm font-bold ${product.stock > 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                          }`}
                      >
                        {product.stock} {product.stock === 0 && "(Hết hàng)"}
                      </p>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <ApprovalBadge status={product.approvalStatus} />
                        {product.rejectReason && (
                          <div className={`flex items-start gap-2 p-2 rounded-lg border ${product.approvalStatus === "REJECTED"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                            }`}>
                            {product.approvalStatus === "REJECTED" ? (
                              <FiAlertCircle className="text-rose-600 mt-0.5 flex-shrink-0" size={16} />
                            ) : (
                              <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                            )}
                            <p className="text-xs font-medium">
                              {product.rejectReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cập nhật */}
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>
                          <span className="font-bold text-slate-700">Tạo:</span>{" "}
                          {formatDate(product.createdAt)}
                        </p>
                        <p>
                          <span className="font-bold text-slate-700">Sửa:</span>{" "}
                          {formatDate(product.updatedAt)}
                        </p>
                        {product.reviewedAt && (
                          <p>
                            <span className="font-bold text-slate-700">
                              Duyệt:
                            </span>{" "}
                            {formatDate(product.reviewedAt)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Hành động */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.approvalStatus === "APPROVED" && (
                          <button
                            onClick={() =>
                              navigate(
                                `/shop-owner/products/edit/${product.productId}`,
                              )
                            }
                            title="Sửa sản phẩm"
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        )}
                        {product.approvalStatus === "REJECTED" && (
                          <div className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-medium border border-rose-200">
                            Không thể sửa
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <p className="text-sm text-slate-600 font-medium">
              Trang {currentPage} của {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalProducts;
