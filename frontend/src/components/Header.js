import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLoyaltyData } from '../pages/LoyaltyPoints';

const Header = ({ user, logout, connected, categories, brands, cartCount }) => {
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loyaltyPts, setLoyaltyPts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const d = getLoyaltyData(user.id || user.userName);
      setLoyaltyPts(d.points);
    }
  }, [user]);

  const phoneNumber = "0372715605";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <header className="fixed-header">
      <div className="header-inner">
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="logo-text">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Premium <span>Store</span>
          </Link>
        </div>

        <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>

          <Link to="/">Trang chủ</Link>
          
          <div 
            className="nav-item-container"
            onMouseEnter={() => setShowProductDropdown(true)}
            onMouseLeave={() => {
              setShowProductDropdown(false);
              setActiveCategory(null);
            }}
          >
            <Link to="/products" className="nav-link">Sản phẩm</Link>
            {showProductDropdown && (
              <div className="category-dropdown">
                {categories?.map(cat => (
                  <div 
                    key={cat.id} 
                    className="category-item"
                    onMouseEnter={() => setActiveCategory(cat.categoryName)}
                  >
                    <span className="cat-name">{cat.categoryName}</span>
                    <span className="arrow">›</span>
                    
                    {activeCategory === cat.categoryName && (
                      <div className="brand-submenu">
                        <div className="brand-submenu-content">
                          {brands?.map(brand => (
                            <Link 
                              key={brand.id} 
                              to={`/products?category=${cat.categoryName}&brand=${brand.brandName}`}
                              className="submenu-item"
                            >
                              {brand.brandName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && user.role && user.role.roleName === 'ADMIN' && (
            <Link to="/admin" style={{ color: '#e63946' }}>Admin Panel</Link>
          )}
          <div 
            className="nav-contact-container"
            onMouseEnter={() => setShowContactDropdown(true)}
            onMouseLeave={() => setShowContactDropdown(false)}
            style={{ position: 'relative' }}
          >
            <span className="nav-contact">Liên hệ</span>
            {showContactDropdown && (
              <div className="nav-dropdown">
                <a href={`tel:${phoneNumber}`} className="dropdown-item">
                  <span className="icon">📞</span> Gọi ngay
                </a>
                <a href={`https://zalo.me/${phoneNumber}`} target="_blank" rel="noreferrer" className="dropdown-item">
                  <span className="icon">💬</span> Zalo
                </a>
                <a href="https://www.facebook.com/share/1boVU28nFY/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="dropdown-item">
                  <span className="icon">👤</span> Facebook
                </a>
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <div className="search-container fixed">
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-submit">🔍</button>
            </form>
          </div>

          <div className="action-icons">
            <Link to="/cart" className="icon-btn" title="Giỏ hàng" id="cart-icon-nav">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            
            {user && (
              <>
                <Link to="/my-orders" className="icon-btn order-tracking-btn" title="Đơn hàng của tôi">
                  📦
                </Link>
                <Link to="/loyalty" className="loyalty-badge" title="Điểm thưởng">
                  <span className="pts-icon">⭐</span>
                  {loyaltyPts.toLocaleString()} điểm
                </Link>
              </>
            )}
            
            {user ? (
              <div className="user-info">
                <span className="user-name">👤 {user.userName}</span>
                <button className="logout-btn" onClick={logout}>Đăng xuất</button>
              </div>
            ) : (
              <Link to="/login" className="account-icon" title="Tài khoản">👤</Link>
            )}
          </div>
          <div className={`status-dot ${connected ? 'online' : 'offline'}`} title={connected ? 'Đang kết nối' : 'Mất kết nối'}></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
