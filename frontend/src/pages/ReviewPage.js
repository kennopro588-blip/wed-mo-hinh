import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockReviews } from '../components/ReviewSection';
import { fetchReviews } from '../services/apiService';
import './ReviewPage.css';

const ReviewPage = ({ products }) => {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const [filterRating, setFilterRating] = useState('all'); // 'all', 5, 4, 3, 2, 1
  const [dbReviews, setDbReviews] = useState([]);

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product]);

  const loadReviews = async () => {
    const data = await fetchReviews(product.id);
    if (data && data.length > 0) {
      setDbReviews(data);
    } else {
      let defaultReviews = mockReviews.filter(r => r.productId === product.id);
      if (defaultReviews.length === 0) defaultReviews = mockReviews.filter(r => r.productId === 'generic');
      setDbReviews(defaultReviews);
    }
  };

  if (!product) {
    return (
      <div className="review-page-container" style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/" style={{ color: '#d4af37' }}>Quay lại trang chủ</Link>
      </div>
    );
  }

  // Filter reviews
  const filteredReviews = filterRating === 'all' 
    ? dbReviews 
    : dbReviews.filter(r => r.rating === parseInt(filterRating));

  const avgRating = dbReviews.length > 0 
    ? (dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length).toFixed(1)
    : 5.0;

  return (
    <div className="review-page-container">
      <div className="breadcrumb-nav" style={{ paddingTop: '20px', marginBottom: '30px' }}>
        <Link to="/">TRANG CHỦ</Link>
        <span className="separator">/</span>
        <Link to={`/product/${product.id}`}>{product.productName.toUpperCase()}</Link>
        <span className="separator">/</span>
        <span className="current">ĐÁNH GIÁ</span>
      </div>

      <div className="review-page-header">
        <div className="product-summary">
          <img src={product.imageUrl} alt={product.productName} className="review-product-img" />
          <div className="product-info-mini">
            <h2>{product.productName}</h2>
            <p>Tất cả đánh giá từ khách hàng đã mua sản phẩm</p>
          </div>
        </div>

        <div className="review-stats-box">
          <div className="avg-score">
            <span className="score">{avgRating}</span>
            <span className="out-of">/ 5</span>
          </div>
          <div className="stars-large">
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </div>
          <p>{dbReviews.length} Bài đánh giá</p>
        </div>
      </div>

      <div className="review-filter-bar">
        <button 
          className={`filter-btn ${filterRating === 'all' ? 'active' : ''}`}
          onClick={() => setFilterRating('all')}
        >
          Tất cả ({dbReviews.length})
        </button>
        {[5, 4, 3, 2, 1].map(star => {
          const count = dbReviews.filter(r => r.rating === star).length;
          return (
            <button 
              key={star}
              className={`filter-btn ${filterRating === star ? 'active' : ''}`}
              onClick={() => setFilterRating(star)}
            >
              {star} Sao ({count})
            </button>
          )
        })}
      </div>

      <div className="full-review-list">
        {filteredReviews.length === 0 ? (
          <div className="no-reviews">Chưa có đánh giá nào cho phân loại này.</div>
        ) : (
          filteredReviews.map((review, idx) => (
            <div key={review.id || idx} className="review-card-full">
              <div className="review-sidebar">
                <div className="avatar-large">{(review.user || review.userName || 'U').charAt(0)}</div>
                <div className="username-large">{review.user || review.userName}</div>
                {(review.bought || review.isBought) && <div className="verified-badge">✓ Đã mua hàng</div>}
              </div>
              <div className="review-main-content">
                <div className="review-rating-full">
                  <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text-full">{review.content}</p>
                
                {review.rating <= 3 && (
                  <div className="admin-reply">
                    <strong>Phản hồi từ PREMIUM STORE:</strong>
                    <p>Chào bạn, shop xin lỗi vì trải nghiệm chưa hoàn hảo. Shop đã liên hệ để hỗ trợ bạn đổi trả sản phẩm mới theo quy định ạ.</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
