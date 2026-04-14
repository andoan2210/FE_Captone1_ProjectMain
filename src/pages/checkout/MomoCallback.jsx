import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import ShopOrderService from '../../services/ShopOrderService';


/**
 * Trang xử lý callback từ MoMo sau khi thanh toán.
 * MoMo redirect về: /payment/callback?resultCode=0&orderId=...&amount=...
 *
 * resultCode = 0  → Thanh toán thành công
 * resultCode != 0 → Thanh toán thất bại / bị huỷ
 */
export default function MomoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Đọc các tham số MoMo trả về
  const resultCode = searchParams.get('resultCode');
  const orderId = searchParams.get('orderId');     // dạng "CPS_13_..."
  const amount = searchParams.get('amount');
  const message = searchParams.get('message');
  const isSuccess = resultCode === '0';

  useEffect(() => {
    // 1. Phân tách lấy OrderId từ chuỗi "CPS_21_..." của MoMo
    const cleanId = orderId && orderId.includes('_') ? orderId.split('_')[1] : orderId;


    // 2. Đồng bộ trạng thái với Backend

    const syncPaymentWithBE = async () => {
      if (isSuccess && cleanId) {
        try {
          console.log(`[MoMo] Đang yêu cầu BE kiểm tra trạng thái cho đơn hàng ID: ${cleanId}`);

          await ShopOrderService.verifyMomoPayment(cleanId, resultCode);

        } catch (err) {
          console.error("Lỗi khi đồng bộ với Backend:", err);
        }
      }
    };

    syncPaymentWithBE();

    // 3. Đếm ngược rồi redirect
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/manage/Manageinvoice', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        {/* ICON */}
        <div style={styles.iconWrap}>
          {isSuccess ? (
            <span style={{ ...styles.icon, color: '#10b981' }}></span>
          ) : (
            <span style={{ ...styles.icon, color: '#ef4444' }}></span>
          )}
        </div>

        {/* TIÊU ĐỀ */}
        <h1 style={{ ...styles.title, color: isSuccess ? '#10b981' : '#ef4444' }}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>

        {/* CHI TIẾT */}
        <p style={styles.sub}>
          {isSuccess
            ? 'MoMo đã xác nhận giao dịch của bạn. Đơn hàng đang được xử lý.'
            : (message || 'Giao dịch không thành công hoặc đã bị huỷ.')}
        </p>

        {orderId && (
          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Mã đơn hàng</span>
              <span style={styles.infoValue}>{orderId}</span>
            </div>
            {amount && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Số tiền</span>
                <span style={{ ...styles.infoValue, color: '#0061ff', fontWeight: 700 }}>
                  {new Intl.NumberFormat('vi-VN').format(Number(amount))}đ
                </span>
              </div>
            )}
          </div>
        )}

        {/* COUNTDOWN */}
        <p style={styles.countdown}>
          Tự động chuyển về Đơn Mua sau <strong style={{ color: '#0061ff' }}>{countdown}s</strong>
        </p>

        {/* NÚT */}
        <button
          onClick={() => navigate('/manage/Manageinvoice', { replace: true })}
          style={styles.btn}
        >
          Xem Đơn Mua
        </button>

        {isSuccess && (
          <button
            onClick={() => navigate('/', { replace: true })}
            style={styles.btnSecondary}
          >
            Về trang chủ
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    background: '#f8faff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '52px 40px',
    textAlign: 'center',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,97,255,0.12)',
    border: '1px solid rgba(0,97,255,0.08)',
  },
  iconWrap: {
    marginBottom: '16px',
  },
  icon: {
    fontSize: '4rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    margin: '0 0 10px',
  },
  sub: {
    color: '#64748b',
    fontSize: '0.92rem',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  infoBox: {
    background: '#f8faff',
    border: '1px solid rgba(0,97,255,0.12)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    fontSize: '0.88rem',
    borderBottom: '1px solid #f1f1f1',
  },
  infoLabel: { color: '#64748b' },
  infoValue: { fontWeight: 600, color: '#1e293b' },
  countdown: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '20px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#0061ff',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: '10px',
    fontFamily: 'inherit',
    boxShadow: '0 6px 20px rgba(0,97,255,0.25)',
  },
  btnSecondary: {
    width: '100%',
    padding: '12px',
    background: 'none',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
