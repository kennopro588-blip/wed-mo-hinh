import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { addPoints } from './LoyaltyPoints';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentInfo, setPaymentInfo] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [pointsEarned, setPointsEarned] = useState(0);

    useEffect(() => {
        // Parse VNPay return params from URL
        const params = new URLSearchParams(location.search);
        const responseCode = params.get('vnp_ResponseCode');
        const transactionNo = params.get('vnp_TransactionNo');
        const amount = params.get('vnp_Amount');
        const orderInfo = params.get('vnp_OrderInfo');
        const bankCode = params.get('vnp_BankCode');
        const payDate = params.get('vnp_PayDate');

        const success = responseCode === '00';
        setIsSuccess(success);
        setPaymentInfo({
            responseCode,
            transactionNo,
            amount: amount ? parseInt(amount) / 100 : 0,
            orderInfo,
            bankCode,
            payDate,
        });

        // Save order to admin panel if payment succeeded
        if (success && transactionNo) {
            const pendingOrder = JSON.parse(sessionStorage.getItem('pendingOrder') || '{}');
            const newOrder = {
                id: `VNP${transactionNo}`,
                userId: pendingOrder.userId || 'guest',
                customerName: pendingOrder.formData?.fullName || 'Khách hàng',
                phone: pendingOrder.formData?.phone || '',
                address: pendingOrder.formData?.address || '',
                items: pendingOrder.cart || [],
                total: amount ? parseInt(amount) / 100 : 0,
                paymentMethod: 'vnpay',
                transactionNo,
                bankCode,
                status: 'CONFIRMED',
                date: new Date().toLocaleDateString('vi-VN'),
                couponUsed: pendingOrder.coupon || null
            };
            const existing = JSON.parse(localStorage.getItem('adminOrders') || '[]');
            // Avoid duplicates
            if (!existing.find(o => o.id === newOrder.id)) {
                localStorage.setItem('adminOrders', JSON.stringify([newOrder, ...existing]));
            }

            // ─── Add Loyalty Points ───
            const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (savedUser) {
              const earnedPts = addPoints(
                savedUser.id || savedUser.userName,
                newOrder.total,
                `Thanh toán đơn hàng #VNP${transactionNo}`
              );
              if (earnedPts > 0) {
                setPointsEarned(earnedPts);
              }
            }
            // ────────────────────────

            // ─── Deduct stock for each purchased item ───
            const overrides = JSON.parse(localStorage.getItem('stockOverrides') || '{}');
            (pendingOrder.cart || []).forEach(item => {
                const key = `product_${item.id}`;
                const currentStock = overrides[key] !== undefined ? overrides[key] : (item.availability || 0);
                const qty = item.quantity || 1;
                overrides[key] = Math.max(0, currentStock - qty);
            });
            localStorage.setItem('stockOverrides', JSON.stringify(overrides));
            // ───────────────────────────────────────────

            sessionStorage.removeItem('pendingOrder');

        }
    }, [location]);


    // Auto-redirect countdown after success
    useEffect(() => {
        if (!isSuccess) return;
        if (countdown <= 0) {
            navigate('/');
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, navigate]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length < 14) return '';
        return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(0, 4)} ${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}:${dateStr.slice(12, 14)}`;
    };

    if (isSuccess) {
        return (
            <div className="ps-page">
                <div className="ps-card ps-success">
                    {/* Animated checkmark */}
                    <div className="ps-icon-wrapper">
                        <div className="ps-check-circle">
                            <svg className="ps-check-svg" viewBox="0 0 52 52">
                                <circle className="ps-check-circle-bg" cx="26" cy="26" r="25" fill="none" />
                                <path className="ps-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="ps-title success">THANH TOÁN THÀNH CÔNG</h1>
                    <p className="ps-subtitle">Cảm ơn bạn đã mua sắm tại PREMIUM STORE!</p>

                    <div className="ps-info-grid">
                        <div className="ps-info-item">
                            <span className="label">Mã giao dịch</span>
                            <span className="value highlight">#{paymentInfo.transactionNo}</span>
                        </div>
                        <div className="ps-info-item">
                            <span className="label">Số tiền</span>
                            <span className="value gold">{formatAmount(paymentInfo.amount)}</span>
                        </div>
                        <div className="ps-info-item">
                            <span className="label">Ngân hàng</span>
                            <span className="value">{paymentInfo.bankCode}</span>
                        </div>
                        <div className="ps-info-item">
                            <span className="label">Thời gian</span>
                            <span className="value">{formatDate(paymentInfo.payDate)}</span>
                        </div>
                        <div className="ps-info-item full">
                            <span className="label">Nội dung</span>
                            <span className="value">{paymentInfo.orderInfo}</span>
                        </div>
                    </div>

                    <div className="ps-status-badge success">
                        ✓ Đơn hàng đang được xử lý
                    </div>

                    {pointsEarned > 0 && (
                      <div style={{ background: 'linear-gradient(135deg, #d4af37, #f9e07e)', borderRadius: '12px', padding: '15px', margin: '15px 0', color: '#5a3e00' }}>
                        <strong>⭐ Bạn vừa được cộng +{pointsEarned} điểm thưởng!</strong><br/>
                        <small>Xem điểm của bạn tại trang <a href="/loyalty" style={{color:'#5a3e00'}}>Loyalty Points</a></small>
                      </div>
                    )}

                    <p className="ps-countdown">
                        Tự động chuyển về trang chủ sau <strong>{countdown}s</strong>
                    </p>

                    <div className="ps-actions">
                        <button className="ps-btn-primary" onClick={() => navigate('/')}>
                            🏠 Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Failed
    return (
        <div className="ps-page">
            <div className="ps-card ps-failed">
                <div className="ps-icon-wrapper">
                    <div className="ps-fail-circle">✕</div>
                </div>

                <h1 className="ps-title failed">THANH TOÁN THẤT BẠI</h1>
                <p className="ps-subtitle">
                    {paymentInfo.responseCode === '24'
                        ? 'Bạn đã hủy giao dịch.'
                        : `Giao dịch không thành công (Mã lỗi: ${paymentInfo.responseCode || 'N/A'})`}
                </p>

                <div className="ps-actions">
                    <button className="ps-btn-secondary" onClick={() => navigate(-2)}>
                        ← Thử lại
                    </button>
                    <button className="ps-btn-primary" onClick={() => navigate('/')}>
                        🏠 Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
