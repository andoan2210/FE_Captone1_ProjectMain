// Sản phẩm
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/shop-owner/ConfirmModal';
import {
  FiBox, FiPlus, FiSearch, FiFilter, FiMoreVertical,
  FiEdit2, FiEye, FiTrash2, FiChevronLeft, FiChevronRight,
  FiTrendingUp, FiCheckCircle, FiEyeOff, FiAlertTriangle, FiGrid, FiX
} from 'react-icons/fi';

import { ProductService } from '../../services/ProductService';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả danh mục');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [stockFilter, setStockFilter] = useState('Tất cả');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ Service
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductService.getMyProducts(currentPage, 100);
      if (response && response.data) {
        // Sắp xếp sản phẩm mới nhất lên đầu (Dựa trên updatedAt hoặc createdAt)
        const sortedProducts = response.data.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
        setAllProducts(sortedProducts);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (product) => {
    if (!product || !product.productId) return;
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleViewClick = async (product) => {
    if (!product || !product.productId) return;
    setLoading(true);
    try {
      const detail = await ProductService.getProductById(product.productId);
      setProductToView(detail);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Lỗi tải chi tiết sản phẩm:", error);
      alert("Không thể tải chi tiết sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('Tất cả danh mục');
    setStatusFilter('Tất cả');
    setStockFilter('Tất cả');
    setCurrentPage(1);
    setSelectedProducts([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(paginatedProducts.map(p => p.productId));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };


  const confirmDelete = async () => {
    try {
      if (selectedProducts.length > 0) {
        await ProductService.bulkDeleteProducts(selectedProducts);
        setSelectedProducts([]);
      } else if (productToDelete) {
        await ProductService.deleteProduct(productToDelete.productId);
        setProductToDelete(null);
      }
      await fetchProducts();
    } catch (error) {
      console.error("Delete failed", error);
    }
    setIsDeleteModalOpen(false);
  };

  // Logic Lọc Dữ Liệu
  // Logic Lọc Dữ Liệu - Thêm kiểm tra an toàn (null check)
  const filteredProducts = allProducts.filter(product => {
    const name = product.productName || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryName = product.category?.categoryName || 'Chưa phân loại';
    const matchesCategory = categoryFilter === 'Tất cả danh mục' || categoryName === categoryFilter;

    const matchesStatus = statusFilter === 'Tất cả' || (product.isActive ? 'Đang hoạt động' : 'Tạm ẩn') === statusFilter;

    let matchesStock = true;
    const currentStock = product.stock || 0;

    if (stockFilter === 'Hết hàng') matchesStock = currentStock === 0;
    else if (stockFilter === 'Sắp hết hàng') matchesStock = currentStock > 0 && currentStock < 10;
    else if (stockFilter === 'Còn hàng') matchesStock = currentStock >= 10;

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Logic Phân Trang
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = [
    { title: 'Tổng sản phẩm', value: allProducts.length, trend: 'Toàn bộ', icon: FiBox, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Đang hoạt động', value: allProducts.filter(p => p.isActive).length, trend: 'Sẵn sàng', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Tạm ẩn', value: allProducts.filter(p => !p.isActive).length, trend: 'Đã ẩn', icon: FiEyeOff, color: 'text-slate-500', bg: 'bg-slate-100' },
    { title: 'Hết hàng', value: allProducts.filter(p => p.stock === 0).length, trend: 'Cần nhập thêm', icon: FiAlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Tổng danh mục', value: new Set(allProducts.map(p => p.category?.categoryId).filter(Boolean)).size, trend: 'Đang sử dụng', icon: FiGrid, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 text-left transition-all duration-500 ease-in-out">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý sản phẩm</h1>
        </div>
        <button
          onClick={() => navigate('/shop-owner/products/add')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
        >
          <FiPlus className="text-xl" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
              <div className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                LIFESTYLE
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
              <p className={`text-xs font-bold leading-relaxed flex items-center gap-1 ${stat.title === 'Hết hàng' ? 'text-rose-500' : 'text-emerald-500'}`}>
                {stat.title !== 'Tạm ẩn' && stat.title !== 'Tổng danh mục' && <FiTrendingUp className="inline" />}
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Tìm kiếm sản phẩm</label>
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all duration-300 z-10" size={18} />
              <input
                type="text"
                placeholder="Tên sản phẩm, SKU hoặc mã vạch..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all duration-300 shadow-sm hover:border-slate-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Phân loại</label>
              <div className="relative group">
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer appearance-none min-w-[180px] shadow-sm hover:bg-slate-50 transition-all"
                >
                  <option>Tất cả danh mục</option>
                  <option>Thời trang</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                  <FiFilter size={14} />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer min-w-[150px] shadow-sm hover:bg-slate-50 transition-all"
              >
                <option>Tất cả</option>
                <option>Đang hoạt động</option>
                <option>Tạm ẩn</option>
                <option>Hết hàng</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Tồn kho</label>
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 cursor-pointer min-w-[150px] shadow-sm hover:bg-slate-50 transition-all"
              >
                <option>Tất cả</option>
                <option>Còn hàng</option>
                <option>Sắp hết hàng</option>
                <option>Hết hàng</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-4"></div> {/* Label giả để căn chỉnh nút */}
              <button
                onClick={handleResetFilters}
                className="text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-6 py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm border border-blue-100 whitespace-nowrap"
              >
                Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions & Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedProducts.length}
              </span>
              <span className="text-blue-700 font-bold text-sm">Sản phẩm đã được chọn</span>
            </div>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
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
                    onChange={handleSelectAll}
                    checked={paginatedProducts.length > 0 && selectedProducts.length === paginatedProducts.length}
                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-200 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Giá bán</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày cập nhật</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
                <tr key={product.productId} className={`hover:bg-slate-50/80 transition-colors group ${selectedProducts.includes(product.productId) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.productId)}
                      onChange={() => handleSelectProduct(product.productId)}
                      className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-200 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative group-hover:shadow-md transition-all">
                        <img src={product.thumbnailUrl} alt={product.productName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                          {product.productName || 'Chưa có tên'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                          ID: #{product.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-slate-600">
                      {product.category?.categoryName || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">
                        {Number(product.price).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 min-w-[100px]">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={(product.stock < 10) ? 'text-rose-500' : 'text-slate-600'}>
                          {product.stock}
                          {(product.stock < 10) && <FiAlertTriangle className="inline-block ml-1" />}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${(product.stock < 10) ? 'bg-rose-500' :
                            (product.stock < 50) ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                          style={{ width: `${Math.min(product.stock, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider ${product.isActive
                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                        }`}>
                        {product.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-slate-500">{new Date(product.updatedAt || product.createdAt).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/shop-owner/products/edit/${product.productId}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleViewClick(product)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/30">
                    <div className="flex flex-col items-center gap-3">
                      <FiBox size={48} className="opacity-20" />
                      Không tìm thấy sản phẩm nào
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">
            Hiển thị <span className="text-slate-800 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> trên <span className="text-slate-800 font-bold">{totalItems}</span> sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === currentPage
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={selectedProducts.length > 0 ? "Xóa hàng loạt sản phẩm?" : "Xóa sản phẩm?"}
        message={
          selectedProducts.length > 0
            ? `Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`
            : `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`
        }
        confirmText={selectedProducts.length > 0 ? `Xóa ${selectedProducts.length} sản phẩm` : "Xóa ngay"}
        cancelText="Hủy bỏ"
        isDanger={true}
      />

      {/* View Product Modal */}
      {isViewModalOpen && productToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
              <h3 className="text-xl font-extrabold text-slate-800">Chi tiết sản phẩm</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                title="Đóng"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-10 text-left">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                {/* Product Image */}
                <div className="w-full md:w-56 aspect-square rounded-2xl border border-slate-100 overflow-hidden shrink-0 bg-slate-50 relative group">
                  <img
                    src={productToView.images && productToView.images.length > 0 ? productToView.images[0] : (productToView.image || 'https://via.placeholder.com/300')}
                    alt={productToView.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Summary Info */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${productToView.isActive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'
                        }`}>
                        {productToView.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        {productToView.categoryName || 'Chưa phân loại'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">{productToView.name}</h2>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">ID: #{productToView.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá bán</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Number(productToView.price).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã bán</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {productToView.sold || 0} <span className="text-sm font-medium text-slate-500">sp</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tồn kho tổng cộng</p>
                    <p className="text-sm font-bold text-slate-700">
                      {productToView.variants ? productToView.variants.reduce((sum, v) => sum + v.stock, 0) : 0} sản phẩm
                    </p>
                  </div>
                </div>
              </div>

              {/* Variants Table in Modal */}
              {productToView.variants && productToView.variants.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                    <FiGrid className="text-indigo-500" /> Phân loại & Tồn kho
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                          <th className="px-4 py-3 text-left font-bold text-slate-500">Phân loại (Size/Màu)</th>
                          <th className="px-4 py-3 text-right font-bold text-slate-500">Tồn kho</th>
                          <th className="px-4 py-3 text-right font-bold text-slate-500">Giá bán</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {productToView.variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-700">
                              {v.size} {v.color && <span className="text-slate-300 mx-1">|</span>} {v.color}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-600">{v.stock}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">
                              {Number(v.price).toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <FiBox className="text-blue-500" /> Mô tả chi tiết
                </h4>
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {productToView.description || 'Sản phẩm này hiện chưa có mô tả chi tiết.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200/60 bg-white flex justify-end gap-3 z-10 rounded-b-3xl">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-100 shadow-sm"
              >
                Đóng lại
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  navigate(`/shop-owner/products/edit/${productToView.id}`);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all active:scale-95"
              >
                <FiEdit2 size={16} /> Chỉnh sửa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
