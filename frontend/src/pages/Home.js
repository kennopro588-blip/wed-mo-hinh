import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import './Home.css';

const Home = ({ products, categories, loading, error, loadData, addToCart, user }) => {
  const navigate = useNavigate();
  const [tempMinPrice, setTempMinPrice] = React.useState(0);
  const [tempMaxPrice, setTempMaxPrice] = React.useState(2000);
  const [appliedMinPrice, setAppliedMinPrice] = React.useState(0);
  const [appliedMaxPrice, setAppliedMaxPrice] = React.useState(2000);
  const [sortBy, setSortBy] = React.useState('newest');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const absoluteMax = products.length > 0 ? Math.max(...products.map(p => p.price)) : 2000;

  React.useEffect(() => {
    if (absoluteMax > 0 && (tempMaxPrice === 2000 || tempMaxPrice === 0)) {
      setTempMaxPrice(absoluteMax);
      setAppliedMaxPrice(absoluteMax);
    }
  }, [absoluteMax]);

  const handleApplyFilter = () => {
    setAppliedMinPrice(tempMinPrice);
    setAppliedMaxPrice(tempMaxPrice);
    setIsFilterOpen(false);
    // On home page, applying filter can scroll to product section
    document.getElementById('featured-products-anchor').scrollIntoView({ behavior: 'smooth' });
  };

  const getFilteredProducts = (items) => {
    let filtered = [...items];
    filtered = filtered.filter(p => p.price >= appliedMinPrice && p.price <= appliedMaxPrice);
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts(products);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="welcome-text">CHÀO MỪNG ĐẾN VỚI</p>
          <h1 className="hero-title">THẾ GIỚI <span>MÔ HÌNH</span></h1>
          <p>Khám phá các phiên bản giới hạn, tượng resin cao cấp và những mô hình chính hãng từ những thương hiệu biểu tượng nhất thế giới.</p>
          <button className="hero-btn" onClick={() => document.getElementById('featured-products-anchor').scrollIntoView({ behavior: 'smooth' })}>Mua Ngay</button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-title">
          <h2>Danh Mục Sản Phẩm</h2>
        </div>
        <div className="category-grid">
          {categories && categories.length > 0 ? (
            categories.map(cat => (
              <div 
                key={cat.id} 
                className="category-card" 
                style={{ backgroundImage: `url(${cat.imageUrl})` }}
              >
                <div className="category-overlay">
                  <span>{cat.categoryName}</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="category-card"><span>Anime</span></div>
              <div className="category-card"><span>Marvel</span></div>
              <div className="category-card"><span>DC Multiverse</span></div>
              <div className="category-card"><span>Gundam</span></div>
            </>
          )}
        </div>
      </section>

      {/* Boutique Filter System */}
      <div id="featured-products-anchor"></div>
      <section className="boutique-filter-section">
        <div className="filter-toolbar">
          <button 
            className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <span className="icon">☰</span>
            <span className="text">{isFilterOpen ? 'ĐÓNG BỘ LỌC' : 'BỘ LỌC CHI TIẾT'}</span>
          </button>
          <div className="active-filter-summary">
            {(appliedMinPrice > 0 || appliedMaxPrice < absoluteMax) && (
              <span className="filter-tag">
                GIÁ: {(appliedMinPrice * 1000).toLocaleString()} - {(appliedMaxPrice * 1000).toLocaleString()} VNĐ
              </span>
            )}
            {sortBy !== 'newest' && <span className="filter-tag">SẮP XẾP: {sortBy === 'price-asc' ? 'GIÁ TĂNG' : 'GIÁ GIẢM'}</span>}
          </div>
        </div>

        <div className={`filter-mega-menu ${isFilterOpen ? 'open' : ''}`}>
          <div className="filter-grid">
            <div className="filter-column">
              <h4>KHOẢNG GIÁ TÙY CHỈNH</h4>
              <div className="manual-price-inputs">
                <div className="input-field">
                  <span>TỪ</span>
                  <input 
                    type="number" 
                    value={tempMinPrice} 
                    onChange={(e) => setTempMinPrice(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="input-field">
                  <span>ĐẾN</span>
                  <input 
                    type="number" 
                    value={tempMaxPrice} 
                    onChange={(e) => setTempMaxPrice(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                  />
                </div>
                <button className="apply-btn-premium" onClick={handleApplyFilter}>ÁP DỤNG LỌC</button>
              </div>
            </div>

            <div className="filter-column">
              <h4>SẮP XẾP THEO</h4>
              <div className="sort-options">
                <div 
                  className={`sort-item ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >Mới nhất cập nhật</div>
                <div 
                  className={`sort-item ${sortBy === 'price-asc' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-asc')}
                >Giá từ thấp đến cao</div>
                <div 
                  className={`sort-item ${sortBy === 'price-desc' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-desc')}
                >Giá từ cao xuống thấp</div>
              </div>
            </div>

            <div className="filter-column">
              <h4>THÔNG TIN</h4>
              <p className="filter-note">Hiển thị {filteredProducts.length} sản phẩm phù hợp.</p>
              <button className="reset-filter-btn" onClick={() => { 
                setTempMinPrice(0); 
                setTempMaxPrice(absoluteMax); 
                setAppliedMinPrice(0);
                setAppliedMaxPrice(absoluteMax);
                setSortBy('newest'); 
              }}>XÓA TẤT CẢ LỌC</button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <section className="featured-section section-exclusive">
        <div className="section-header-row">
          <div className="section-title-alt">
            <h2>Bộ Sưu Tập <span>Độc Quyền</span></h2>
            <p>Tuyển tập những mẫu mô hình hiếm và giới hạn nhất.</p>
          </div>
          <button className="view-all-btn vip-btn-exclusive" onClick={() => navigate('/collection/exclusive')}>
             <span className="icon">✦</span> KHÁM PHÁ ĐỘC QUYỀN
          </button>
        </div>
        <ProductList
          products={filteredProducts.filter(p => p.section === 'Exclusive' || p.section === 'Exclusive Collection').slice(0, 10)}
          loading={loading}
          error={error}
          addToCart={addToCart}
          user={user}
        />
        <div className="see-more-container">
           <button className="see-more-btn" onClick={() => navigate('/collection/exclusive')}>Khám Phá Thêm Dòng Độc Quyền</button>
        </div>
      </section>

      <section className="featured-section section-best-selling">
        <div className="section-header-row">
          <div className="section-title-alt">
            <h2>BÁN CHẠY <span>NHẤT</span></h2>
            <p>Những siêu phẩm đang được săn đón nhất tại cửa hàng.</p>
          </div>
          <button className="view-all-btn vip-btn-best-selling" onClick={() => navigate('/collection/best-selling')}>
             <span className="icon">🏆</span> XEM SIÊU PHẨM
          </button>
        </div>
        <ProductList
          products={filteredProducts.filter(p => p.section === 'Best Selling').slice(0, 5)}
          loading={loading}
          error={error}
          addToCart={addToCart}
          user={user}
        />
        <div className="see-more-container">
           <button className="see-more-btn" style={{ borderColor: '#d4af37' }} onClick={() => navigate('/collection/best-selling')}>Xem Thêm Sản Phẩm Hot</button>
        </div>
      </section>

      <section className="featured-section sale-section section-sale">
        <div className="section-header-row">
          <div className="section-title-alt">
            <h2>ƯU ĐÃI <span>HẤP DẪN</span></h2>
            <p>Cơ hội sở hữu các siêu phẩm với mức giá tốt nhất.</p>
          </div>
          <button className="view-all-btn vip-btn-sale" onClick={() => navigate('/collection/sale')}>
             <span className="icon">🔥</span> SĂN ƯU ĐÃI
          </button>
        </div>
        <ProductList
          products={filteredProducts.filter(p => p.discountPercent > 0).slice(0, 5)}
          loading={loading}
          error={error}
          addToCart={addToCart}
          user={user}
        />
        <div className="see-more-container">
           <button className="see-more-btn sale-btn" onClick={() => navigate('/collection/sale')}>Xem Tất Cả Sản Phẩm Đang Giảm Giá</button>
        </div>
      </section>

      <section className="featured-section section-new-arrivals">
        <div className="section-header-row">
          <div className="section-title-alt">
            <h2>HÀNG MỚI <span>VỀ</span></h2>
            <p>Cập nhật những mẫu mô hình mới nhất vừa cập bến cửa hàng.</p>
          </div>
          <button className="view-all-btn vip-btn-new-arrivals" onClick={() => navigate('/collection/new-arrivals')}>
             <span className="icon">🚀</span> XEM HÀNG MỚI
          </button>
        </div>
        <ProductList
          products={filteredProducts.filter(p => p.section === 'New Arrivals').slice(0, 5)}
          loading={loading}
          error={error}
          addToCart={addToCart}
          user={user}
        />
        <div className="see-more-container">
           <button className="see-more-btn" onClick={() => navigate('/collection/new-arrivals')}>Khám Phá Hàng Mới Về</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Về Premium Collectibles</h4>
            <p>Chúng tôi cung cấp các mô hình và action figure tốt nhất cho những người đam mê thực thụ. Cam kết chất lượng và chính hãng.</p>
          </div>
          <div className="footer-col">
            <h4>Liên Kết Nhanh</h4>
            <ul>
              <li>Trang chủ</li>
              <li>Sản phẩm mới</li>
              <li>Đặt hàng trước</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Thông Tin Liên Hệ</h4>
            <p>123 Đường Mô Hình, Thành Phố Hobby</p>
            <p>Email: support@premiummodels.com</p>
            <p>Hotline: +84 234 567 890</p>
          </div>
          <div className="footer-col">
            <h4>Theo Dõi Chúng Tôi</h4>
            <p>Facebook | Instagram | TikTok</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Cửa hàng Mô Hình Cao Cấp. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
