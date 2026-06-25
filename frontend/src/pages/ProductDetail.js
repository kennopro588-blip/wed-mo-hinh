import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import './ProductDetail.css';

const ProductDetail = ({ products, addToCart, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('Mặc định');
  const [quantity, setQuantity] = useState(1);

  // Stock: read from localStorage overrides (if admin updated) or fallback to product.availability
  const getStock = () => {
    const overrides = JSON.parse(localStorage.getItem('stockOverrides') || '{}');
    const key = `product_${product?.id}`;
    return overrides[key] !== undefined ? overrides[key] : (product?.availability || 0);
  };
  const stock = product ? getStock() : 0;
  const isOutOfStock = stock <= 0;


  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="product-not-found" style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/" style={{ color: '#d4af37' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  const galleryImages = [
    product.imageUrl,
    product.imageUrl2 || product.imageUrl,
    product.imageUrl,
    product.imageUrl2 || product.imageUrl
  ];

  // Dynamic pricing based on scale/size
  const getPriceModifier = (size) => {
    if (size === 'Phiên bản giới hạn') return 1.20;
    if (size === '1/6 Scale' || size === '1/4 Scale') return 1.05;
    return 1.0;
  };

  const modifier = getPriceModifier(selectedSize);
  const basePrice = product.price * modifier;
  const currentPrice = product.discountPercent > 0 
    ? basePrice - (basePrice * product.discountPercent / 100)
    : basePrice;

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    if (isOutOfStock) { alert('Sản phẩm này đã hết hàng!'); return; }
    if (quantity > stock) { alert(`Chỉ còn ${stock} sản phẩm trong kho!`); return; }
    addToCart({ ...product, selectedSize, quantity });
    alert(`Đã thêm ${product.productName} (${selectedSize}) vào giỏ hàng!`);
  };


  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    if (isOutOfStock) { alert('Sản phẩm này đã hết hàng!'); return; }
    addToCart({ ...product, selectedSize, quantity });
    navigate('/checkout');
  };


  const similarProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="breadcrumb-nav" style={{ paddingTop: '20px', marginBottom: '40px' }}>
        <Link to="/">TRANG CHỦ</Link>
        <span className="separator">/</span>
        <span className="current">{product.productName.toUpperCase()}</span>
      </div>

      <div className="product-detail-main">
        {/* Left: Image Gallery */}
        <div className="product-gallery-section">
            <div className="thumbnail-list">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-item ${selectedImage === img && idx === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product.productName} thumb ${idx}`} />
                </div>
              ))}
            </div>
            <div className="main-image-container">
              <img src={selectedImage} alt={product.productName} />
            </div>
          </div>

        {/* Right: Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.productName}</h1>
          <div className="product-meta">
            <p>Thương hiệu: <strong>{product.brand || 'PREMIUM BRAND'}</strong></p>
            <p>Mã SP: {product.id.toString().padStart(8, '0')}</p>
          </div>

          <div className="product-price-block">
            <span className="current-price">{(currentPrice * 1000).toLocaleString()} VNĐ</span>
            {product.discountPercent > 0 && (
              <>
                <span className="original-price">{(basePrice * 1000).toLocaleString()} VNĐ</span>
                <span className="discount-badge">GIẢM {product.discountPercent}%</span>
              </>
            )}
          </div>

          {/* Stock display */}
          <div className="stock-status-block">
            {isOutOfStock ? (
              <span className="stock-out">⚠️ Hết hàng</span>
            ) : stock <= 5 ? (
              <span className="stock-low">🔥 Chỉ còn <strong>{stock}</strong> sản phẩm</span>
            ) : (
              <span className="stock-ok">✅ Còn hàng <span className="stock-num">({stock} sản phẩm)</span></span>
            )}
          </div>


          <div className="size-selection-block">
            <p className="selection-label">Phân loại / Kích thước</p>
            <div className="size-options">
              {['Mặc định', '1/6 Scale', '1/4 Scale', 'Phiên bản giới hạn'].map(size => (
                <button 
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-block">
            <p className="selection-label">Số lượng {!isOutOfStock && <span style={{color:'#888',fontWeight:'normal',fontSize:'0.85rem'}}>(tối đa {stock})</span>}</p>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}>-</button>
              <input type="text" value={isOutOfStock ? 0 : quantity} readOnly />
              <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={isOutOfStock || quantity >= stock}>+</button>
            </div>
          </div>


          <div className="action-buttons">
            <button 
              className="add-to-cart-btn" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {isOutOfStock ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ'}
            </button>
            <button 
              className="buy-now-btn" 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              MUA NGAY
            </button>
          </div>

        </div>
      </div>

      <div className="product-description-bottom" style={{ boxSizing: 'border-box' }}>
        <h3 className="desc-title">THÔNG TIN SẢN PHẨM</h3>
        <div className="desc-content">
          <p><strong>Giới thiệu:</strong> {product.discription || 'Mô hình chế tác thủ công cao cấp với độ tinh xảo tuyệt đối. Sơn phủ kim loại tĩnh điện nhiều lớp giúp màu sắc chân thực và bền bỉ.'}</p>
          <p><strong>Khớp nối:</strong> Hỗ trợ đa dạng các tư thế tạo dáng linh hoạt, trang bị thêm đèn LED ở các bộ phận đặc biệt (nếu có).</p>
          <p>Sản phẩm phân phối chính hãng thuộc bộ sưu tập: <strong>PREMIUM MASTERPIECE</strong></p>
        </div>
      </div>

      <ReviewSection productId={product.id} />

      <div className="related-products-section">
        <h3 className="section-title">SẢN PHẨM CÙNG BST</h3>
        <div className="product-grid-4">
          {similarProducts.map(p => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
