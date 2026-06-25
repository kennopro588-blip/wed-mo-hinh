import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity, updateSize, checkoutSelectedItems }) => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');

  // Select all by default when items are added to cart
  useEffect(() => {
    setSelectedItems(cart.map((_, index) => index));
  }, [cart.length]); // Only reset when cart size changes

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.map((_, index) => index));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const selectedCartItems = cart.filter((_, index) => selectedItems.includes(index));

  const getPriceModifier = (size) => {
    if (size === 'Phiên bản giới hạn') return 1.20;
    if (size === '1/6 Scale' || size === '1/4 Scale') return 1.05;
    return 1.0;
  };

  const totalPrice = selectedCartItems.reduce((total, item) => {
    const modifier = getPriceModifier(item.selectedSize || 'Mặc định');
    const basePrice = item.price * modifier;
    const price = item.discountPercent > 0 
      ? basePrice - (basePrice * item.discountPercent / 100)
      : basePrice;
    return total + (price * (item.quantity || 1));
  }, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    // Navigate to the new professional checkout page
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">🛒</div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy khám phá thêm hàng ngàn sản phẩm thú vị tại cửa hàng nhé!</p>
          <Link to="/" className="continue-shopping-btn">Quay lại mua sắm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>GIỎ HÀNG <span>({cart.length} sản phẩm)</span></h1>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-list-header">
              <div className="cart-col-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === cart.length && cart.length > 0}
                  onChange={handleSelectAll}
                  id="selectAll"
                />
              </div>
              <div className="cart-col-product">Sản phẩm</div>
              <div className="cart-col-price">Đơn giá</div>
              <div className="cart-col-quantity">Số lượng</div>
              <div className="cart-col-total">Thành tiền</div>
              <div className="cart-col-action">Thao tác</div>
            </div>

            <div className="cart-items-list">
              {cart.map((item, index) => {
                const modifier = getPriceModifier(item.selectedSize || 'Mặc định');
                const basePrice = item.price * modifier;
                const currentPrice = item.discountPercent > 0 
                  ? basePrice - (basePrice * item.discountPercent / 100)
                  : basePrice;
                const isSelected = selectedItems.includes(index);
                
                return (
                  <div key={`${item.id}-${index}`} className={`cart-item-card ${isSelected ? 'selected' : ''}`}>
                    <div className="cart-col-checkbox">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectItem(index)}
                      />
                    </div>
                    
                    <div className="cart-col-product">
                      <div className="item-img-container">
                        <img src={item.imageUrl} alt={item.productName} />
                      </div>
                      <div className="item-info">
                        <h3>{item.productName}</h3>
                        <p className="item-brand">Thương hiệu: {item.brand || 'Khác'}</p>
                        
                        <div className="item-size-selector">
                          <label>Phân loại: </label>
                          <select 
                            value={item.selectedSize || 'Mặc định'} 
                            onChange={(e) => updateSize(index, e.target.value)}
                          >
                            <option value="Mặc định">Mặc định</option>
                            <option value="1/6 Scale">1/6 Scale</option>
                            <option value="1/4 Scale">1/4 Scale</option>
                            <option value="Phiên bản giới hạn">Phiên bản giới hạn</option>
                          </select>
                        </div>

                        {item.discountPercent > 0 && (
                          <span className="promo-tag">Giảm {item.discountPercent}%</span>
                        )}
                      </div>
                    </div>

                    <div className="cart-col-price">
                      {item.discountPercent > 0 && (
                        <div className="item-original-price">{(basePrice * 1000).toLocaleString()} đ</div>
                      )}
                      <div className="item-current-price">{(currentPrice * 1000).toLocaleString()} đ</div>
                    </div>

                    <div className="cart-col-quantity">
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(index, -1)} disabled={item.quantity <= 1}>-</button>
                        <input type="text" value={item.quantity || 1} readOnly />
                        <button onClick={() => updateQuantity(index, 1)}>+</button>
                      </div>
                    </div>

                    <div className="cart-col-total">
                      <div className="item-total-price">
                        {(currentPrice * (item.quantity || 1) * 1000).toLocaleString()} đ
                      </div>
                    </div>

                    <div className="cart-col-action">
                      <button className="remove-btn" onClick={() => removeFromCart(index)} title="Xóa">
                        <i className="delete-icon">🗑️</i> Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h3 className="summary-title">Thông tin đơn hàng</h3>
              
              <div className="promo-code-section">
                <p>Mã ưu đãi / Voucher</p>
                <div className="promo-input-group">
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá..." 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button className="apply-promo-btn">Áp dụng</button>
                </div>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label">Tạm tính ({selectedItems.length} SP):</span>
                  <span className="summary-value">{(totalPrice * 1000).toLocaleString()} đ</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Phí giao hàng:</span>
                  <span className="summary-value free-ship">Miễn phí</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Giảm giá:</span>
                  <span className="summary-value discount-value">- 0 đ</span>
                </div>
              </div>

              <div className="summary-total-section">
                <div className="summary-total-text">Tổng cộng:</div>
                <div className="final-price-wrapper">
                  <div className="final-price">{(totalPrice * 1000).toLocaleString()} đ</div>
                  <div className="vat-note">(Đã bao gồm VAT nếu có)</div>
                </div>
              </div>

              <button 
                className={`checkout-btn ${selectedItems.length === 0 ? 'disabled' : ''}`} 
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
              </button>
              
              <div className="secure-checkout">
                <span>🔒 Thanh toán an toàn và bảo mật</span>
              </div>
            </div>
            
            <Link to="/" className="back-to-shop-link">← Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
