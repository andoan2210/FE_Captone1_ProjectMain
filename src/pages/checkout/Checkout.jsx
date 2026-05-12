
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
        <div className="ck-item-name">
          {item.productName}
          {item.isVoucherApplied && (
            <span className="ck-item-voucher-badge">
              Voucher {item.voucherDiscountLabel}
            </span>
          )}
        </div>
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

/** Modal chọn voucher của shop */
function VoucherPickerModal({ isOpen, onClose, storeId, storeName, onSelect, checkoutItems }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !storeId) return;
    setLoading(true);
    setError(null);
    CheckoutService.getVouchersByStore(storeId)
      .then((data) => {
        setVouchers(data.vouchers || []);
      })
      .catch((e) => {
        console.error("Lỗi tải voucher:", e);
        setError("Không thể tải danh sách mã giảm giá");
      })
      .finally(() => setLoading(false));
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Lấy danh sách productId đang có trong checkout
  const checkoutProductIds = (checkoutItems || []).map(item => item.productId);

  return (
    <div className="ck-modal-overlay" onClick={onClose}>
      <div
        className="ck-modal-box ck-voucher-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ck-modal-header">
          <h3>🎟️ Mã giảm giá của {storeName}</h3>
          <button className="ck-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ck-modal-body ck-voucher-picker-body">
          {loading ? (
            <div className="ck-voucher-picker-loading">
              <div className="ck-btn-spin" style={{ borderTopColor: "var(--ck-primary)", borderColor: "#e2e8f0", width: 28, height: 28 }} />
              <span>Đang tải mã giảm giá...</span>
            </div>
          ) : error ? (
            <div className="ck-voucher-picker-empty">
              <div className="ck-voucher-picker-empty-icon"></div>
              <p>{error}</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="ck-voucher-picker-empty">
              <div className="ck-voucher-picker-empty-icon">🏷️</div>
              <p>Shop hiện chưa có mã giảm giá nào</p>
            </div>
          ) : (
            <div className="ck-voucher-picker-list">
              {vouchers.map((v) => {
                // Kiểm tra voucher SPECIFIC có khớp sản phẩm trong giỏ hàng không
                const isSpecific = v.applyType === "SPECIFIC";
                const applicableProducts = v.applicableProducts || [];
                const matchingProducts = isSpecific
                  ? applicableProducts.filter(p => checkoutProductIds.includes(p.productId))
                  : [];
                const hasMatchInCart = !isSpecific || matchingProducts.length > 0;

                return (
                  <div key={v.voucherId} className={`ck-voucher-card ${!hasMatchInCart ? "ck-voucher-card-disabled" : ""}`}>
                    <div className="ck-voucher-card-left">
                      <div className="ck-voucher-card-discount">
                        <span className="ck-voucher-card-percent">{v.discountPercent}%</span>
                        <span className="ck-voucher-card-label">GIẢM</span>
                      </div>
                    </div>
                    <div className="ck-voucher-card-right">
                      <div className="ck-voucher-card-code">{v.code}</div>
                      <div className="ck-voucher-card-details">
                        {v.minOrderValue > 0 && (
                          <span>Đơn tối thiểu: {formatVND(v.minOrderValue)}</span>
                        )}
                        {v.maxDiscountValue > 0 && (
                          <span>Giảm tối đa: {formatVND(v.maxDiscountValue)}</span>
                        )}
                        {isSpecific && applicableProducts.length > 0 && (
                          <div className="ck-voucher-products-section">
                            <span className="ck-voucher-products-title">
                              Áp dụng cho:
                            </span>
                            <ul className="ck-voucher-products-list">
                              {applicableProducts.map(p => {
                                const inCart = checkoutProductIds.includes(p.productId);
                                return (
                                  <li key={p.productId} className={inCart ? "ck-voucher-product-match" : "ck-voucher-product-nomatch"}>
                                    {inCart ? "✅" : "⬜"} {p.productName}
                                    {inCart && <span className="ck-voucher-in-cart-badge">Trong đơn</span>}
                                  </li>
                                );
                              })}
                            </ul>
                            {!hasMatchInCart && (
                              <div className="ck-voucher-no-match-warning">
                                Đơn hàng không có sản phẩm phù hợp
                              </div>
                            )}
                          </div>
                        )}
                        {!isSpecific && (
                          <span className="ck-voucher-card-all">Áp dụng cho tất cả sản phẩm</span>
                        )}
                      </div>
                      <div className="ck-voucher-card-footer">
                        <span className="ck-voucher-card-expiry">
                          HSD: {formatDate(v.expiredDate)}
                        </span>
                        <span className="ck-voucher-card-qty">Còn {v.quantity}</span>
                      </div>
                    </div>
                    <button
                      className="ck-voucher-card-apply-btn"
                      disabled={!hasMatchInCart}
                      title={!hasMatchInCart ? "Không có sản phẩm phù hợp trong đơn hàng" : ""}
                      onClick={() => {
                        onSelect(v.code);
                        onClose();
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="ck-modal-footer" style={{ padding: "12px 24px" }}>
          <div className="ck-modal-actions" style={{ justifyContent: "center" }}>
            <button className="ck-modal-btn-cancel" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
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

        </div>
        <h2 className="ck-success-title">Đặt hàng thành công!</h2>
        <p className="ck-success-msg">
          Cảm ơn bạn đã tin tưởng SmartAI Fashion. Chúng tôi sẽ xử lý đơn hàng
          của bạn ngay.

        </p>
        {orderId && !Array.isArray(orderId) && (
          <div className="ck-success-order-id">
            Mã đơn hàng: <strong>#{orderId}</strong>
          </div>
        )}
        {Array.isArray(orderId) && orderId.length > 0 && (
          <div className="ck-success-order-ids-list">
            <p>Mã đơn hàng của bạn:</p>
            <div className="ck-success-order-ids-tags">
              {orderId.map((id) => (
                <span key={id} className="ck-success-id-tag">#{id}</span>
              ))}
            </div>
          </div>
        )}
        {hasMomo && (
          <div className="ck-success-momo-notice">
            Đang chuyển đến cổng thanh toán MoMo trong 3 giây...
          </div>
        )}
        {!hasMomo && (
          <div className="ck-success-actions">
            <button className="ck-btn-orders" onClick={onGoOrders}>
              Xem Đơn Mua
            </button>
            <button className="ck-btn-home" onClick={onGoHome}>
              Về trang chủ
            </button>
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
  // Voucher cho từng shop: { [storeId]: { code: string, applied: string, status: { ok, msg } } }
  const [storeVouchers, setStoreVouchers] = useState({});
  // State cho Voucher Picker Modal: { storeId, storeName } hoặc null
  const [voucherPickerStore, setVoucherPickerStore] = useState(null);

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

  const appliedVouchers = useMemo(() => {
    const obj = {};
    Object.entries(storeVouchers).forEach(([sId, v]) => {
      if (v.applied) obj[sId] = v.applied;
    });
    return obj;
  }, [storeVouchers]);

  const callPreview = useCallback(
    async (vouchersMap = {}) => {
      if (!isValid) return;
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const storeVouchersList = Object.entries(vouchersMap)
          .map(([sId, code]) => ({ storeId: Number(sId), code }));

        const params = {
          type: checkoutState.type,
          ...(checkoutState.type === "CART"
            ? { selectedItems: checkoutState.selectedItems }
            : {
              variantId: checkoutState.variantId,
              quantity: checkoutState.quantity,
            }),
          storeVouchers: storeVouchersList,
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
    callPreview(appliedVouchers);
  }, [callPreview, appliedVouchers]);

  // ── Áp dụng voucher cho từng shop ──
  const handleApplyVoucher = async (storeId, codeOverride) => {
    const code = (codeOverride || storeVouchers[storeId]?.code || "").trim();
    if (!code) return;

    setPreviewLoading(true);
    try {
      const newVouchers = {
        ...storeVouchers,
        [storeId]: { ...storeVouchers[storeId], applied: code, status: null }
      };

      const storeVouchersList = Object.entries(newVouchers)
        .filter(([_, v]) => v.applied)
        .map(([sId, v]) => ({ storeId: Number(sId), code: v.applied }));

      const params = {
        type: checkoutState.type,
        ...(checkoutState.type === "CART"
          ? { selectedItems: checkoutState.selectedItems }
          : {
            variantId: checkoutState.variantId,
            quantity: checkoutState.quantity,
          }),
        storeVouchers: storeVouchersList,
      };

      const data = await CheckoutService.preview(params);
      setPreviewData(data);

      // Kiểm tra xem voucher có thực sự giảm giá không
      const storeGroup = data.storeGroups?.find(g => g.storeId === storeId);
      const oldGroup = previewData?.storeGroups?.find(g => g.storeId === storeId);
      const actualDiscount = (data.discount || 0) - (previewData?.discount || 0);

      if (actualDiscount <= 0 && (data.discount || 0) === 0) {
        // Voucher không áp dụng được (giảm giá = 0)
        setStoreVouchers({
          ...storeVouchers,
          [storeId]: {
            ...storeVouchers[storeId],
            code: code,
            applied: "",
            status: { ok: false, msg: "Mã giảm giá không áp dụng được cho sản phẩm trong đơn hàng này" }
          }
        });
      } else {
        setStoreVouchers({
          ...newVouchers,
          [storeId]: {
            ...newVouchers[storeId],
            status: { ok: true, msg: "Áp dụng thành công!" }
          }
        });
      }
    } catch (e) {
      let msg = e.response?.data?.message || e.message || "Voucher không hợp lệ";

      // Việt hóa các lỗi hệ thống hoặc lỗi chung
      if (msg === "Internal server error" || e.response?.status === 500) {
        msg = "Mã giảm giá không áp dụng được cho cửa hàng này hoặc đã hết hạn";
      }

      setStoreVouchers({
        ...storeVouchers,
        [storeId]: {
          ...storeVouchers[storeId],
          applied: "",
          status: { ok: false, msg }
        }
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRemoveVoucher = (storeId) => {
    const newVouchers = {
      ...storeVouchers,
      [storeId]: { code: "", applied: "", status: null }
    };
    setStoreVouchers(newVouchers);
    // callPreview sẽ tự chạy qua useEffect
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
    const storeVouchersList = Object.entries(storeVouchers)
      .filter(([_, v]) => v.applied)
      .map(([sId, v]) => ({ storeId: Number(sId), code: v.applied }));

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
        storeVouchers: storeVouchersList,
      };
      console.log("[Checkout] Gửi payload:", JSON.stringify(payload, null, 2));

      const res = await CheckoutService.createOrder(payload);

      // Backend trả về res.orders là mảng các { order, payment }
      const orderIds = res.orders?.map(o => o.order.OrderId) || (res.order?.OrderId ? [res.order.OrderId] : []);

      setSuccess({
        orderId: orderIds.length > 1 ? orderIds : orderIds[0],
        payUrl: res.payUrl,
      });
    } catch (e) {
      let msg =
        e.response?.data?.message ||
        e.message ||
        "Đặt hàng thất bại. Vui lòng thử lại.";

      if (msg === "Internal server error" || e.response?.status === 500) {
        msg = "Có lỗi xảy ra trong quá trình xử lý đơn hàng. Vui lòng thử lại sau.";
      }

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
            ) : previewData?.storeGroups?.length > 0 ? (
              <div className="ck-items-list">
                {previewData.storeGroups.map((group, i) => (
                  <div key={group.storeId || i} className="ck-shop-group-card">
                    <div className="ck-shop-group-header">
                      <div className="ck-shop-info">
                        {group.storeLogo ? (
                          <img
                            src={group.storeLogo}
                            alt={group.storeName}
                            className="ck-shop-logo"
                          />
                        ) : (
                          <div className="ck-shop-logo-placeholder">🏬</div>
                        )}
                        <span className="ck-shop-name">{group.storeName}</span>
                      </div>
                      <Link to={`/shop/${group.storeId}`} className="ck-shop-link">
                        Xem Shop
                      </Link>
                    </div>

                    <div className="ck-shop-group-items">
                      {group.items.map((item, idx) => (
                        <OrderItemRow key={item.variantId ?? idx} item={item} />
                      ))}
                    </div>

                    <div className="ck-shop-group-footer">
                      <div className="ck-shop-shipping-row">
                        <span className="ck-shipping-label">
                          Phương thức vận chuyển:
                        </span>
                        <div className="ck-shipping-method">
                          <strong>Nhanh</strong>
                          <div className="ck-shipping-fee">30.000đ</div>
                        </div>
                      </div>

                      {/* Voucher cho Shop này */}
                      <div className="ck-shop-voucher-box">
                        {storeVouchers[group.storeId]?.applied ? (
                          <div className="ck-shop-voucher-applied">
                            <span>Mã giảm giá shop: <strong>{storeVouchers[group.storeId].applied}</strong></span>
                            <button onClick={() => handleRemoveVoucher(group.storeId)}>Gỡ</button>
                          </div>
                        ) : (
                          <>
                            <div className="ck-shop-voucher-input-row">
                              <input
                                type="text"
                                placeholder="Nhập hoặc chọn mã giảm giá"
                                value={storeVouchers[group.storeId]?.code || ""}
                                onChange={(e) => setStoreVouchers({
                                  ...storeVouchers,
                                  [group.storeId]: { ...storeVouchers[group.storeId], code: e.target.value.toUpperCase() }
                                })}
                              />
                              <button
                                className="ck-voucher-pick-btn"
                                onClick={() => setVoucherPickerStore({ storeId: group.storeId, storeName: group.storeName })}
                                title="Chọn mã giảm giá"
                              >
                                🎟️ Chọn mã
                              </button>
                              <button
                                onClick={() => handleApplyVoucher(group.storeId)}
                                disabled={!storeVouchers[group.storeId]?.code || previewLoading}
                              >
                                Áp dụng
                              </button>
                            </div>
                          </>
                        )}
                        {storeVouchers[group.storeId]?.status && (
                          <div className={`ck-shop-voucher-status ${storeVouchers[group.storeId].status.ok ? 'success' : 'error'}`}>
                            {storeVouchers[group.storeId].status.msg}
                          </div>
                        )}
                      </div>

                      {/* Voucher Picker Modal */}
                      <VoucherPickerModal
                        isOpen={voucherPickerStore?.storeId === group.storeId}
                        onClose={() => setVoucherPickerStore(null)}
                        storeId={group.storeId}
                        storeName={group.storeName}
                        checkoutItems={group.items}
                        onSelect={(code) => {
                          setStoreVouchers({
                            ...storeVouchers,
                            [group.storeId]: { ...storeVouchers[group.storeId], code }
                          });
                          // Áp dụng ngay với code truyền trực tiếp (tránh state batching)
                          handleApplyVoucher(group.storeId, code);
                        }}
                      />

                      <div className="ck-shop-note-row">
                        <input
                          type="text"
                          className="ck-shop-note-input"
                          placeholder="Lưu ý cho Người bán..."
                        />
                      </div>

                      <div className="ck-shop-total-row">
                        Tổng số tiền ({group.items.length} sản phẩm):{" "}
                        <span className="ck-shop-total-price">
                          {formatVND(group.shopTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
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

          {/* Voucher tổng đã bị loại bỏ theo yêu cầu */}

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
                <div className="ck-pay-icon">
                  <img src="https://projectcapstone1-public.s3.ap-southeast-2.amazonaws.com/products/thumbnail/1776135360618-MoMo_Logo_App.svg.png" alt="MoMo" style={{ width: 28, height: 28, borderRadius: 4 }} />
                </div>
                <div>
                  <div className="ck-pay-label">Ví MoMo</div>
                  <div className="ck-pay-desc">Thanh toán nhanh qua MoMo</div>
                </div>
              </div>
            </div>


            {paymentMethod === "MOMO" && (
              <div className="ck-momo-redirect-box">
                <img src="https://projectcapstone1-public.s3.ap-southeast-2.amazonaws.com/products/thumbnail/1776135360618-MoMo_Logo_App.svg.png" alt="MoMo" style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 8, borderRadius: 4 }} />
                Sau khi đặt hàng, bạn sẽ được chuyển đến cổng thanh toán MoMo
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

                  <><img src="https://projectcapstone1-public.s3.ap-southeast-2.amazonaws.com/products/thumbnail/1776135360618-MoMo_Logo_App.svg.png" alt="MoMo" style={{ width: 22, height: 22, verticalAlign: 'middle', marginRight: 8, borderRadius: 4 }} /> Đặt & Thanh toán MoMo</>

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
