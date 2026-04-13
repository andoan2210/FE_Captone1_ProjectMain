import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CheckoutService from "../../services/CheckoutService";
import "./Checkout.css";

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatVND = (val) =>
  new Intl.NumberFormat("vi-VN").format(Number(val) || 0) + "đ";

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Hiển thị 1 sản phẩm trong đơn hàng */
function OrderItemRow({ item }) {
  const imageUrl = item.productImage || item.image;
  return (
    <div className="ck-item-row">
      {imageUrl ? (
        <img src={imageUrl} alt={item.productName} className="ck-item-img" />
      ) : (
        <div className="ck-item-img-placeholder">🛍️</div>
      )}
      <div className="ck-item-info">
        <div className="ck-item-name">{item.productName}</div>
        <div className="ck-item-qty">x{item.quantity}</div>
      </div>
      <div className="ck-item-price">
        <div className="ck-item-unit">{formatVND(item.price)} / cái</div>
        <div className="ck-item-total">{formatVND(item.total)}</div>
      </div>
    </div>
  );
}

/** Card địa chỉ hiển thị trong Modal Chọn */
function ModalAddressCard({ addr, selected, onSelect, onEdit }) {
  const fullAddr = [addr.detailAddress, addr.ward, addr.district, addr.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="ck-modal-addr-card">
      <div className="ck-modal-addr-left">
        <label className="ck-radio-container">
          <input
            type="radio"
            name="checkout-address"
            checked={selected}
            onChange={() => onSelect(addr.id)}
          />
          <span className="ck-checkmark"></span>
        </label>
      </div>
      <div className="ck-modal-addr-content">
        <div className="ck-modal-addr-header">
          <span className="ck-modal-addr-name">{addr.fullName}</span>
          <span className="ck-modal-addr-sep">|</span>
          <span className="ck-modal-addr-phone">{addr.phone}</span>
          <button
            className="ck-modal-addr-edit-btn"
            onClick={() => onEdit(addr)}
          >
            Cập nhật
          </button>
        </div>
        <div className="ck-modal-addr-detail">{addr.detailAddress}</div>
        <div className="ck-modal-addr-region">
          {addr.ward}, {addr.district}, {addr.province}
        </div>
        {addr.isDefault && (
          <span className="ck-modal-addr-badge">Mặc định</span>
        )}
      </div>
    </div>
  );
}

