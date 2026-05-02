import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import {
  ClipboardCheck, Store, Check, X, Loader2, User, Mail, Phone, Calendar, Info
} from 'lucide-react';

const SellerApprovals = () => {
    const [pendingStores, setPendingStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        type: "approve",
    });

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    // Fetch danh sách đơn chờ duyệt
    const fetchPendingStores = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getPendingStores();
            setPendingStores(res.data || []);
        } catch (err) {
            setError(err.message || "Không thể tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingStores();
    }, []);

    // Duyệt đơn
    const handleApprove = (storeId, storeName) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận duyệt cửa hàng",
            message: `Bạn có chắc chắn muốn duyệt cửa hàng "${storeName}"? Người dùng sẽ trở thành ShopOwner.`,
            type: "approve",
            onConfirm: async () => {
                try {
                    setProcessingId(storeId);
                    await adminService.approveStore(storeId);
                    toast.success(`Đã duyệt cửa hàng "${storeName}" thành công!`);
                    // Xóa khỏi danh sách
                    setPendingStores((prev) => prev.filter((s) => s.storeId !== storeId));
                } catch (err) {
                    toast.error(err.message || "Duyệt thất bại");
                } finally {
                    setProcessingId(null);
                }
            },
        });
    };

    // Từ chối đơn
    const handleReject = (storeId, storeName) => {
        setConfirmModal({
            isOpen: true,
            title: "Xác nhận từ chối",
            message: `Bạn có chắc chắn muốn từ chối cửa hàng "${storeName}"? Đơn sẽ bị xóa.`,
            type: "reject",
            onConfirm: async () => {
                try {
                    setProcessingId(storeId);
                    await adminService.rejectStore(storeId);
                    toast.success(`Đã từ chối cửa hàng "${storeName}"`);
                    setPendingStores((prev) => prev.filter((s) => s.storeId !== storeId));
                } catch (err) {
                    toast.error(err.message || "Từ chối thất bại");
                } finally {
                    setProcessingId(null);
                }
            },
        });
    };

    // Format ngày
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardCheck className="text-blue-600" size={24} />
                        Duyệt đơn đăng ký bán hàng
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Xem xét và duyệt các đơn đăng ký trở thành người bán hàng (ShopOwner).
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Loading */}
            {loading && (
                <div className="text-center py-20 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                    <p className="mt-4 font-medium">Đang tải danh sách...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100 mx-auto max-w-md">
                    <p className="text-red-600 font-bold mb-4">⚠️ {error}</p>
                    <button
                        onClick={fetchPendingStores}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && pendingStores.length === 0 && (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">
                        Không có đơn đăng ký nào chờ duyệt
                    </p>
                </div>
            )}

            {/* Danh sách đơn */}
            {!loading &&
                !error &&
                pendingStores.map((store) => (
                    <div
                        key={store.storeId}
                        className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Tiêu đề store */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                            <div
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shrink-0 ${!store.logoUrl ? 'bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20' : ''}`}
                                style={store.logoUrl ? { background: `url(${store.logoUrl}) center/cover` } : {}}
                            >
                                {!store.logoUrl && <Store />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {store.storeName || "Chưa đặt tên"}
                                </h3>
                                <span className="inline-flex items-center mt-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Chờ duyệt
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                                <Calendar size={14} />
                                {formatDate(store.createdAt)}
                            </div>
                        </div>

                        {/* Mô tả */}
                        {store.description && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-1.5 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <Info size={14} /> Mô tả cửa hàng
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {store.description}
                                </p>
                            </div>
                        )}

                        {/* Thông tin người đăng ký */}
                        <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${!store.owner?.avatarUrl ? 'bg-blue-600' : ''}`}
                                style={store.owner?.avatarUrl ? { background: `url(${store.owner.avatarUrl}) center/cover` } : {}}
                            >
                                {!store.owner?.avatarUrl && <User size={18} />}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm text-blue-900">
                                    {store.owner?.fullName || "N/A"}
                                </div>
                                <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-blue-600/70 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={12} /> {store.owner?.email || "N/A"}
                                    </span>
                                    {store.owner?.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={12} /> {store.owner.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => handleReject(store.storeId, store.storeName)}
                                disabled={processingId === store.storeId}
                                className="flex items-center gap-2 px-6 py-2.5 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-all disabled:opacity-50"
                            >
                                <X size={18} /> Từ chối
                            </button>
                            <button
                                onClick={() => handleApprove(store.storeId, store.storeName)}
                                disabled={processingId === store.storeId}
                                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                            >
                                {processingId === store.storeId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check size={18} />
                                )}
                                Duyệt ngay
                            </button>
                        </div>
                    </div>
                ))}

            {/* Modal Xác nhận */}
            {confirmModal.isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeConfirmModal}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                {confirmModal.type === 'approve' ? <Check size={40} /> : <X size={40} />}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{confirmModal.title}</h3>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={closeConfirmModal}
                                    className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModal.onConfirm) confirmModal.onConfirm();
                                        closeConfirmModal();
                                    }}
                                    className={`flex-1 px-6 py-4 text-sm font-bold text-white rounded-2xl shadow-xl transition-all ${confirmModal.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'}`}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerApprovals;
