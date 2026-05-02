import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiActivity,
    FiPauseCircle, FiTag, FiGift, FiCalendar,
    FiAlertTriangle, FiCheck, FiX, FiInfo, FiShield,
    FiTrendingUp, FiBox, FiChevronLeft, FiChevronRight, FiGrid
} from 'react-icons/fi';
import { ShopVoucherService } from '../../services/ShopVoucherService';
import { ShopProductService } from '../../services/ShopProductService';
import ConfirmModal from '../../components/shop-owner/ConfirmModal';

export default function Vouchers() {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ totalVouchers: 0, active: 0, usedCount: 0, expiringThisMonth: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    // Form states
    const [form, setForm] = useState({
        code: '', discount: '', limit: '', expiry: '', isActive: true,
        applyType: 'ALL', productIds: [], minOrderValue: '', maxDiscountValue: ''
    });

    // Fetch logic
    const loadData = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: pageSize,
                status: activeTab === 'Tất cả' ? 'all' : activeTab === 'Kích hoạt' ? 'active' : 'inactive',
                search: searchQuery
            };
            const [vouchersResponse, productsResponse, statsData] = await Promise.all([
                ShopVoucherService.getAllVouchers(params),
                ShopProductService.getMyProducts(1, 100).catch(() => ({ data: [] })),
                ShopVoucherService.getVoucherStats()
            ]);

            const items = vouchersResponse?.data?.items || [];
            const pagination = vouchersResponse?.data?.pagination || {};

            setTotalItems(pagination.totalItems || items.length);
            setTotalPages(pagination.totalPages || 1);

            setStats(statsData);
            setVouchers(items);
            // ShopProductService returns { data: { items: [] } } or similar, let's verify
            setProducts(productsResponse?.data?.items || productsResponse?.data || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu: ", error);
            toast.error("Không thể tải danh sách voucher");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300); // Debounce 300ms
        return () => clearTimeout(timer);
    }, [currentPage, activeTab, searchQuery]);

    const handleOpenAddModal = () => {
        setModalMode('add');
        setSelectedVoucher(null);
        setErrors({});
        setForm({
            code: '', discount: '', limit: '', expiry: '', isActive: true,
            applyType: 'ALL', productIds: [], minOrderValue: '', maxDiscountValue: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = async (voucher) => {
        setModalMode('edit');
        setIsLoading(true); // Show loading while fetching details
        try {
            // Fetch full details including productIds via GET request
            const response = await ShopVoucherService.getVoucherById(voucher.voucherId);
            const detail = response; // BE returns the voucher object directly from findOne

            setSelectedVoucher(voucher);
            setErrors({});
            setForm({
                code: detail.code,
                discount: detail.discountPercent,
                limit: detail.quantity,
                expiry: detail.expiredDate
                    ? new Date(detail.expiredDate).toISOString().split('T')[0]
                    : '',
                isActive: detail.isActive,
                applyType: detail.applyType || 'ALL',
                productIds: detail.productIds || [],
                minOrderValue: detail.minOrderValue || '',
                maxDiscountValue: detail.maxDiscountValue || ''
            });
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Không thể lấy chi tiết voucher");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDeleteModal = (voucher) => {
        setVoucherToDelete(voucher);
        setIsDeleteModalOpen(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.code || form.code.trim().length < 4) {
            newErrors.code = 'Mã voucher phải ít nhất 4 ký tự.';
        }

        const discount = Number(form.discount);
        if (!form.discount || isNaN(discount) || discount < 1 || discount > 100) {
            newErrors.discount = 'Giảm giá từ 1% đến 100%.';
        }

        const limit = Number(form.limit);
        if (!form.limit || isNaN(limit) || limit < 1) {
            newErrors.limit = 'Số lượng ít nhất là 1.';
        }

        if (!form.expiry) {
            newErrors.expiry = 'Vui lòng chọn ngày hết hạn.';
        } else {
            const selectedDate = new Date(form.expiry);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.expiry = 'Ngày hết hạn không được ở quá khứ.';
            }
        }

        if (form.applyType === 'SPECIFIC' && (!form.productIds || form.productIds.length === 0)) {
            newErrors.productIds = 'Vui lòng chọn ít nhất một sản phẩm.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const formData = {
            code: form.code,
            discountPercent: Number(form.discount),
            quantity: Number(form.limit),
            expiredDate: new Date(form.expiry).toISOString(),
            isActive: form.isActive,
            minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
            maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : null,
            applyType: form.applyType,
            productIds: form.applyType === 'SPECIFIC' ? form.productIds : []
        };

        try {
            if (modalMode === 'edit') {
                await ShopVoucherService.saveVoucher(formData, true, selectedVoucher?.voucherId);
                toast.success("Cập nhật voucher thành công 🎉");
            } else {
                await ShopVoucherService.saveVoucher(formData);
                toast.success("Thêm voucher thành công 🎉");
            }
            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi lưu voucher:", error);
            const message = error?.response?.data?.message || "Lưu voucher thất bại ❌";
            toast.error(typeof message === 'string' ? message : "Lỗi hệ thống");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!voucherToDelete) return;
        setIsSaving(true);
        try {
            await ShopVoucherService.deleteVoucher(voucherToDelete.voucherId);
            toast.success("Xóa voucher thành công 🗑️");
            await loadData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi xóa voucher:", error);
            toast.error("Không thể xóa voucher");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleProductSelection = (productId) => {
        setForm(prev => {
            const isSelected = prev.productIds.includes(productId);
            if (isSelected) {
                return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
        if (errors.productIds) setErrors({ ...errors, productIds: null });
    };

    return (
        <div className="space-y-8 text-left transition-all duration-500 ease-in-out p-6 max-w-[1600px] mx-auto">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Voucher</h1>
                    <p className="text-slate-500 mt-1 font-medium">Tạo và quản lý các chương trình khuyến mãi cho cửa hàng của bạn.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95"
                >
                    <FiPlus className="text-xl" /> Thêm Voucher Mới
                </button>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Tổng số Voucher', value: stats.totalVouchers, icon: FiGift, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Toàn bộ' },
                    { title: 'Đang hoạt động', value: stats.active, icon: FiActivity, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Sẵn sàng' },
                    { title: 'Đã sử dụng', value: stats.usedCount, icon: FiTag, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Lượt dùng', suffix: 'lượt' },
                    { title: 'Hết hạn tháng này', value: stats.expiringThisMonth, icon: FiCalendar, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Sắp tới' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100 uppercase">
                                {stat.trend}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-extrabold text-slate-900">
                                    {isLoading ? '...' : stat.value}
                                </h3>
                                {stat.suffix && <span className="text-xs text-slate-400 font-bold">{stat.suffix}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative group flex-1 max-w-md">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all z-10" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm mã voucher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        {['Tất cả', 'Kích hoạt', 'Tạm dừng'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === tab
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Mã Voucher</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Ưu đãi</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Phạm vi</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Hạn sử dụng</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>
                                    </td>
                                </tr>
                            ) : vouchers.length > 0 ? vouchers.map((v) => (
                                <tr key={v.voucherId} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 font-mono tracking-wider">
                                            {v.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-extrabold text-slate-800">Giảm {v.discountPercent}%</span>
                                            {v.minOrderValue > 0 && <span className="text-[10px] text-slate-400 font-bold uppercase">Đơn từ {Number(v.minOrderValue).toLocaleString()}đ</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{v.quantity}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${v.applyType === 'SPECIFIC' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                                            {v.applyType === 'SPECIFIC' ? 'Sản phẩm chỉ định' : 'Toàn bộ Shop'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                            <FiCalendar size={14} className="text-slate-300" />
                                            {v.expiredDate ? new Date(v.expiredDate).toLocaleDateString('vi-VN') : '--'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${v.displayStatus === 'active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : v.displayStatus === 'expired'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                            {v.displayStatus === 'active' ? 'Kích hoạt' : v.displayStatus === 'expired' ? 'Hết hạn' : 'Tạm dừng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleOpenEditModal(v)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button onClick={() => handleOpenDeleteModal(v)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50/20">
                                        <div className="flex flex-col items-center gap-4">
                                            <FiBox size={48} className="opacity-10" />
                                            Chưa có voucher nào được tạo
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <p className="text-sm font-medium text-slate-500">
                        Hiển thị <span className="text-slate-800 font-bold">{vouchers.length}</span> trên <span className="text-slate-800 font-bold">{totalItems}</span> voucher
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all font-bold"
                        >
                            <FiChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                        : 'text-slate-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-all font-bold"
                        >
                            <FiChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isSaving && setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                    {modalMode === 'add' ? <FiPlus size={24} /> : <FiEdit2 size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{modalMode === 'add' ? 'Tạo chương trình ưu đãi' : 'Cập nhật Voucher'}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{modalMode === 'add' ? 'Thiết lập mã giảm giá mới cho khách hàng' : 'Thay đổi thông tin chi tiết.'}</p>
                                </div>
                            </div>
                            <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2.5 rounded-2xl transition-all">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">

                                {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
                                <div className="space-y-8">
                                    <section className="space-y-6">
                                        <h4 className="text-xs font-black text-blue-500 tracking-widest uppercase flex items-center gap-2">
                                            <span className="w-4 h-[2px] bg-blue-500 rounded-full"></span> Thiết lập mã & Ưu đãi
                                        </h4>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-600 px-1">Mã voucher <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xs font-bold text-slate-400 group-focus-within:text-blue-500 transition-colors">#</div>
                                                <input
                                                    type="text"
                                                    value={form.code}
                                                    onChange={e => {
                                                        setForm({ ...form, code: e.target.value.toUpperCase() });
                                                        if (errors.code) setErrors({ ...errors, code: null });
                                                    }}
                                                    className={`w-full border-2 rounded-2xl pl-8 pr-4 py-3 text-sm font-black tracking-widest uppercase outline-none transition-all ${errors.code
                                                        ? 'border-rose-100 bg-rose-50 text-rose-600 focus:border-rose-400'
                                                        : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                                        }`}
                                                    placeholder="SUMMER2024"
                                                />
                                            </div>
                                            {errors.code && <p className="text-[11px] text-rose-500 font-bold mt-1 pl-4 flex items-center gap-1"><FiAlertTriangle size={12} /> {errors.code}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 px-1">Giảm giá (%) <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="number"
                                                    value={form.discount}
                                                    onChange={e => {
                                                        setForm({ ...form, discount: e.target.value });
                                                        if (errors.discount) setErrors({ ...errors, discount: null });
                                                    }}
                                                    className={`w-full border-2 rounded-2xl px-4 py-3 text-sm font-black outline-none transition-all ${errors.discount ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500'
                                                        }`}
                                                    placeholder="10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 px-1">Số lượng <span className="text-rose-500">*</span></label>
                                                <input
                                                    type="number"
                                                    value={form.limit}
                                                    onChange={e => {
                                                        setForm({ ...form, limit: e.target.value });
                                                        if (errors.limit) setErrors({ ...errors, limit: null });
                                                    }}
                                                    className={`w-full border-2 rounded-2xl px-4 py-3 text-sm font-black outline-none transition-all ${errors.limit ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500'
                                                        }`}
                                                    placeholder="100"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 px-1">Đơn tối thiểu (đ)</label>
                                                <input
                                                    type="number"
                                                    value={form.minOrderValue}
                                                    onChange={e => setForm({ ...form, minOrderValue: e.target.value })}
                                                    className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 px-1">Giảm tối đa (đ)</label>
                                                <input
                                                    type="number"
                                                    value={form.maxDiscountValue}
                                                    onChange={e => setForm({ ...form, maxDiscountValue: e.target.value })}
                                                    className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl px-4 py-3 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                    placeholder="Không giới hạn"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h4 className="text-xs font-black text-rose-500 tracking-widest uppercase flex items-center gap-2">
                                            <span className="w-4 h-[2px] bg-rose-500 rounded-full"></span> Hiệu lực & Trạng thái
                                        </h4>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-600 px-1">Ngày kết thúc <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-all" size={16} />
                                                <input
                                                    type="date"
                                                    value={form.expiry}
                                                    onChange={e => {
                                                        setForm({ ...form, expiry: e.target.value });
                                                        if (errors.expiry) setErrors({ ...errors, expiry: null });
                                                    }}
                                                    className={`w-full border-2 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none transition-all ${errors.expiry ? 'border-rose-100 bg-rose-50' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500'
                                                        }`}
                                                />
                                            </div>
                                            {errors.expiry && <p className="text-[11px] text-rose-500 font-bold mt-1 pl-4">{errors.expiry}</p>}
                                        </div>

                                        <div
                                            onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${form.isActive ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${form.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                    <FiActivity size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">Trạng thái phát hành</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">Kích hoạt ngay sau khi lưu</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* CỘT PHẢI: PHẠM VI ÁP DỤNG (SHOPEE STYLE) */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-amber-500 tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-4 h-[2px] bg-amber-500 rounded-full"></span> Phạm vi áp dụng
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, applyType: 'ALL', productIds: [] })}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${form.applyType === 'ALL'
                                                ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100'
                                                : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <FiGrid size={28} className={form.applyType === 'ALL' ? 'text-blue-600' : 'text-slate-400'} />
                                            <span className="text-sm font-black">Toàn bộ Shop</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, applyType: 'SPECIFIC' })}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${form.applyType === 'SPECIFIC'
                                                ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100'
                                                : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <FiBox size={28} className={form.applyType === 'SPECIFIC' ? 'text-blue-600' : 'text-slate-400'} />
                                            <span className="text-sm font-black">Sản phẩm chỉ định</span>
                                        </button>
                                    </div>

                                    {form.applyType === 'SPECIFIC' && (
                                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-600 px-1 uppercase tracking-tighter">Chọn sản phẩm ({form.productIds.length})</label>
                                                {errors.productIds && <span className="text-[10px] text-rose-500 font-bold">{errors.productIds}</span>}
                                            </div>
                                            <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 p-4 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                                                {products.length > 0 ? products.map(product => (
                                                    <div
                                                        key={product.productId}
                                                        onClick={() => toggleProductSelection(product.productId)}
                                                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border-2 ${form.productIds.includes(product.productId)
                                                            ? 'bg-white border-blue-500 shadow-sm'
                                                            : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <img src={product.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-200" />
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold text-slate-800 truncate">{product.productName}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{Number(product.price).toLocaleString()}đ</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.productIds.includes(product.productId)
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-slate-200 bg-white'
                                                            }`}>
                                                            {form.productIds.includes(product.productId) && <FiCheck size={12} />}
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-center py-8 text-xs text-slate-400 font-medium">Không tìm thấy sản phẩm nào</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                                <FiShield size={14} className="text-blue-400" /> Hệ thống bảo mật Shopee-style Active
                            </div>
                            <div className="flex gap-3">
                                <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-black text-slate-500 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-100 transition-all">Huỷ bỏ</button>
                                <button
                                    disabled={isSaving}
                                    onClick={handleSave}
                                    className="px-8 py-3 text-sm font-black text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-2"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (modalMode === 'add' ? 'Lưu chương trình' : 'Cập nhật ngay')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* DELETE DIALOG */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa Voucher"
                message={`Hành động này sẽ xóa vĩnh viễn voucher "${voucherToDelete?.code}". Bạn không thể hoàn tác thao tác này và các khách hàng đang sử dụng có thể bị ảnh hưởng.`}
                confirmText="Xóa vĩnh viễn"
                cancelText="Để tôi xem lại"
                isDanger={true}
            />
        </div>
    );
}
