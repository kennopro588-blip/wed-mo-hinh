import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoyaltyPoints.css';

// ===== Loyalty Points Utility Functions =====
export const getLoyaltyData = (userId) => {
  const key = `loyalty_${userId || 'guest'}`;
  const data = JSON.parse(localStorage.getItem(key) || 'null');
  if (!data) {
    return { points: 0, totalEarned: 0, totalSpent: 0, history: [], claimedTiers: [] };
  }
  if (!data.claimedTiers) data.claimedTiers = []; // For backward compatibility
  return data;
};

export const getUserCoupons = (userId) => {
  const key = `userCoupons_${userId || 'guest'}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
};

export const addUserCoupon = (userId, codeStr, desc) => {
  const key = `userCoupons_${userId || 'guest'}`;
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  if (!current.find(c => c.code === codeStr)) {
    localStorage.setItem(key, JSON.stringify([{ code: codeStr, desc, date: new Date().toLocaleDateString('vi-VN') }, ...current]));
  }
};

export const addPoints = (userId, amount, description) => {
  const key = `loyalty_${userId || 'guest'}`;
  const data = getLoyaltyData(userId);
  const earned = Math.floor(amount / 10000); // 1 điểm / 10,000 VND
  if (earned <= 0) return 0;
  const newData = {
    ...data,
    points: data.points + earned,
    totalEarned: data.totalEarned + earned,
    history: [
      { id: Date.now(), type: 'earn', pts: earned, desc: description, date: new Date().toLocaleDateString('vi-VN') },
      ...data.history.slice(0, 19) // Giữ tối đa 20 giao dịch
    ]
  };
  localStorage.setItem(key, JSON.stringify(newData));
  return earned;
};

export const spendPoints = (userId, amount, description) => {
  const key = `loyalty_${userId || 'guest'}`;
  const data = getLoyaltyData(userId);
  if (data.points < amount) return false;
  
  const newData = {
    ...data,
    points: data.points - amount,
    totalSpent: (data.totalSpent || 0) + amount,
    history: [
      { id: Date.now(), type: 'spend', pts: amount, desc: description, date: new Date().toLocaleDateString('vi-VN') },
      ...data.history.slice(0, 19)
    ]
  };
  localStorage.setItem(key, JSON.stringify(newData));
  return true;
};

export const getTier = (totalEarned) => {
  if (totalEarned >= 5000) return { name: 'Kim Cương', icon: '💎', color: '#00d2ff', next: null, nextAt: 5000 };
  if (totalEarned >= 2000) return { name: 'Vàng', icon: '🥇', color: '#d4af37', next: 'Kim Cương', nextAt: 5000 };
  if (totalEarned >= 500)  return { name: 'Bạc', icon: '🥈', color: '#a8a9ad', next: 'Vàng', nextAt: 2000 };
  return { name: 'Đồng', icon: '🥉', color: '#cd7f32', next: 'Bạc', nextAt: 500 };
};

// ===== Main Component =====
const LoyaltyPoints = ({ user }) => {
  const [data, setData] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);
  const [globalCodes, setGlobalCodes] = useState([]);
  const [exchangeMsg, setExchangeMsg] = useState('');

  const handleClaimRankReward = (tierName, ptsReward, codeStr) => {
    const key = `loyalty_${user.id || user.userName}`;
    const currentData = getLoyaltyData(user.id || user.userName);
    
    // Add points for leveling up
    const newData = {
      ...currentData,
      points: currentData.points + ptsReward,
      totalEarned: currentData.totalEarned + ptsReward,
      claimedTiers: [...currentData.claimedTiers, tierName],
      history: [
        { id: Date.now(), type: 'earn', pts: ptsReward, desc: `Quà thăng hạng ${tierName}`, date: new Date().toLocaleDateString('vi-VN') },
        ...currentData.history.slice(0, 19)
      ]
    };
    localStorage.setItem(key, JSON.stringify(newData));
    setData(newData);
    addUserCoupon(user.id || user.userName, codeStr, `Quà thăng hạng ${tierName}`);
    setMyCoupons(getUserCoupons(user.id || user.userName));
    setExchangeMsg(`🎉 Chúc mừng! Bạn đã nhận quà thăng hạng ${tierName}. Mã code của bạn: ${codeStr}`);
    setTimeout(() => setExchangeMsg(''), 6000);
  };

  const handleExchange = (pts, codeName, codeStr) => {
    if (data.points < pts) {
      setExchangeMsg('❌ Bạn không đủ điểm để đổi mã này!');
      setTimeout(() => setExchangeMsg(''), 3000);
      return;
    }
    const success = spendPoints(user.id || user.userName, pts, `Đổi mã giảm giá: ${codeName}`);
    if (success) {
      setData(getLoyaltyData(user.id || user.userName));
      addUserCoupon(user.id || user.userName, codeStr, `Mua mã từ Cửa hàng điểm`);
      setMyCoupons(getUserCoupons(user.id || user.userName));
      setExchangeMsg(`✅ Đổi thành công! Mã của bạn là: ${codeStr}`);
    }
  };

  useEffect(() => {
    if (user) {
      setData(getLoyaltyData(user.id || user.userName));
      setMyCoupons(getUserCoupons(user.id || user.userName));
      setGlobalCodes(JSON.parse(localStorage.getItem('discountCodes') || '[]'));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="loyalty-page">
        <div className="loyalty-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: 'white' }}>Vui lòng đăng nhập</h2>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>Để xem và sử dụng điểm thưởng của bạn</p>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #d4af37, #f9e07e)',
            color: '#5a3e00', padding: '12px 30px', borderRadius: '30px',
            textDecoration: 'none', fontWeight: 'bold'
          }}>Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tier = getTier(data.totalEarned);
  const nextTierProgress = tier.next
    ? Math.min((data.totalEarned / tier.nextAt) * 100, 100)
    : 100;

  const tiers = [
    { name: 'Đồng', icon: '🥉', cls: 'bronze', req: '0 điểm', minPts: 0 },
    { name: 'Bạc', icon: '🥈', cls: 'silver', req: '500 điểm', minPts: 500 },
    { name: 'Vàng', icon: '🥇', cls: 'gold', req: '2,000 điểm', minPts: 2000 },
    { name: 'Kim Cương', icon: '💎', cls: 'diamond', req: '5,000 điểm', minPts: 5000 },
  ];

  return (
    <div className="loyalty-page">
      <div className="loyalty-container">

        {/* Hero - Points Balance */}
        <div className="loyalty-hero">
          <h2>🎯 Điểm Thưởng Của Bạn</h2>
          <div className="pts-big">{data.points.toLocaleString()}</div>
          <div className="pts-label">điểm tích lũy</div>

          {/* Test button to quickly get points */}
          <button 
            onClick={() => {
              addPoints(user.id || user.userName, 50000000, "Nhận điểm dùng thử");
              setData(getLoyaltyData(user.id || user.userName));
            }}
            style={{ marginTop: '10px', background: '#27ae60', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>
            + Nhận 5000 Điểm Dùng Thử
          </button>

          <div className="loyalty-tier">
            {tier.icon} Hạng {tier.name}
          </div>

          {tier.next && (
            <div className="pts-progress-wrap">
              <div className="pts-progress-label">
                <span>Tiến trình lên hạng {tier.next}</span>
                <span>{data.totalEarned} / {tier.nextAt} điểm</span>
              </div>
              <div className="pts-progress-bar">
                <div className="pts-progress-fill" style={{ width: `${nextTierProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="loyalty-stats">
          <div className="loyalty-stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-val">{data.totalEarned.toLocaleString()}</div>
            <div className="stat-label">Tổng điểm kiếm được</div>
          </div>
          <div className="loyalty-stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-val">{data.points.toLocaleString()}</div>
            <div className="stat-label">Điểm hiện có</div>
          </div>
          <div className="loyalty-stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-val">{data.history.length}</div>
            <div className="stat-label">Giao dịch</div>
          </div>
        </div>

        {/* Tier Levels */}
        <div className="loyalty-section">
          <h3>🏆 Hệ Thống Hạng Thành Viên</h3>
          <div className="tiers-grid">
            {tiers.map(t => (
              <div key={t.name} className={`tier-card ${t.cls} ${data.totalEarned >= t.minPts ? 'active' : ''}`}>
                <div className="tier-icon">{t.icon}</div>
                <div className="tier-name">{t.name}</div>
                <div className="tier-req">{t.req}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rank Up Rewards */}
        <div className="loyalty-section">
          <h3>🎁 Quà Tặng Thăng Hạng</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>Lên hạng càng cao, quà tặng càng giá trị. Đạt mốc là nhận quà ngay!</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {tiers.filter(t => t.minPts > 0).map(t => {
              const isReached = data.totalEarned >= t.minPts;
              const isClaimed = data.claimedTiers.includes(t.name);
              
              let rewardPts = 0;
              let rewardCode = '';
              if (t.name === 'Bạc') { rewardPts = 1000; rewardCode = 'RANKBAC'; }
              if (t.name === 'Vàng') { rewardPts = 3000; rewardCode = 'RANKVANG'; }
              if (t.name === 'Kim Cương') { rewardPts = 10000; rewardCode = 'RANKKIMCUONG'; }

              return (
                <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '10px', border: isReached && !isClaimed ? '1px solid #27ae60' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{t.icon}</div>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: isReached ? '#f9e07e' : 'white' }}>Đạt Hạng {t.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>Phần thưởng: <strong style={{color: '#27ae60'}}>+{rewardPts.toLocaleString()} Điểm</strong> & Mã giảm giá VIP</p>
                    </div>
                  </div>
                  <div>
                    {isClaimed ? (
                      <span style={{ color: '#aaa', fontWeight: 'bold' }}>✓ Đã Nhận</span>
                    ) : isReached ? (
                      <button 
                        onClick={() => handleClaimRankReward(t.name, rewardPts, rewardCode)}
                        style={{ background: '#27ae60', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', animation: 'bounce 2s infinite' }}>
                        🎁 Nhận Quà
                      </button>
                    ) : (
                      <span style={{ color: '#555', fontSize: '0.85rem' }}>Còn {t.minPts - data.totalEarned} điểm</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How it works */}
        <div className="loyalty-section">
          <h3>ℹ️ Cách Tích Điểm</h3>
          <div className="how-it-works">
            <div className="hiw-item">
              <div className="hiw-icon">🛒</div>
              <div className="hiw-title">Mua hàng</div>
              <div className="hiw-desc">Cứ 10,000 VNĐ = 1 điểm thưởng</div>
            </div>
            <div className="hiw-item">
              <div className="hiw-icon">⭐</div>
              <div className="hiw-title">Tích điểm</div>
              <div className="hiw-desc">Điểm cộng tự động sau khi thanh toán thành công</div>
            </div>
            <div className="hiw-item">
              <div className="hiw-icon">🎁</div>
              <div className="hiw-title">Ưu đãi</div>
              <div className="hiw-desc">Hạng càng cao, ưu đãi càng nhiều</div>
            </div>
          </div>
        </div>

        {/* Cửa hàng đổi điểm */}
        <div className="loyalty-section">
          <h3>🛍️ Cửa Hàng Đổi Điểm</h3>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>Dùng điểm tích lũy của bạn để đổi lấy các mã giảm giá siêu hot.</p>
          
          {exchangeMsg && (
            <div style={{ padding: '10px', background: exchangeMsg.includes('✅') ? '#e8f5e9' : '#ffebee', color: exchangeMsg.includes('✅') ? '#27ae60' : '#e74c3c', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>
              {exchangeMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #d4af37', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎫</div>
              <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>Giảm 50.000Đ</h4>
              <p style={{ color: '#f9e07e', fontWeight: 'bold', margin: '0 0 15px 0' }}>500 Điểm</p>
              <button 
                onClick={() => handleExchange(500, 'Giảm 50.000Đ', 'POINT50')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f9e07e)', color: '#5a3e00', border: 'none', padding: '8px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={data.points < 500}
              >
                Đổi Ngay
              </button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #d4af37', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎫</div>
              <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>Giảm 100.000Đ</h4>
              <p style={{ color: '#f9e07e', fontWeight: 'bold', margin: '0 0 15px 0' }}>1000 Điểm</p>
              <button 
                onClick={() => handleExchange(1000, 'Giảm 100.000Đ', 'POINT100')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f9e07e)', color: '#5a3e00', border: 'none', padding: '8px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={data.points < 1000}
              >
                Đổi Ngay
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #d4af37', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎫</div>
              <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>Giảm 200.000Đ</h4>
              <p style={{ color: '#f9e07e', fontWeight: 'bold', margin: '0 0 15px 0' }}>2000 Điểm</p>
              <button 
                onClick={() => handleExchange(2000, 'Giảm 200.000Đ', 'POINT200')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f9e07e)', color: '#5a3e00', border: 'none', padding: '8px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={data.points < 2000}
              >
                Đổi Ngay
              </button>
            </div>
          </div>
        </div>

        {/* My Saved Coupons */}
        <div className="loyalty-section">
          <h3>🎟️ Kho Voucher Của Tôi</h3>
          {myCoupons.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '15px 0' }}>
              Bạn chưa có mã giảm giá nào. Hãy đổi điểm hoặc quay thưởng để nhận mã!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {myCoupons.map((c, idx) => {
                const globalCode = globalCodes.find(gc => gc.code === c.code);
                const remaining = globalCode ? Math.max(0, globalCode.maxUses - (globalCode.used || 0)) : 'Không rõ';
                const expiry = globalCode && globalCode.expiry ? globalCode.expiry : 'Không giới hạn';
                const isExpired = globalCode && globalCode.expiry && new Date(globalCode.expiry) < new Date();
                const isMaxed = remaining === 0;
                
                return (
                  <div key={idx} style={{ 
                    background: isExpired || isMaxed ? 'rgba(0,0,0,0.5)' : 'linear-gradient(135deg, rgba(39,174,96,0.1), rgba(46,204,113,0.2))', 
                    border: isExpired || isMaxed ? '1px dashed #555' : '1px dashed #27ae60', 
                    borderRadius: '10px', padding: '15px', position: 'relative',
                    opacity: isExpired || isMaxed ? 0.6 : 1
                  }}>
                    <div style={{ fontWeight: 'bold', color: isExpired || isMaxed ? '#888' : 'white', fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '1px', marginBottom: '5px' }}>
                      {c.code}
                    </div>
                    <div style={{ color: isExpired || isMaxed ? '#666' : '#f9e07e', fontSize: '0.85rem', marginBottom: '10px' }}>{c.desc}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ color: '#aaa', fontSize: '0.75rem' }}>
                        <div>Lượt còn: <strong style={{ color: isMaxed ? '#e74c3c' : '#27ae60' }}>{remaining}</strong></div>
                        <div style={{ marginTop: '3px' }}>HSD: <strong style={{ color: isExpired ? '#e74c3c' : '#ccc' }}>{isExpired ? 'Đã hết hạn' : expiry}</strong></div>
                      </div>
                      
                      {!isExpired && !isMaxed && (
                        <button 
                          onClick={() => { navigator.clipboard.writeText(c.code); alert('Đã copy mã: ' + c.code); }}
                          style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Copy
                        </button>
                      )}
                      {(isExpired || isMaxed) && (
                        <span style={{ fontSize: '0.8rem', color: '#e74c3c', fontWeight: 'bold' }}>{isMaxed ? 'HẾT LƯỢT' : 'HẾT HẠN'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="loyalty-section">
          <h3>📜 Lịch Sử Điểm Thưởng</h3>
          {data.history.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>
              Chưa có giao dịch nào. Hãy mua sắm để tích điểm! 🛍️
            </p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mô tả</th>
                  <th>Điểm</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map(h => (
                  <tr key={h.id}>
                    <td>{h.desc}</td>
                    <td className={h.type === 'earn' ? 'pts-earned' : 'pts-spent'}>
                      {h.type === 'earn' ? '+' : '-'}{h.pts} điểm
                    </td>
                    <td>{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{
            background: 'linear-gradient(135deg, #d4af37, #f9e07e)',
            color: '#5a3e00', padding: '12px 30px', borderRadius: '30px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem'
          }}>🛒 Tiếp tục mua sắm</Link>
        </div>

      </div>
    </div>
  );
};

export default LoyaltyPoints;
