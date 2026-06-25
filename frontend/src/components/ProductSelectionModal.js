import React, { useState } from 'react';
import './ProductSelectionModal.css';

const ProductSelectionModal = ({ product, isOpen, onClose, onConfirm }) => {
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const currentImage = selectedVariant === 1 ? product.imageUrl : (product.imageUrl2 || product.imageUrl);
  const discountedPrice = product.discountPercent > 0 
    ? product.price - (product.price * product.discountPercent / 100)
    : product.price;

  const handleConfirm = () => {
    onConfirm({
      ...product,
      selectedVariant,
      quantity,
      finalPrice: discountedPrice * quantity
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <p>
            <a href="/login">Đăng nhập</a> hoặc <a href="/register">Đăng ký</a> để hưởng giá ưu đãi dành riêng cho thành viên.
          </p>
        </div>
        
        <div className="freeship-banner">
          🚀 Bạn đã được FREESHIP
        </div>

        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-body">
          <div className="product-quick-info">
            <img src={currentImage} className="quick-thumb" alt="thumb" />
            <div className="quick-details">
              <h2 className="modal-product-title">{product.productName}</h2>
              <div className="modal-price-row">
                <span className="modal-price">{discountedPrice.toLocaleString()} VNĐ</span>
              </div>
            </div>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="selection-grid">
            <div className="variant-selection">
              <span className="quantity-label">Chọn mẫu:</span>
              <div className="variant-options">
                <button 
                  className={`variant-btn ${selectedVariant === 1 ? 'selected' : ''}`}
                  onClick={() => setSelectedVariant(1)}
                >
                  Mẫu 1
                </button>
                {product.imageUrl2 && (
                  <button 
                    className={`variant-btn ${selectedVariant === 2 ? 'selected' : ''}`}
                    onClick={() => setSelectedVariant(2)}
                  >
                    Mẫu 2
                  </button>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="modal-price" style={{ fontSize: '1.4rem' }}>
                {(discountedPrice * quantity).toLocaleString()} VNĐ
              </span>
            </div>
          </div>

          <div className="total-section">
             <span style={{ color: '#636e72' }}>Tổng cộng</span>
             <span className="total-label">{(discountedPrice * quantity).toLocaleString()} VND</span>
          </div>

          <div className="modal-actions">
            <button className="view-cart-btn" onClick={onClose}>
              🛒 Xem giỏ hàng
            </button>
            <button className="checkout-btn" onClick={handleConfirm}>
              Thanh toán ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
