import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder, createVNPayUrl } from '../services/apiService';

import './Checkout.css';

const Checkout = ({ cart, setCart, user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const userCoupons = JSON.parse(localStorage.getItem(`userCoupons_${user ? (user.id || user.userName) : 'guest'}`) || '[]');
  const globalCodes = JSON.parse(localStorage.getItem('discountCodes') || '[]');

  // Dynamic pricing based on scale/size, same logic as Cart
  const getPriceModifier = (size) => {
    if (size === 'Phiên bản giới hạn') return 1.20;
    if (size === '1/6 Scale' || size === '1/4 Scale') return 1.05;
    return 1.0;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const modifier = getPriceModifier(item.selectedSize || 'Mặc định');
      const basePrice = item.price * modifier;
      const currentPrice = item.discountPercent > 0 
        ? basePrice - (basePrice * item.discountPercent / 100)
        : basePrice;
      const itemQty = item.quantity || 1;
      return total + (currentPrice * itemQty);
    }, 0);
  };

  const cartTotal = calculateTotal();
  const shippingFee = (cartTotal * 1000) > 5000000 ? 0 : 50000;

  // Coupon discount calculation
  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const base = (cartTotal * 1000) + shippingFee;
    if (appliedCoupon.type === 'percent') {
      return Math.round(base * appliedCoupon.value / 100);
    }
    return Math.min(appliedCoupon.value, base);
  };
  const discountAmount = getDiscount();
  const finalTotal = (cartTotal * 1000) + shippingFee - discountAmount;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) { setCouponError('Vui lòng nhập mã giảm giá.'); return; }
    const codes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
    const found = codes.find(c => c.code === couponCode.trim().toUpperCase());
    if (!found) { setCouponError('Mã giảm giá không tồn tại.'); return; }
    if (!found.active) { setCouponError('Mã giảm giá này đã bị tắt.'); return; }
    if (found.expiry && new Date(found.expiry) < new Date()) { setCouponError('Mã giảm giá đã hết hạn.'); return; }
    if (found.used >= found.maxUses) { setCouponError('Mã giảm giá đã hết lượt sử dụng.'); return; }
    const minOrderVnd = found.minOrder || 0;
    if ((cartTotal * 1000) < minOrderVnd) {
      setCouponError(`Đơn hàng tối thiểu ${minOrderVnd.toLocaleString()} VNĐ để dùng mã này.`);
      return;
    }
    setAppliedCoupon(found);
    const discount = found.type === 'percent'
      ? `${found.value}%`
      : `${found.value.toLocaleString()} VNĐ`;
    setCouponSuccess(`✅ Áp dụng thành công! Giảm ${discount}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Read stock from localStorage overrides (same logic as ProductDetail)
  const getItemStock = (item) => {
    const overrides = JSON.parse(localStorage.getItem('stockOverrides') || '{}');
    const key = `product_${item.id}`;
    return overrides[key] !== undefined ? overrides[key] : (item.availability || 99);
  };


  const updateQuantity = (index, delta) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const item = newCart[index];
      const currentQty = item.quantity || 1;
      const newQty = currentQty + delta;
      const maxStock = getItemStock(item);

      if (newQty < 1) {
        return newCart.filter((_, i) => i !== index);
      }
      if (newQty > maxStock) {
        alert(`Chỉ còn ${maxStock} sản phẩm trong kho!`);
        return newCart;
      }
      newCart[index].quantity = newQty;
      return newCart;
    });
  };


  const updateSize = (index, newSize) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[index].selectedSize = newSize;
      return newCart;
    });
  };

  const removeItem = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    
    setIsProcessing(true);

    // Nếu chọn VNPay: chuyển thẳng sang trang thanh toán trung gian 
    // không cần gọi backend createOrder (tránh lỗi session/Redis)
    if (paymentMethod === 'vnpay') {
      const fakeOrderId = `VNP${Date.now()}`;

      // Increment coupon used count and remove from user's inventory
      if (appliedCoupon) {
        const codes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
        const updated = codes.map(c => c.id === appliedCoupon.id ? { ...c, used: (c.used || 0) + 1 } : c);
        localStorage.setItem('discountCodes', JSON.stringify(updated));

        const userKey = `userCoupons_${user ? (user.id || user.userName) : 'guest'}`;
        const personalCoupons = JSON.parse(localStorage.getItem(userKey) || '[]');
        const updatedPersonal = personalCoupons.filter(c => c.code !== appliedCoupon.code);
        localStorage.setItem(userKey, JSON.stringify(updatedPersonal));
      }

      sessionStorage.setItem('pendingOrder', JSON.stringify({
        cart,
        formData,
        total: finalTotal,
        coupon: appliedCoupon ? appliedCoupon.code : null,
        discount: discountAmount,
        userId: user ? user.userName : 'guest'
      }));

      navigate(`/payment/${fakeOrderId}`, { 
        state: { cart, formData, finalTotal, paymentMethod } 
      });
      setIsProcessing(false);
      return;
    }

    
    try {
      // Increment coupon used count and remove from user's inventory for COD
      if (appliedCoupon) {
        const codes = JSON.parse(localStorage.getItem('discountCodes') || '[]');
        const updated = codes.map(c => c.id === appliedCoupon.id ? { ...c, used: (c.used || 0) + 1 } : c);
        localStorage.setItem('discountCodes', JSON.stringify(updated));

        const userKey = `userCoupons_${user ? (user.id || user.userName) : 'guest'}`;
        const personalCoupons = JSON.parse(localStorage.getItem(userKey) || '[]');
        const updatedPersonal = personalCoupons.filter(c => c.code !== appliedCoupon.code);
        localStorage.setItem(userKey, JSON.stringify(updatedPersonal));
      }

      const userId = user ? user.id : 1; 
      // Vẫn gọi API để tương thích, nhưng cũng lưu xuống localStorage cho Admin/User UI
      try {
        await createOrder(userId, paymentMethod);
      } catch(e) { console.error("Backend order failed, proceeding with local mock", e); }
      
      const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
      const newOrder = {
          id: newOrderId,
          userId: user ? user.userName : 'guest',
          customerName: formData.fullName || 'Khách hàng',
          phone: formData.phone || '',
          address: formData.address || '',
          items: cart || [],
          total: finalTotal,
          paymentMethod: 'cod',
          status: 'PENDING',
          date: new Date().toLocaleDateString('vi-VN'),
          couponUsed: appliedCoupon ? appliedCoupon.code : null
      };
      const existing = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      localStorage.setItem('adminOrders', JSON.stringify([newOrder, ...existing]));

      setOrderSuccess({ id: newOrderId, ...newOrder });
      setIsProcessing(false);
      setCart([]);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Order error:", error);
      alert("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };


  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-success-container">
          <div className="success-icon">✓</div>
          <h2>ĐẶT HÀNG THÀNH CÔNG</h2>
          <p>Cảm ơn <strong>{formData.fullName}</strong> đã tin tưởng và mua sắm tại PREMIUM STORE.</p>
          <p>Mã đơn hàng của bạn là: <strong style={{color: 'var(--gold-accent)'}}>#{orderSuccess.id}</strong></p>
          <p className="success-desc">Chúng tôi sẽ liên hệ với bạn qua số điện thoại <strong>{formData.phone}</strong> trong vòng 24h để xác nhận đơn hàng.</p>
          <div className="success-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
            <button className="btn-primary" onClick={() => navigate('/my-orders')}>Kiểm tra đơn hàng</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="breadcrumb-nav">
        <Link to="/">TRANG CHỦ</Link>
        <span className="separator">/</span>
        <Link to="/cart">GIỎ HÀNG</Link>
        <span className="separator">/</span>
        <span className="current">THANH TOÁN</span>
      </div>

      <div className="checkout-header">
        <h1>THANH TOÁN AN TOÀN</h1>
        <p>Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng nhanh nhất</p>
      </div>

      <div className="checkout-main">
        <form className="checkout-left" onSubmit={handleSubmit}>
          {/* 1. Thông tin giao hàng */}
          <div className="checkout-section">
            <h3 className="section-title"><span>1</span> THÔNG TIN GIAO HÀNG</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Họ và tên *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Nhập họ và tên người nhận" />
              </div>
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Ví dụ: 0901234567" />
              </div>
              <div className="form-group">
                <label>Email (Tùy chọn)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Để nhận thông tin cập nhật đơn hàng" />
              </div>
              <div className="form-group">
                <label>Tỉnh / Thành phố *</label>
                <select name="city" value={formData.city} onChange={handleInputChange} required>
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quận / Huyện *</label>
                <input type="text" name="district" value={formData.district} onChange={handleInputChange} required placeholder="Nhập Quận/Huyện" />
              </div>
              <div className="form-group full-width">
                <label>Địa chỉ chi tiết *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Số nhà, Tên đường, Phường/Xã..." />
              </div>
              <div className="form-group full-width">
                <label>Ghi chú cho đơn hàng</label>
                <textarea name="note" rows="3" value={formData.note} onChange={handleInputChange} placeholder="Ví dụ: Giao hàng giờ hành chính..."></textarea>
              </div>
            </div>
          </div>

          {/* 2. Phương thức thanh toán */}
          <div className="checkout-section">
            <h3 className="section-title"><span>2</span> PHƯƠNG THỨC THANH TOÁN</h3>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div className="payment-icon">💵</div>
                <div className="payment-content">
                  <div className="payment-name">Thanh toán khi nhận hàng (COD)</div>
                  <div className="payment-desc">Thanh toán bằng tiền mặt khi đơn hàng được giao đến tận tay bạn.</div>
                </div>
              </label>
              
              <label className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                <div className="payment-icon">🏦</div>
                <div className="payment-content">
                  <div className="payment-name">Chuyển khoản ngân hàng</div>
                  <div className="payment-desc">Chuyển khoản trực tiếp qua tài khoản ngân hàng của PREMIUM STORE.</div>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                <div className="payment-icon vnpay-icon">V</div>
                <div className="payment-content">
                  <div className="payment-name">VNPay / VietQR (Tự động)</div>
                  <div className="payment-desc">Quét mã QR để thanh toán an toàn qua ứng dụng ngân hàng. Hệ thống tự động xác nhận sau 1-2 phút.</div>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <div className="payment-icon">💳</div>
                <div className="payment-content">
                  <div className="payment-name">Thẻ Tín Dụng / Thẻ Ghi Nợ</div>
                  <div className="payment-desc">Visa, MasterCard, JCB qua cổng thanh toán quốc tế.</div>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="place-order-btn" disabled={isProcessing || cart.length === 0}>
            {isProcessing ? <span className="loader-text">ĐANG XỬ LÝ...</span> : 'ĐẶT HÀNG NGAY'}
          </button>
        </form>

        {/* Right: Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-panel">
            <h3 className="summary-title">TÓM TẮT ĐƠN HÀNG</h3>
            <div className="summary-items">
              {cart.map((item, index) => {
                const modifier = getPriceModifier(item.selectedSize || 'Mặc định');
                const basePrice = item.price * modifier;
                const currentPrice = item.discountPercent > 0 
                  ? basePrice - (basePrice * item.discountPercent / 100)
                  : basePrice;
                return (
                  <div key={index} className="summary-item">
                    <div className="item-image">
                      <img src={item.imageUrl} alt={item.productName} />
                      <span className="item-qty">{item.quantity || 1}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name-row">
                        <div className="item-name">{item.productName}</div>
                        <button type="button" className="remove-item-btn" onClick={() => removeItem(index)} title="Xóa sản phẩm">✕</button>
                      </div>
                      <div className="item-variant-edit">
                        <span className="variant-label">Loại:</span>
                        <select 
                          className="inline-size-selector"
                          value={item.selectedSize || 'Mặc định'} 
                          onChange={(e) => updateSize(index, e.target.value)}
                        >
                          <option value="Mặc định">Mặc định</option>
                          <option value="1/6 Scale">1/6 Scale</option>
                          <option value="1/4 Scale">1/4 Scale</option>
                          <option value="Phiên bản giới hạn">Phiên bản giới hạn</option>
                        </select>
                      </div>
                      <div className="item-price-edit-row">
                        <div className="item-price">{(currentPrice * (item.quantity || 1) * 1000).toLocaleString()} VNĐ</div>
                        <div className="inline-qty-selector">
                          <button type="button" onClick={() => updateQuantity(index, -1)}>-</button>
                          <span>{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, 1)}
                            disabled={(item.quantity || 1) >= getItemStock(item)}
                            style={(item.quantity || 1) >= getItemStock(item) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            title={`Tồn kho: ${getItemStock(item)}`}
                          >+</button>
                        </div>
                        {getItemStock(item) <= 5 && (
                          <span style={{ fontSize: '0.72rem', color: '#e67e22', marginLeft: '6px' }}>
                            (còn {getItemStock(item)})
                          </span>
                        )}

                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Coupon Input */}
            <div style={{ margin: '10px 0', padding: '15px', background: '#f8f9fa', borderRadius: '10px', border: '1px dashed #ccc' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>🎫 Mã Giảm Giá</div>
              
              {!appliedCoupon && userCoupons.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #3498db', background: '#eaf2f8', color: '#2980b9', fontWeight: 'bold', cursor: 'pointer' }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCouponCode(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="">🎟️ Chọn mã từ Kho Voucher của bạn...</option>
                    {userCoupons.map((c, i) => {
                      const gc = globalCodes.find(g => g.code === c.code);
                      if (!gc) return null;
                      const remaining = Math.max(0, gc.maxUses - (gc.used || 0));
                      const isExpired = gc.expiry && new Date(gc.expiry) < new Date();
                      const isMaxed = remaining === 0;
                      const isDisabled = isExpired || isMaxed;
                      let label = `${c.code} - ${c.desc}`;
                      if (isDisabled) label += isExpired ? ' (Hết hạn)' : ' (Hết lượt)';
                      else label += ` (Còn ${remaining} lượt, HSD: ${gc.expiry || 'Không giới hạn'})`;
                      
                      return (
                        <option key={i} value={c.code} disabled={isDisabled}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button type="button" onClick={handleApplyCoupon}
                    style={{ padding: '8px 15px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Áp dụng
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '8px 12px', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#27ae60', fontFamily: 'monospace' }}>✅ {appliedCoupon.code}</span>
                  <button type="button" onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>✕ Bỏ</button>
                </div>
              )}
              {couponError && <p style={{ color: '#e74c3c', fontSize: '0.82rem', margin: '6px 0 0' }}>❌ {couponError}</p>}
              {couponSuccess && <p style={{ color: '#27ae60', fontSize: '0.82rem', margin: '6px 0 0' }}>{couponSuccess}</p>}
            </div>

            <div className="summary-calculation">
              <div className="calc-row">
                <span>Tạm tính ({cart.reduce((total, item) => total + (item.quantity || 1), 0)} sản phẩm)</span>
                <span>{(cartTotal * 1000).toLocaleString()} VNĐ</span>
              </div>
              <div className="calc-row">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()} VNĐ`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="calc-row" style={{ color: '#27ae60', fontWeight: 'bold' }}>
                  <span>🎫 Mã: {appliedCoupon.code}</span>
                  <span>- {discountAmount.toLocaleString()} VNĐ</span>
                </div>
              )}
              {shippingFee === 0 && (
                <div className="calc-row highlight">
                  <span>Freeship</span>
                  <span>- Đã áp dụng</span>
                </div>
              )}
            </div>

            <div className="summary-total">
              <span>TỔNG CỘNG</span>
              <span className="total-price">{finalTotal.toLocaleString()} <span className="currency">VNĐ</span></span>
            </div>
            
            <div className="secure-checkout-badge">
              <span>🔒 Mã hóa SSL 256-bit</span>
              <span>An toàn & Bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
