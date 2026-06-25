import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchOrderStatus } from '../services/apiService';
import { createVNPayPaymentUrl } from '../services/vnpayService';
import './PaymentPage.css';



const PaymentPage = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { finalTotal } = location.state || { finalTotal: 0 };

    const [status, setStatus] = useState('PENDING'); // PENDING, PAID, FAILED
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    // VNPay Sandbox Test Card
    const testCard = {
        bank: 'NCB',
        cardNumber: '9704198526191432198',
        cardHolder: 'NGUYEN VAN A',
        issueDate: '07/15',
        otp: '123456'
    };

    const handleVNPayRedirect = async () => {
        try {
            const orderInfo = `Thanh toan don hang ${orderId}`;
            const paymentUrl = await createVNPayPaymentUrl(finalTotal, orderInfo);
            window.location.href = paymentUrl;
        } catch (error) {
            console.error('VNPay error:', error);
            alert('Lỗi khi tạo liên kết thanh toán VNPay. Vui lòng thử lại.');
        }
    };



    useEffect(() => {
        // Polling for payment status
        const interval = setInterval(async () => {
            try {
                const currentStatus = await fetchOrderStatus(orderId);
                if (currentStatus === 'PAID') {
                    setStatus('PAID');
                    clearInterval(interval);
                } else if (currentStatus === 'FAILED') {
                    setStatus('FAILED');
                    clearInterval(interval);
                }
            } catch (error) {
                console.error("Error polling status:", error);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (status === 'PAID') {
        return (
            <div className="payment-container success">
                <div className="payment-card animate-in">
                    <div className="status-icon success">✓</div>
                    <h2>THANH TOÁN THÀNH CÔNG</h2>
                    <p>Cảm ơn bạn! Đơn hàng <strong>#ORD-{orderId}</strong> của bạn đã được thanh toán.</p>
                    <p>Chúng tôi sẽ sớm giao hàng cho bạn.</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>Quay về trang chủ</button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>THANH TOÁN ĐƠN HÀNG</h1>
                    <p className="order-id">Mã đơn hàng: #ORD-{orderId}</p>
                </div>

                <div className="payment-main">
                    <div className="summary-section">
                        <h3>TÓM TẮT ĐƠN HÀNG</h3>
                        <div className="amount-display">
                            <span className="label">Tổng cộng:</span>
                            <span className="value">{finalTotal?.toLocaleString()} VNĐ</span>
                        </div>
                        <button className="vnpay-btn" onClick={handleVNPayRedirect}>
                            <span className="vnpay-logo">V</span> THANH TOÁN QUA VNPAY
                        </button>
                    </div>

                    <div className="test-info-section">
                        <div className="test-badge">MÔI TRƯỜNG THỬ NGHIỆM (SANDBOX)</div>
                        <h3>THÔNG TIN THẺ TEST</h3>
                        <p>Sử dụng thông tin dưới đây để thực hiện thanh toán:</p>
                        <div className="test-card-grid">
                            <div className="test-item">
                                <span className="label">Ngân hàng</span>
                                <span className="value">{testCard.bank}</span>
                            </div>
                            <div className="test-item">
                                <span className="label">Số thẻ</span>
                                <span className="value highlight">{testCard.cardNumber}</span>
                            </div>
                            <div className="test-item">
                                <span className="label">Chủ thẻ</span>
                                <span className="value">{testCard.cardHolder}</span>
                            </div>
                            <div className="test-item">
                                <span className="label">Ngày phát hành</span>
                                <span className="value">{testCard.issueDate}</span>
                            </div>
                            <div className="test-item">
                                <span className="label">Mã OTP</span>
                                <span className="value highlight">{testCard.otp}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="payment-footer">
                    <p className="footer-note">Sau khi nhấn nút, bạn sẽ được chuyển đến cổng thanh toán VNPay.</p>
                </div>

            </div>
        </div>
    );
};

export default PaymentPage;
