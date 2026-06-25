import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, loading, error, addToCart, user }) => {
  return (
    <section className="product-list-container">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.</p>
        </div>
      ) : (
        <div className="grid">
          {products && products.length > 0 ? (
            products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
                user={user}
              />
            ))
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
               <p>Hiện không có sản phẩm nào trong cửa hàng.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductList;
