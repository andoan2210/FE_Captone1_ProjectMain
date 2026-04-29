import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import {
    FaStore,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaInfoCircle,
} from "react-icons/fa";

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
        <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                    Duyệt đơn đăng ký bán hàng
                </h2>
                <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                    Xem xét và duyệt các đơn đăng ký trở thành người bán hàng (ShopOwner)
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
                    <FaSpinner style={{ fontSize: 28, animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: 12 }}>Đang tải danh sách...</p>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div
                    style={{
                        textAlign: "center",
                        padding: 40,
                        background: "#fff3f3",
                        borderRadius: 12,
                        border: "1px solid #fecaca",
                    }}
                >
                    <p style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ {error}</p>
                    <button
                        onClick={fetchPendingStores}
                        style={{
                            marginTop: 12,
                            padding: "8px 20px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && pendingStores.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: 60,
                        background: "#f8fafc",
                        borderRadius: 12,
                        border: "1px dashed #d1d5db",
                    }}
                >
                    <FaStore style={{ fontSize: 40, color: "#9ca3af", marginBottom: 12 }} />
                    <p style={{ color: "#6b7280", fontSize: 16, fontWeight: 500 }}>
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
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            padding: 20,
                            marginBottom: 16,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                    >
                        {/* Tiêu đề store */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 16,
                                paddingBottom: 12,
                                borderBottom: "1px solid #f3f4f6",
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 10,
                                    background: store.logoUrl
                                        ? `url(${store.logoUrl}) center/cover`
                                        : "linear-gradient(135deg, #667eea, #764ba2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 20,
                                    flexShrink: 0,
                                }}
                            >
                                {!store.logoUrl && <FaStore />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>
                                    {store.storeName || "Chưa đặt tên"}
                                </h3>
                                <span
                                    style={{
                                        display: "inline-block",
                                        marginTop: 4,
                                        padding: "2px 10px",
                                        background: "#fef3c7",
                                        color: "#d97706",
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                >
                                    ⏳ Chờ duyệt
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontSize: 13 }}>
                                <FaCalendarAlt />
                                {formatDate(store.createdAt)}
                            </div>
                        </div>

                        {/* Mô tả */}
                        {store.description && (
                            <div style={{ marginBottom: 14, padding: "10px 14px", background: "#f9fafb", borderRadius: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "#6b7280", fontSize: 12, fontWeight: 600 }}>
                                    <FaInfoCircle /> Mô tả cửa hàng
                                </div>
                                <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                                    {store.description}
                                </p>
                            </div>
                        )}

                        {/* Thông tin người đăng ký */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 16,
                                padding: "10px 14px",
                                background: "#eff6ff",
                                borderRadius: 8,
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: store.owner?.avatarUrl
                                        ? `url(${store.owner.avatarUrl}) center/cover`
                                        : "#3b82f6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontSize: 14,
                                    flexShrink: 0,
                                }}
                            >
                                {!store.owner?.avatarUrl && <FaUser />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e3a5f" }}>
                                    {store.owner?.fullName || "N/A"}
                                </div>
                                <div style={{ display: "flex", gap: 16, marginTop: 2, fontSize: 13, color: "#6b7280" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <FaEnvelope style={{ fontSize: 11 }} /> {store.owner?.email || "N/A"}
                                    </span>
                                    {store.owner?.phone && (
                                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <FaPhone style={{ fontSize: 11 }} /> {store.owner.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => handleReject(store.storeId, store.storeName)}
                                disabled={processingId === store.storeId}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 20px",
                                    background: "#fff",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    borderRadius: 8,
                                    cursor: processingId === store.storeId ? "not-allowed" : "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    opacity: processingId === store.storeId ? 0.5 : 1,
                                }}
                            >
                                <FaTimes /> Từ chối
                            </button>
                            <button
                                onClick={() => handleApprove(store.storeId, store.storeName)}
                                disabled={processingId === store.storeId}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 20px",
                                    background: "#22c55e",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: processingId === store.storeId ? "not-allowed" : "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
                                    opacity: processingId === store.storeId ? 0.5 : 1,
                                }}
                            >
                                {processingId === store.storeId ? (
                                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                    <FaCheck />
                                )}
                                Duyệt
                            </button>
                        </div>
                    </div>
                ))}

            {/* Modal Xác nhận */}
            {confirmModal.isOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        animation: "fadeIn 0.2s ease-out",
                    }}
                    onClick={closeConfirmModal}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: "24px",
                            width: "90%",
                            maxWidth: "400px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            animation: "slideUp 0.3s ease-out",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 700, color: "#1f2937", display: "flex", alignItems: "center", gap: 8 }}>
                            {confirmModal.type === "approve" ? (
                                <FaCheck style={{ color: "#22c55e" }} />
                            ) : (
                                <FaTimes style={{ color: "#dc2626" }} />
                            )}
                            {confirmModal.title}
                        </h3>
                        <p style={{ margin: "0 0 24px 0", fontSize: 15, color: "#4b5563", lineHeight: 1.5 }}>
                            {confirmModal.message}
                        </p>
                        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button
                                onClick={closeConfirmModal}
                                style={{
                                    padding: "8px 16px",
                                    background: "#f3f4f6",
                                    color: "#4b5563",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                                    closeConfirmModal();
                                }}
                                style={{
                                    padding: "8px 16px",
                                    background: confirmModal.type === "approve" ? "#22c55e" : "#dc2626",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: 14,
                                }}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerApprovals;
