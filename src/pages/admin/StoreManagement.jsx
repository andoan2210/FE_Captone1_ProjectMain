import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import {
    Search, Store, Ban, CheckCircle2, AlertCircle, X, Eye,
    ChevronLeft, ChevronRight, RefreshCw, Package, ShoppingCart,
    Tag, Mail, Phone, Calendar, User, ToggleLeft, ToggleRight,
    ExternalLink, TrendingUp
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'All', label: 'Tất cả trạng thái' },
    { value: 'Active', label: 'Đang hoạt động' },
    { value: 'Inactive', label: 'Đã vô hiệu' },
];

const StoreManagement = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [detailModal, setDetailModal] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => { fetchStores(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const fetchStores = async () => {
        try {
            setLoading(true); setError(null);
            const res = await adminService.getAllStores();
            setStores(res.data || []);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    // === ACTIONS ===
    const handleToggleStatus = (store) => {
        const isDeactivating = store.isActive;
        const action = isDeactivating ? 'vô hiệu hóa' : 'kích hoạt';
        setConfirmModal({
             store,
             actionText: action,
             isDeactivating,
             onConfirm: async () => {
                 setConfirmModal(null);
                 try {
                     setProcessing(true);
                     await adminService.toggleStoreStatus(store.storeId);
                     toast.success(`Đã ${action} cửa hàng "${store.storeName}"`);
                     setDetailModal(prev => prev && prev.storeId === store.storeId ? {...prev, isActive: !prev.isActive} : prev);
                     await fetchStores();
                 } catch (err) { toast.error(err.message); }
                 finally { setProcessing(false); }
             }
        });
    };

    const handleViewDetail = (store) => {
        setDetailModal(store);
    };

    // === FILTER & PAGINATE ===
    const filtered = stores.filter(s => {
        const matchSearch = `${s.storeName} ${s.owner?.fullName || ''} ${s.owner?.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All'
            || (statusFilter === 'Active' && s.isActive)
            || (statusFilter === 'Inactive' && !s.isActive);
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = {
        total: stores.length,
        active: stores.filter(s => s.isActive).length,
        inactive: stores.filter(s => !s.isActive).length,
        totalProducts: stores.reduce((sum, s) => sum + (s.totalProducts || 0), 0),
    };

    // === RENDER ===
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Store className="text-blue-600" size={24} />
                        Quản lý Cửa hàng
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Theo dõi và quản lý các cửa hàng kinh doanh trên nền tảng.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng cửa hàng', value: stats.total, icon: <Store size={20} />, color: 'blue' },
                    { label: 'Đang hoạt động', value: stats.active, icon: <CheckCircle2 size={20} />, color: 'emerald' },
                    { label: 'Đã vô hiệu', value: stats.inactive, icon: <Ban size={20} />, color: 'red' },
                    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: <Package size={20} />, color: 'purple' },
                ].map((s, i) => (
                    <div key={i} className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                            </div>
                            <div className={`w-11 h-11 rounded-xl bg-${s.color}-50 text-${s.color}-500 flex items-center justify-center`}>
                                {s.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Danh sách cửa hàng</h2>
                        <p className="text-sm text-gray-400 mt-0.5">{filtered.length} kết quả</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text" placeholder="Tìm tên shop, chủ shop..."
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-56"
                            />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <button onClick={fetchStores} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Làm mới">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col justify-center items-center h-64 text-red-500 gap-3">
                        <AlertCircle size={32} />
                        <p className="font-medium">{error}</p>
                        <button onClick={fetchStores} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Thử lại</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex justify-center items-center h-64 text-gray-400">Không tìm thấy cửa hàng nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-xs text-gray-400 uppercase tracking-wider">
                                    <th className="px-5 py-3.5 text-left font-semibold">Cửa hàng</th>
                                    <th className="px-5 py-3.5 text-left font-semibold">Chủ sở hữu</th>
                                    <th className="px-5 py-3.5 text-center font-semibold">Sản phẩm</th>
                                    <th className="px-5 py-3.5 text-center font-semibold">Đơn hàng</th>
                                    <th className="px-5 py-3.5 text-left font-semibold">Trạng thái</th>
                                    <th className="px-5 py-3.5 text-left font-semibold">Ngày tạo</th>
                                    <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginated.map(store => (
                                    <tr key={store.storeId} className="hover:bg-blue-50/30 transition group">
                                        {/* Store Info */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-sm">
                                                    {store.logoUrl
                                                        ? <img src={store.logoUrl} alt="" className="w-full h-full object-cover" />
                                                        : <Store size={18} />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-[13px] truncate max-w-[180px]">{store.storeName}</p>
                                                    <p className="text-xs text-gray-400">ID: #{store.storeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Owner */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden shrink-0">
                                                    {store.owner?.avatarUrl
                                                        ? <img src={store.owner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        : (store.owner?.fullName?.[0] || '?')
                                                    }
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{store.owner?.fullName || 'N/A'}</p>
                                                    <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{store.owner?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Products */}
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">
                                                <Package size={11} /> {store.totalProducts || 0}
                                            </span>
                                        </td>
                                        {/* Orders */}
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                                <ShoppingCart size={11} /> {store.totalOrders || 0}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${store.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {store.isActive ? <><CheckCircle2 size={11} /> Hoạt động</> : <><Ban size={11} /> Vô hiệu</>}
                                            </span>
                                        </td>
                                        {/* Created At */}
                                        <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">
                                            {store.createdAt ? new Date(store.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                                                <button onClick={() => handleViewDetail(store)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition" title="Xem chi tiết">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleToggleStatus(store)} disabled={processing}
                                                    className={`p-2 rounded-lg transition ${store.isActive
                                                        ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600'
                                                        : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'
                                                        }`}
                                                    title={store.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                    {store.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                </button>
                                                <a href={`/shop/${store.storeId}`} target="_blank" rel="noreferrer"
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Xem trang shop">
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Hiển thị <span className="font-bold text-gray-600">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</span> / {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronLeft size={16} /></button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* === MODAL: Chi tiết cửa hàng === */}
            {detailModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl p-6 text-white relative">
                            <button onClick={() => setDetailModal(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition"><X size={20} /></button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold overflow-hidden shadow-lg">
                                    {detailModal.logoUrl
                                        ? <img src={detailModal.logoUrl} alt="" className="w-full h-full object-cover" />
                                        : <Store size={28} />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{detailModal.storeName}</h3>
                                    <p className="text-white/70 text-sm flex items-center gap-1.5">
                                        <Store size={13} /> ID: #{detailModal.storeId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Description */}
                            {detailModal.description && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Mô tả</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{detailModal.description}</p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Sản phẩm', value: detailModal.totalProducts || 0, icon: <Package size={16} />, color: 'purple' },
                                    { label: 'Đơn hàng', value: detailModal.totalOrders || 0, icon: <ShoppingCart size={16} />, color: 'blue' },
                                    { label: 'Voucher', value: detailModal.totalVouchers || 0, icon: <Tag size={16} />, color: 'orange' },
                                ].map((item, i) => (
                                    <div key={i} className={`bg-${item.color}-50 rounded-xl p-3.5 border border-${item.color}-100 text-center`}>
                                        <div className={`w-8 h-8 rounded-lg bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center mx-auto mb-1.5`}>
                                            {item.icon}
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{item.value}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Trạng thái', value: detailModal.isActive ? '✅ Hoạt động' : '🔒 Vô hiệu' },
                                    { label: 'Ngày tạo', value: detailModal.createdAt ? new Date(detailModal.createdAt).toLocaleDateString('vi-VN') : 'N/A' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Owner Info */}
                            {detailModal.owner && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Thông tin chủ sở hữu</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 shadow-sm">
                                            {detailModal.owner.avatarUrl
                                                ? <img src={detailModal.owner.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                : (detailModal.owner.fullName?.[0] || '?')
                                            }
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                                <User size={13} className="text-gray-400" /> {detailModal.owner.fullName}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <Mail size={12} className="text-gray-400" /> {detailModal.owner.email}
                                            </p>
                                            {detailModal.owner.phone && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-gray-400" /> {detailModal.owner.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                <button onClick={() => handleToggleStatus(detailModal)} disabled={processing}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${detailModal.isActive
                                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                        }`}>
                                    {detailModal.isActive
                                        ? <><Ban size={14} /> Vô hiệu hóa</>
                                        : <><CheckCircle2 size={14} /> Kích hoạt</>
                                    }
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition">Đóng</button>
                                    <a href={`/shop/${detailModal.storeId}`} target="_blank" rel="noreferrer"
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5">
                                        <ExternalLink size={14} /> Xem trang shop
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL: Xác nhận === */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.isDeactivating ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {confirmModal.isDeactivating ? <Ban size={32} /> : <CheckCircle2 size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thao tác</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Bạn có chắc chắn muốn {confirmModal.actionText} cửa hàng <br/>
                                <span className="font-bold text-gray-800 text-base">"{confirmModal.store.storeName}"</span>?
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3 justify-center border-t border-gray-100">
                            <button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition min-w-[110px]">
                                Hủy
                            </button>
                            <button onClick={confirmModal.onConfirm} className={`px-5 py-2.5 text-white rounded-xl font-semibold transition shadow-sm min-w-[110px] ${confirmModal.isDeactivating ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
        </div>
    );
};

export default StoreManagement;
