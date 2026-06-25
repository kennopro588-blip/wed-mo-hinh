import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductList from '../components/ProductList';
import './Collection.css';

const Collection = ({ products, loading, error, addToCart, user }) => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: 0,
    maxPrice: 50000000,
    sortBy: 'newest'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState({ min: 0, max: 50000000 });

  const absoluteMax = useMemo(() => 
    products.length > 0 ? Math.max(...products.map(p => p.price)) : 50000000
  , [products]);

  useEffect(() => {
    setAppliedFilters(prev => ({ ...prev, maxPrice: absoluteMax }));
    setTempPrice({ min: 0, max: absoluteMax });
    window.scrollTo(0, 0);
  }, [absoluteMax, type]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category Logic
    if (type !== 'search') {
      const sectionMap = {
        'exclusive': 'Exclusive',
        'best-selling': 'Best Selling',
        'sale': 'Sale',
        'new-arrivals': 'New Arrivals'
      };
      const section = sectionMap[type];
      if (section === 'Sale') filtered = filtered.filter(p => p.discountPercent > 0);
      else if (section) filtered = filtered.filter(p => p.section === section || (section === 'Exclusive' && p.section === 'Exclusive Collection'));
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(searchQuery) ||
        p.category?.toLowerCase().includes(searchQuery)
      );
    }

    filtered = filtered.filter(p => p.price >= appliedFilters.minPrice && p.price <= appliedFilters.maxPrice);

    if (appliedFilters.sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (appliedFilters.sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [products, type, searchQuery, appliedFilters]);

  const getTitle = () => {
    if (searchQuery) return `Kết quả cho "${searchQuery}"`;
    return {
      'exclusive': 'Dòng Độc Quyền',
      'best-selling': 'Bán Chạy Nhất',
      'sale': 'Ưu Đãi Đặc Biệt',
      'new-arrivals': 'Sản Phẩm Mới'
    }[type] || 'Bộ Sưu Tập';
  };

  return (
    <div className="collection-layout">
      {/* Pushed to Top: Hero & Filters Integrated */}
      <div className={`collection-header-pushed ${type}`}>
         <div className="header-inner-pushed">
            <div className="header-top-row">
               <button className="nav-back-minimal" onClick={() => navigate('/')}>← Quay lại</button>
               <div className="stats-badge">{filteredProducts.length} Sản phẩm</div>
            </div>
            
            <div className="title-row-pushed">
               <h1 className="pushed-title">{getTitle()}</h1>
               
               {/* Professional Top Filter Bar */}
               <div className="top-filter-bar">
                  <div className="filter-item-wrap">
                     <span>Sắp xếp</span>
                     <select 
                        value={appliedFilters.sortBy} 
                        onChange={(e) => setAppliedFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                     >
                        <option value="newest">Mới nhất</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                     </select>
                  </div>

                  <div className="filter-item-wrap">
                     <span>Khoảng giá</span>
                     <div className="inline-prices">
                        <input 
                           type="number" 
                           value={tempPrice.min} 
                           onChange={(e) => setTempPrice(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                           placeholder="0"
                        />
                        <span className="dash">/</span>
                        <input 
                           type="number" 
                           value={tempPrice.max} 
                           onChange={(e) => setTempPrice(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                           placeholder="Max"
                        />
                        <button className="inline-apply" onClick={() => setAppliedFilters(prev => ({ ...prev, minPrice: tempPrice.min, maxPrice: tempPrice.max }))}>
                           Lọc
                        </button>
                     </div>
                  </div>

                  <button className="reset-link" onClick={() => {
                     const resetPrice = { min: 0, max: absoluteMax };
                     setTempPrice(resetPrice);
                     setAppliedFilters({ minPrice: 0, maxPrice: absoluteMax, sortBy: 'newest' });
                  }}>Xóa lọc</button>
               </div>
            </div>
         </div>
      </div>

      <main className="collection-content-pushed">
         <ProductList 
           products={filteredProducts} 
           loading={loading} 
           error={error} 
           addToCart={addToCart} 
           user={user}
         />

         {filteredProducts.length === 0 && !loading && (
           <div className="no-results-minimal">
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
              <button onClick={() => navigate('/')}>Quay lại trang chính</button>
           </div>
         )}
      </main>
    </div>
  );
};

export default Collection;