/** Modal Chọn Địa Chỉ (Shopee Style) */
function AddressSelectionModal({
  isOpen,
  onClose,
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onEdit,
}) {
  if (!isOpen) return null;

  return (
    <div className="ck-modal-overlay" onClick={onClose}>
      <div
        className="ck-modal-box ck-addr-select-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ck-modal-header">
          <h3>Địa Chỉ Của Tôi</h3>
          <button className="ck-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ck-modal-body ck-addr-list-body">
          {addresses.map((addr) => (
            <ModalAddressCard
              key={addr.id}
              addr={addr}
              selected={selectedId === addr.id}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
        </div>
        <div className="ck-modal-footer">
          <button className="ck-modal-add-btn" onClick={onAddNew}>
            ＋ Thêm Địa Chỉ Mới
          </button>
          <div className="ck-modal-actions">
            <button className="ck-modal-btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button className="ck-modal-btn-confirm" onClick={onClose}>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Modal Form Thêm/Sửa Địa Chỉ */
function AddressFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        phone: initialData.phone || "",
        province: initialData.province || "",
        district: initialData.district || "",
        ward: initialData.ward || "",
        detailAddress: initialData.detailAddress || "",
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        detailAddress: "",
        isDefault: false,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại 10 chữ số";
    if (!formData.province) newErrors.province = "Tỉnh/Thành phố là bắt buộc";
    if (!formData.district) newErrors.district = "Quận/Huyện là bắt buộc";
    if (!formData.ward) newErrors.ward = "Phường/Xã là bắt buộc";
    if (!formData.detailAddress)
      newErrors.detailAddress = "Địa chỉ chi tiết là bắt buộc";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <div className="ck-modal-overlay" onClick={onClose}>
      <div
        className="ck-modal-box ck-addr-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ck-modal-header">
          <h3>{initialData ? "Cập nhật địa chỉ" : "Địa chỉ mới"}</h3>
        </div>
        <form onSubmit={handleSubmit} className="ck-modal-body">
          <div className="ck-form-row">
            <div className="ck-input-group">
              <input
                type="text"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              {errors.fullName && (
                <span className="ck-form-error">{errors.fullName}</span>
              )}
            </div>
            <div className="ck-input-group">
              <input
                type="text"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              {errors.phone && (
                <span className="ck-form-error">{errors.phone}</span>
              )}
            </div>
          </div>
          <div className="ck-input-group">
            <input
              type="text"
              placeholder="Tỉnh/Thành phố"
              value={formData.province}
              onChange={(e) =>
                setFormData({ ...formData, province: e.target.value })
              }
            />
            {errors.province && (
              <span className="ck-form-error">{errors.province}</span>
            )}
          </div>
          <div className="ck-input-group">
            <input
              type="text"
              placeholder="Quận/Huyện"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
            />
            {errors.district && (
              <span className="ck-form-error">{errors.district}</span>
            )}
          </div>
          <div className="ck-input-group">
            <input
              type="text"
              placeholder="Phường/Xã"
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
            />
            {errors.ward && (
              <span className="ck-form-error">{errors.ward}</span>
            )}
          </div>
          <div className="ck-input-group">
            <textarea
              placeholder="Địa chỉ cụ thể"
              value={formData.detailAddress}
              onChange={(e) =>
                setFormData({ ...formData, detailAddress: e.target.value })
              }
            />
            {errors.detailAddress && (
              <span className="ck-form-error">{errors.detailAddress}</span>
            )}
          </div>
          <label className="ck-checkbox-row">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              disabled={initialData?.isDefault}
            />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="ck-form-actions">
            <button type="button" className="ck-btn-back" onClick={onClose}>
              TRỞ LẠI
            </button>
            <button type="submit" className="ck-btn-submit">
              HOÀN THÀNH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Thanh bước checkout */
function Steps({ step }) {
  const steps = ["Giỏ hàng", "Thanh toán", "Xác nhận"];
  return (
    <div className="ck-topbar-steps" aria-label="Các bước đặt hàng">
      {steps.map((s, i) => {
        const idx = i + 1;
        const state = idx < step ? "done" : idx === step ? "active" : "";
        return (
          <React.Fragment key={s}>
            {i > 0 && <span className="ck-step-sep" aria-hidden />}
            <div
              className={`ck-step ${state}`}
              aria-current={idx === step ? "step" : undefined}
            >
              <div className="ck-step-num">{state === "done" ? "✓" : idx}</div>
              <span>{s}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Summary skeleton khi đang gọi preview */
function SummarySkeleton() {
  return (
    <div className="ck-sum-skeleton">
      {[80, 60, 70, 50, 90].map((w, i) => (
        <div key={i} className="ck-skeleton-line" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** Màn hình thành công */
function SuccessOverlay({ orderId, payUrl, onGoOrders, onGoHome }) {
  const hasMomo = !!payUrl;

  useEffect(() => {
    if (hasMomo && payUrl) {
      const t = setTimeout(() => {
        window.location.href = payUrl;
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [hasMomo, payUrl]);

  return (
    <div
      className="ck-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Đặt hàng thành công"
    >
      <div className="ck-success-box">
        <div className="ck-success-icon" aria-hidden>
          🎉
        </div>
        <h2 className="ck-success-title">Đặt hàng thành công!</h2>
        <p className="ck-success-msg">
          Cảm ơn bạn đã tin tưởng SmartAI Fashion. Chúng tôi sẽ xử lý đơn hàng
          của bạn ngay.
        </p>
        {orderId && (
          <div className="ck-success-order-id">
            Mã đơn hàng: <strong>#{orderId}</strong>
          </div>
        )}
        {hasMomo && (
          <div className="ck-success-momo-notice">
            ⚡ Đang chuyển đến cổng thanh toán MoMo trong 3 giây...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận state từ navigate (từ Cart hoặc ProductDetail)
  // state: { type: 'CART', selectedItems: [...] }
  //    OR: { type: 'BUY_NOW', variantId: X, quantity: Y }
  const checkoutState = location.state || {};

  // ── State ──
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddrSelect, setShowAddrSelect] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("MOMO");
  // Kế thừa voucher đã áp dụng từ Cart page (nếu có)
  const [voucherCode, setVoucherCode] = useState(
    checkoutState.voucherCode || "",
  );
  const [voucherApplied, setVoucherApplied] = useState(
    checkoutState.voucherCode || "",
  );
  const [voucherStatus, setVoucherStatus] = useState(null); // {ok, msg}
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null); // { orderId, payUrl }

  const previewDebounce = useRef(null);

  // ── Kiểm tra state hợp lệ ──
  const isValid =
    checkoutState.type === "CART"
      ? checkoutState.selectedItems?.length > 0
      : checkoutState.type === "BUY_NOW" &&
        checkoutState.variantId &&
        checkoutState.quantity > 0;

  const fetchAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await CheckoutService.getAddresses();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setAddresses(list);
      // Tự động chọn địa chỉ mặc định nếu chưa chọn
      if (!selectedAddressId) {
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (e) {
      console.error("Lỗi tải địa chỉ:", e);
    } finally {
      setLoadingAddr(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ── Gọi Preview mỗi khi voucher / loại đặt thay đổi ──
  const callPreview = useCallback(
    async (appliedVoucher = "") => {
      if (!isValid) return;
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const params = {
          type: checkoutState.type,
          ...(checkoutState.type === "CART"
            ? { selectedItems: checkoutState.selectedItems }
            : {
                variantId: checkoutState.variantId,
                quantity: checkoutState.quantity,
              }),
          ...(appliedVoucher ? { voucherCode: appliedVoucher } : {}),
        };
        const data = await CheckoutService.preview(params);
        setPreviewData(data);
      } catch (e) {
        const msg =
          e.response?.data?.message ||
          e.message ||
          "Không thể tải thông tin đơn hàng";
        setPreviewError(msg);
      } finally {
        setPreviewLoading(false);
      }
    },
    [checkoutState, isValid],
  );

  useEffect(() => {
    callPreview(voucherApplied);
  }, [callPreview, voucherApplied]);

  // ── Áp dụng voucher ──
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setPreviewLoading(true);
    setVoucherStatus(null);
    try {
      const params = {
        type: checkoutState.type,
        ...(checkoutState.type === "CART"
          ? { selectedItems: checkoutState.selectedItems }
          : {
              variantId: checkoutState.variantId,
              quantity: checkoutState.quantity,
            }),
        voucherCode: voucherCode.trim(),
      };
      const data = await CheckoutService.preview(params);
      setPreviewData(data);
      setVoucherApplied(voucherCode.trim());
      setVoucherStatus({
        ok: true,
        msg: `Voucher "${voucherCode.trim()}" đã được áp dụng thành công!`,
      });
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || "Voucher không hợp lệ";
      setVoucherStatus({ ok: false, msg });
      setVoucherApplied("");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setVoucherApplied("");
    setVoucherStatus(null);
    callPreview("");
  };

  const handleSaveAddr = async (data) => {
    try {
      if (editingAddr) {
        // Cập nhật
        await CheckoutService.updateAddress(editingAddr.id, data);
      } else {
        // Thêm mới
        await CheckoutService.addAddress(data);
      }
      setShowAddrForm(false);
      setEditingAddr(null);
      await fetchAddresses();
    } catch (e) {
      alert(e.response?.data?.message || e.message || "Lỗi khi lưu địa chỉ");
    }
  };

  const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

  // ── Đặt hàng ──
  const handleSubmit = async () => {
    if (!selectedAddressId) {
      setSubmitError("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }
    if (!isValid) {
      setSubmitError("Không có sản phẩm để đặt hàng.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Đảm bảo các field là đúng kiểu số theo yêu cầu của backend DTO
      const payload = {
        type: checkoutState.type,
        addressId: Number(selectedAddressId),
        paymentMethod,
        ...(checkoutState.type === "CART"
          ? { selectedItems: (checkoutState.selectedItems || []).map(Number) }
          : {
              variantId: Number(checkoutState.variantId),
              quantity: Number(checkoutState.quantity),
            }),
        ...(voucherApplied ? { voucherCode: voucherApplied } : {}),
      };
      console.log("[Checkout] Gửi payload:", JSON.stringify(payload, null, 2));
      const res = await CheckoutService.createOrder(payload);
      setSuccess({
        orderId: res.order?.OrderId,
        payUrl: res.payUrl,
      });
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        "Đặt hàng thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Redirect nếu không có state ──
  if (!checkoutState.type) {
    return (
      <div className="ck-shell">
        <div className="ck-empty-page">
          <div className="ck-empty-icon">🛒</div>
          <h2 className="ck-empty-title">
            Không có sản phẩm nào để thanh toán
          </h2>
          <p className="ck-empty-desc">Hãy thêm sản phẩm vào giỏ hàng trước.</p>
          <Link to="/cart" className="ck-back-btn">
            ← Về giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ck-shell">
      {/* SUCCESS OVERLAY */}
      {success && (
        <SuccessOverlay
          orderId={success.orderId}
          payUrl={success.payUrl}
          onGoOrders={() => navigate("/manage/Manageinvoice")}
          onGoHome={() => navigate("/")}
        />
      )}

      {/* TOPBAR */}
      <header className="ck-topbar">
        <Link to="/" className="ck-topbar-logo">
          SmartAI Fashion
        </Link>
        <Steps step={2} />
        <div style={{ width: 160 }} />
      </header>

      {/* BREADCRUMB */}
      <nav className="ck-bread" aria-label="Điều hướng">
        <Link to="/">Trang chủ</Link>
        <span className="ck-bread-sep">›</span>
        <Link to="/cart">Giỏ hàng</Link>
        <span className="ck-bread-sep">›</span>
        <span>Thanh toán</span>
      </nav>

      {/* MAIN */}
      <main className="ck-main" id="main-content">
        {/* LEFT COLUMN */}
        <div className="ck-left-col">
          <section className="ck-card ck-addr-section">
            <div className="ck-addr-header-row">
              <h2 className="ck-card-title">Địa chỉ giao hàng</h2>
              <button
                className="ck-addr-change-btn"
                onClick={() => setShowAddrSelect(true)}
              >
                Thay đổi
              </button>
            </div>

            {loadingAddr ? (
              <div className="ck-preview-loading">
                <div className="ck-btn-spin" />
                Đang tải địa chỉ...
              </div>
            ) : !selectedAddr ? (
              <div className="ck-addr-empty">
                <p>Bạn chưa có địa chỉ nào.</p>
                <button
                  className="ck-addr-link"
                  onClick={() => {
                    setEditingAddr(null);
                    setShowAddrForm(true);
                  }}
                >
                  ＋ Thêm địa chỉ mới
                </button>
              </div>
            ) : (
              <div className="ck-selected-addr">
                <div className="ck-sel-addr-icon">🏠</div>
                <div className="ck-sel-addr-info">
                  <div className="ck-sel-addr-name">
                    <strong>{selectedAddr.fullName}</strong>{" "}
                    {selectedAddr.phone}
                    {selectedAddr.isDefault && (
                      <span className="ck-sel-addr-badge">Mặc định</span>
                    )}
                  </div>
                  <div className="ck-sel-addr-text">
                    {selectedAddr.detailAddress}, {selectedAddr.ward},{" "}
                    {selectedAddr.district}, {selectedAddr.province}
                  </div>
                </div>
              </div>
            )}

            {/* MODALS */}
            <AddressSelectionModal
              isOpen={showAddrSelect}
              onClose={() => setShowAddrSelect(false)}
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onAddNew={() => {
                setEditingAddr(null);
                setShowAddrForm(true);
              }}
              onEdit={(addr) => {
                setEditingAddr(addr);
                setShowAddrForm(true);
              }}
            />

            <AddressFormModal
              isOpen={showAddrForm}
              onClose={() => setShowAddrForm(false)}
              onSave={handleSaveAddr}
              initialData={editingAddr}
            />
          </section>

          {/* ── 2. Sản phẩm ── */}
          <section className="ck-card" aria-labelledby="items-title">
            <h2 className="ck-card-title" id="items-title">
              Sản phẩm đặt hàng
              {previewData?.items?.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.8rem",
                    color: "var(--ck-text-muted)",
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {previewData.items.length} sản phẩm
                </span>
              )}
            </h2>

            {previewError && !previewLoading && (
              <div className="ck-error-banner" role="alert">
                ⚠️ {previewError}
              </div>
            )}

            {previewLoading && !previewData ? (
              <div className="ck-preview-loading">
                <div className="ck-btn-spin" />
                Đang tải thông tin sản phẩm...
              </div>
            ) : previewData?.items?.length > 0 ? (
              <div className="ck-items-list">
                {previewData.items.map((item, i) => (
                  <OrderItemRow key={item.variantId ?? i} item={item} />
                ))}
              </div>
            ) : !previewLoading ? (
              <div
                style={{
                  color: "var(--ck-text-muted)",
                  fontSize: "0.88rem",
                  padding: "16px 0",
                }}
              >
                Không có sản phẩm nào.
              </div>
            ) : null}
          </section>

          {/* ── 3. Voucher ── */}
          <section className="ck-card" aria-labelledby="voucher-title">
            <h2 className="ck-card-title" id="voucher-title">
              Mã giảm giá
            </h2>

            {voucherApplied ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.88rem", color: "var(--ck-green)" }}>
                  ✓ Đang áp dụng: <strong>{voucherApplied}</strong>
                </span>
                <button
                  onClick={handleRemoveVoucher}
                  style={{
                    background: "none",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    padding: "4px 12px",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                >
                  Xóa
                </button>
              </div>
            ) : (
              <div className="ck-voucher-row">
                <input
                  id="voucher-input"
                  type="text"
                  className="ck-voucher-input"
                  placeholder="Nhập mã voucher (VD: SALE10)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                  aria-label="Mã giảm giá"
                  autoComplete="off"
                />
                <button
                  className="ck-voucher-btn"
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim() || previewLoading}
                  aria-label="Áp dụng voucher"
                >
                  Áp dụng
                </button>
              </div>
            )}

            {voucherStatus && (
              <div
                className={`ck-voucher-status ${voucherStatus.ok ? "success" : "error"}`}
                role="status"
              >
                {voucherStatus.ok ? "✓" : "✗"} {voucherStatus.msg}
              </div>
            )}
          </section>

          {/* ── 4. Phương thức thanh toán ── */}
          <section className="ck-card" aria-labelledby="pay-title">
            <h2 className="ck-card-title" id="pay-title">
              Phương thức thanh toán
            </h2>

            <div
              className="ck-payment-options"
              role="radiogroup"
              aria-label="Chọn phương thức thanh toán"
            >
              {/* MOMO */}
              <div
                id="pay-momo"
                className="ck-payment-opt ck-pay-momo selected"
                role="radio"
                aria-checked={true}
              >
                <div className="ck-pay-icon">💜</div>
                <div>
                  <div className="ck-pay-label">Ví MoMo</div>
                  <div className="ck-pay-desc">Thanh toán nhanh qua MoMo</div>
                </div>
              </div>
            </div>

            {paymentMethod === "MOMO" && (
              <div className="ck-momo-redirect-box">
                💜 Sau khi đặt hàng, bạn sẽ được chuyển đến cổng thanh toán MoMo
                để hoàn tất.
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN – SUMMARY */}
        <div className="ck-summary-panel">
          <div className="ck-summary-card">
            <h2 className="ck-summary-title">Tóm tắt đơn hàng</h2>

            {previewLoading ? (
              <SummarySkeleton />
            ) : previewData ? (
              <>
                <div className="ck-summary-rows">
                  <div className="ck-sum-row">
                    <span className="label">Tạm tính</span>
                    <span className="value">
                      {formatVND(previewData.total)}
                    </span>
                  </div>
                  <div className="ck-sum-row discount">
                    <span className="label">Giảm giá</span>
                    <span className="value">
                      - {formatVND(previewData.discount)}
                    </span>
                  </div>
                  <div className="ck-sum-row shipping">
                    <span className="label">Phí vận chuyển</span>
                    <span className="value">
                      {formatVND(previewData.shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="ck-sum-divider" />

                <div className="ck-sum-total-row">
                  <span className="ck-sum-total-label">Tổng thanh toán</span>
                  <div className="ck-sum-total-price">
                    <span className="ck-sum-total-amount">
                      {formatVND(previewData.finalTotal)}
                    </span>
                    <span className="ck-sum-total-vat">(Đã bao gồm VAT)</span>
                  </div>
                </div>
              </>
            ) : previewError ? (
              <div
                className="ck-error-banner"
                style={{ marginBottom: 20 }}
                role="alert"
              >
                ⚠️ {previewError}
              </div>
            ) : null}

            {/* Lỗi submit */}
            {submitError && (
              <div className="ck-error-banner" role="alert">
                ❌ {submitError}
              </div>
            )}

            {/* Nút đặt hàng */}
            <button
              id="btn-checkout"
              className={`ck-checkout-btn${submitting ? " loading" : ""}`}
              onClick={handleSubmit}
              disabled={
                submitting ||
                previewLoading ||
                !selectedAddressId ||
                !previewData
              }
              aria-label="Đặt hàng ngay"
            >
              <span className="ck-btn-inner">
                {submitting ? (
                  <>
                    <span className="ck-btn-spin" />
                    Đang đặt hàng...
                  </>
                ) : (
                  <>💜 Đặt & Thanh toán MoMo</>
                )}
              </span>
            </button>

            <div className="ck-secure-note" aria-label="Thông tin bảo mật">
              🔒 Thông tin của bạn được bảo mật tuyệt đối
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
