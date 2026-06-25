import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product, addToCart, user }) => {
  const imageRef = useRef(null);
  const navigate = useNavigate();

  // Tính toán giá sau khi giảm
  const discountedPrice = product.discountPercent > 0 
    ? product.price - (product.price * product.discountPercent / 100)
    : product.price;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const cartIcon = document.getElementById('cart-icon-nav');
    const productImage = imageRef.current;

    if (cartIcon && productImage) {
      // Create flying clone
      const flyingImg = productImage.cloneNode();
      const rect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      Object.assign(flyingImg.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: '99999',
        transition: 'all 0.8s cubic-bezier(0.42, 0, 0.58, 1)',
        borderRadius: '10px',
        pointerEvents: 'none'
      });

      document.body.appendChild(flyingImg);

      requestAnimationFrame(() => {
        Object.assign(flyingImg.style, {
          left: `${cartRect.left + 10}px`,
          top: `${cartRect.top + 10}px`,
          width: '20px',
          height: '20px',
          opacity: '0.4',
          transform: 'rotate(720deg) scale(0.5)'
        });
      });

      setTimeout(() => {
        flyingImg.remove();
        addToCart(product);
        cartIcon.classList.add('pulse-cart');
        setTimeout(() => cartIcon.classList.remove('pulse-cart'), 500);
      }, 800);
    } else {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div key={product.id} className="card">
      <div className="product-image-container">
        {product.discountPercent > 0 && (
          <span className="discount-badge">-{product.discountPercent}%</span>
        )}
        <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
          <div 
            className="image-wrapper" 
            style={{ 
              '--bg-img': `url(${product.imageUrl})`,
              '--bg-img-hover': product.imageUrl2 ? `url(${product.imageUrl2})` : `url(${product.imageUrl})`
            }}
          >
            {product.imageUrl ? (
              <img 
                ref={imageRef}
                src={product.imageUrl} 
                alt={product.productName} 
                className="product-image main-img" 
              />
            ) : (
              <div className="product-image-placeholder">No Image</div>
            )}
            {product.imageUrl2 && (
              <img src={product.imageUrl2} alt={product.productName} className="product-image hover-img" />
            )}
          </div>
        </Link>
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>{product.productName}</h3>
        </Link>
        <p className="product-desc">{product.discription || 'Chưa có mô tả cho sản phẩm này.'}</p>
        
        <div className="price-container">
          {product.discountPercent > 0 ? (
            <>
              <span className="price discounted">{(discountedPrice * 1000).toLocaleString()} VNĐ</span>
              <span className="price-original">{(product.price * 1000).toLocaleString()} VNĐ</span>
            </>
          ) : (
            <span className="price">{(product.price * 1000).toLocaleString()} VNĐ</span>
          )}
        </div>
        
        <div className="product-actions">
          <button className="btn-buy-now" onClick={handleBuyNow}>Mua ngay</button>
          <div className="secondary-actions">
            <button className="btn-add-cart" onClick={handleAddToCart}>
              🛒 Thêm giỏ
            </button>
            <button className="btn-wishlist" onClick={() => alert('Đã thêm vào yêu thích!')}>
              ❤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
