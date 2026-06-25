import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './UserOrders.css';

const UserOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      const allOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const myOrders = allOrders.filter(o => o.userId === user.userName || o.userId === user.id);
      setOrders(myOrders);
    }
  }, [user]);

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      const allOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const orderToCancel = allOrders.find(o => o.id === orderId);
      
      const updatedOrders = allOrders.map(o => 
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o
      );
      localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
      
      // Cập nhật lại state để giao diện thay đổi ngay lập tức
      const myUpdatedOrders = updatedOrders.filter(o => o.userId === user.userName || o.userId === user.id);
      setOrders(myUpdatedOrders);

      // Hoàn lại mã giảm giá nếu có
      let couponRefundMsg = '';
      if (orderToCancel && orderToCancel.couponUsed) {
        const userKey = `userCoupons_${user ? (user.id || user.userName) : 'guest'}`;
        const personalCoupons = JSON.parse(localStorage.getItem(userKey) || '[]');
        
        // Trừ số lượt sử dụng trong kho tổng
        const globalCodes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
        const updatedCodes = globalCodes.map(c => 
          c.code === orderToCancel.couponUsed ? { ...c, used: Math.max(0, (c.used || 1) - 1) } : c
        );
        localStorage.setItem('discountCodes', JSON.stringify(updatedCodes));

        // Trả lại vào Kho Voucher Của Tôi
        if (!personalCoupons.find(c => c.code === orderToCancel.couponUsed)) {
          personalCoupons.unshift({
            code: orderToCancel.couponUsed,
            desc: 'Hoàn lại từ đơn hàng đã hủy',
            date: new Date().toLocaleDateString('vi-VN')
          });
          localStorage.setItem(userKey, JSON.stringify(personalCoupons));
        }
        couponRefundMsg = `\n🎟️ Mã giảm giá [${orderToCancel.couponUsed}] đã được hoàn lại vào Kho Voucher của bạn.`;
      }

      // Thông báo hoàn tiền
      if (orderToCancel && orderToCancel.paymentMethod === 'vnpay') {
        alert(`✅ Đã hủy đơn hàng!\n💰 Số tiền ${(orderToCancel.total * 1000).toLocaleString()} VNĐ sẽ được hoàn trả về tài khoản VNPay của bạn trong vòng 24 giờ làm việc.${couponRefundMsg}`);
      } else {
        alert(`✅ Đã hủy đơn hàng thành công! Đơn hàng thanh toán khi nhận hàng (COD) không phát sinh hoàn tiền.${couponRefundMsg}`);
      }
    }
  };

  const handleRemoveOrder = (orderId) => {
    if (window.confirm('Bạn có muốn xóa đơn hàng này khỏi lịch sử mua hàng không?')) {
      const allOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const updatedOrders = allOrders.filter(o => o.id !== orderId);
      localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
      
      const myUpdatedOrders = updatedOrders.filter(o => o.userId === user.userName || o.userId === user.id);
      setOrders(myUpdatedOrders);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="order-status badge-pending">⏳ Chờ xử lý</span>;
      case 'CONFIRMED': return <span className="order-status badge-confirmed">✓ Đã xác nhận</span>;
      case 'SHIPPING': return <span className="order-status badge-shipping">🚚 Đang giao</span>;
      case 'DELIVERED': return <span className="order-status badge-delivered">📦 Đã nhận</span>;
      case 'CANCELLED': return <span className="order-status badge-cancelled">✕ Đã hủy</span>;
      default: return <span className="order-status">{status}</span>;
    }
  };

  return (
    <div className="user-orders-page">
      <div className="user-orders-container">
        <h2>📦 Quản Lý Đơn Hàng Của Tôi</h2>
        <p className="subtitle">Theo dõi trạng thái các đơn hàng bạn đã mua tại PREMIUM STORE.</p>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">🛒</div>
            <h3>Bạn chưa có đơn hàng nào</h3>
            <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
            <Link to="/" className="btn-shop-now">MUA SẮM NGAY</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Mã ĐH: {order.id}</span>
                    <span className="order-date">📅 Ngày đặt: {order.date}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <img src={item.imageUrl} alt={item.productName} className="order-item-img" />
                      <div className="order-item-info">
                        <h4>{item.productName}</h4>
                        <p>Loại: {item.selectedSize || 'Mặc định'}</p>
                        <p>Số lượng: x{item.quantity || 1}</p>
                      </div>
                      <div className="order-item-price">
                        {((item.price - (item.price * item.discountPercent / 100)) * (item.quantity || 1) * 1000).toLocaleString()} VNĐ
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-meta">
                    <p><strong>Thanh toán:</strong> {order.paymentMethod === 'vnpay' ? 'Thẻ / VNPay' : 'Thanh toán khi nhận hàng (COD)'}</p>
                    <p><strong>Giao đến:</strong> {order.customerName} - {order.phone} | {order.address}</p>
                  </div>
                  <div className="order-total-box">
                    <span>Tổng tiền:</span>
                    <strong className="order-total-price">{(order.total * 1000).toLocaleString()} VNĐ</strong>
                    
                    {/* Nút Hủy Đơn Hàng */}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <div style={{ marginTop: '10px' }}>
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="btn-cancel-order"
                        >
                          Hủy đơn hàng
                        </button>
                      </div>
                    )}

                    {/* Nút Xóa Đơn Hàng (Chỉ hiện khi đã hủy) */}
                    {(order.status === 'CANCELLED') && (
                      <div style={{ marginTop: '10px' }}>
                        <button 
                          onClick={() => handleRemoveOrder(order.id)}
                          className="btn-cancel-order"
                          style={{ color: '#aaa', borderColor: '#555' }}
                        >
                          🗑️ Xóa khỏi lịch sử
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
