/**
 * ApprovalBadge.jsx
 * Hiển thị badge trạng thái duyệt sản phẩm với màu sắc khác nhau
 * - PENDING: vàng (Đang chờ duyệt)
 * - APPROVED: xanh (Đã duyệt)
 * - REJECTED: đỏ (Bị từ chối)
 */
import React from "react";

export default function ApprovalBadge({ status }) {
  const statusConfig = {
    PENDING: {
      label: "Đang chờ duyệt",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      borderColor: "border-amber-300",
    },
    APPROVED: {
      label: "Đã duyệt",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-300",
    },
    REJECTED: {
      label: "Bị từ chối",
      bgColor: "bg-rose-100",
      textColor: "text-rose-700",
      borderColor: "border-rose-300",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.label}
    </span>
  );
}
