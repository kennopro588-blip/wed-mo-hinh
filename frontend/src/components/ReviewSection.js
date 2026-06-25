import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReviews, createReview } from '../services/apiService';
import './ReviewSection.css';

// Mock data for reviews
export const mockReviews = [
  { id: 1, productId: 4, user: 'Minh Tuấn', rating: 5, date: '15/04/2026', content: 'Mô hình cực kỳ chi tiết, nước sơn tĩnh điện rất bóng và đẹp. Đáng đồng tiền bát gạo!', bought: true },
  { id: 2, productId: 4, user: 'Hoàng Long', rating: 5, date: '12/04/2026', content: 'Shop đóng gói cẩn thận. Khớp nối linh hoạt, tạo được nhiều dáng ngầu. Rất hài lòng.', bought: true },
  { id: 3, productId: 4, user: 'Trần Hải', rating: 4, date: '10/04/2026', content: 'Giao hàng nhanh, hộp còn nguyên seal không bị móp méo. Tuy nhiên đèn LED hơi yếu.', bought: true },
  { id: 4, productId: 4, user: 'Lê Phong', rating: 5, date: '05/04/2026', content: 'Hàng chuẩn chính hãng Hot Toys. Base đẹp, phụ kiện đi kèm đầy đủ.', bought: true },
  { id: 5, productId: 4, user: 'Anh Kiệt', rating: 3, date: '01/04/2026', content: 'Sản phẩm tốt nhưng giá hơi cao so với mặt bằng chung. Chờ sale mua sẽ hợp lý hơn.', bought: true },
  // Generic fallback reviews
  { id: 101, productId: 'generic', user: 'Khách hàng VIP', rating: 5, date: '20/04/2026', content: 'Chất lượng tuyệt vời, vượt xa mong đợi. Chắc chắn sẽ ủng hộ shop tiếp.', bought: true },
  { id: 102, productId: 'generic', user: 'Người sưu tầm', rating: 4, date: '18/04/2026', content: 'Hàng đẹp, tuy nhiên thời gian chờ order hơi lâu. Bù lại sản phẩm cực kỳ ưng ý.', bought: true }
];

const ReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [dbReviews, setDbReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '', userName: 'Người dùng ẩn danh' });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    const data = await fetchReviews(productId);
    if (data && data.length > 0) {
      setDbReviews(data);
    } else {
      // Use mock if DB is empty for demo purposes
      let defaultReviews = mockReviews.filter(r => r.productId === productId);
      if (defaultReviews.length === 0) defaultReviews = mockReviews.filter(r => r.productId === 'generic');
      setDbReviews(defaultReviews);
    }
  };

  const avgRating = dbReviews.length > 0 
    ? (dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length).toFixed(1)
    : 5.0;
  
  const previewReviews = dbReviews.slice(0, 2);

  const handleWriteReview = () => {
    // In a real app, check if user is logged in and bought the product
    setShowForm(!showForm);
  };

  const submitReview = async () => {
    if (!newReview.content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      await createReview({
        productId: productId,
        userName: newReview.userName,
        rating: newReview.rating,
        content: newReview.content,
        isBought: true // Mocking verification
      });
      alert("Cảm ơn bạn đã đánh giá!");
      setShowForm(false);
      setNewReview({ rating: 5, content: '', userName: 'Người dùng ẩn danh' });
      loadReviews(); // Refresh from DB
    } catch (error) {
      alert("Lỗi khi gửi đánh giá. Vui lòng kiểm tra kết nối Backend.");
    }
  };

  return (
    <div className="review-section-preview">
      <div className="review-header-compact">
        <h3 className="review-title">ĐÁNH GIÁ SẢN PHẨM</h3>
        <div className="review-summary">
          <div className="stars">
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
          </div>
          <span className="rating-score">{avgRating}/5</span>
          <span className="review-count">({dbReviews.length} đánh giá)</span>
        </div>
        <button className="write-review-btn" onClick={handleWriteReview}>
          {showForm ? 'Hủy' : '✎ Viết đánh giá'}
        </button>
      </div>

      {showForm && (
        <div className="review-form-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          <h4 style={{ color: '#d4af37', marginBottom: '15px' }}>Viết đánh giá của bạn</h4>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tên hiển thị:</label>
            <input type="text" value={newReview.userName} onChange={e => setNewReview({...newReview, userName: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', color: 'white', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Đánh giá (1-5 Sao):</label>
            <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', color: 'white', borderRadius: '4px' }}>
              <option value={5}>5 Sao - Tuyệt vời</option>
              <option value={4}>4 Sao - Tốt</option>
              <option value={3}>3 Sao - Khá</option>
              <option value={2}>2 Sao - Tạm được</option>
              <option value={1}>1 Sao - Kém</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nội dung:</label>
            <textarea rows="3" value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.3)', color: 'white', borderRadius: '4px' }} placeholder="Chia sẻ cảm nhận của bạn về độ chi tiết, màu sơn, khớp nối..."></textarea>
          </div>
          <button onClick={submitReview} style={{ background: '#d4af37', color: 'black', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Gửi Đánh Giá</button>
        </div>
      )}

      <div className="review-list-compact">
        {previewReviews.map((review, idx) => (
          <div key={review.id || idx} className="review-card">
            <div className="review-user-info">
              <div className="avatar">{(review.user || review.userName || 'U').charAt(0)}</div>
              <div>
                <div className="username">{review.user || review.userName}</div>
                {(review.bought || review.isBought) && <div className="verified-badge">✓ Đã mua hàng</div>}
              </div>
            </div>
            <div className="review-rating">
              <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              <span className="review-date">{review.date}</span>
            </div>
            <p className="review-text">{review.content}</p>
          </div>
        ))}
      </div>

      <div className="see-more-container">
        <button 
          className="see-more-btn"
          onClick={() => navigate(`/product/${productId}/reviews`)}
        >
          XEM TẤT CẢ {dbReviews.length} ĐÁNH GIÁ
        </button>
      </div>
    </div>
  );
};

export default ReviewSection;
