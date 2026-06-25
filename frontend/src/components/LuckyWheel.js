import React, { useState, useEffect } from 'react';
import './LuckyWheel.css';
import { addUserCoupon } from '../pages/LoyaltyPoints';

const prizes = [
  { id: 0, text: 'GIẢM 10%', color: '#e74c3c', code: 'LUCKY10' },
  { id: 1, text: 'CHÚC MAY MẮN', color: '#34495e', code: null },
  { id: 2, text: 'GIẢM 50K', color: '#27ae60', code: 'LUCKY50K' },
  { id: 3, text: 'THÊM LƯỢT', color: '#f39c12', code: 'EXTRA' },
  { id: 4, text: 'FREESHIP', color: '#8e44ad', code: 'LUCKYFS' },
  { id: 5, text: 'CHÚC MAY MẮN', color: '#34495e', code: null },
  { id: 6, text: 'GIẢM 100K', color: '#d35400', code: 'LUCKY100K' },
  { id: 7, text: 'GIẢM 5%', color: '#2980b9', code: 'LUCKY5' }
];

const LuckyWheel = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [canSpin, setCanSpin] = useState(true);

  useEffect(() => {
    if (user) {
      const lastSpin = localStorage.getItem(`lastSpin_${user.userName}`);
      if (lastSpin && new Date().toDateString() === new Date(lastSpin).toDateString()) {
        setCanSpin(false);
      }
    }
  }, [user]);

  const spinWheel = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để quay thưởng!");
      return;
    }
    if (!canSpin) {
      alert("Bạn đã hết lượt quay hôm nay. Hãy quay lại vào ngày mai nhé!");
      return;
    }

    setIsSpinning(true);
    setPrize(null);

    // Randomize prize
    const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
    const spinDegrees = 360 * 5; // 5 full rotations
    const sliceAngle = 360 / prizes.length;
    // Calculate the target rotation. We need the selected segment to stop at the top (0 degrees).
    // Segment 0 is at 0-45 deg. Segment 1 is 45-90.
    const targetRotation = spinDegrees + (360 - (randomPrizeIndex * sliceAngle)) - (sliceAngle / 2);

    setRotation(rotation + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setPrize(prizes[randomPrizeIndex]);
      
      if (prizes[randomPrizeIndex].code !== 'EXTRA') {
        setCanSpin(false);
        localStorage.setItem(`lastSpin_${user.userName}`, new Date().toISOString());
        if (prizes[randomPrizeIndex].code) {
          addUserCoupon(user.id || user.userName, prizes[randomPrizeIndex].code, `Quà tặng từ Vòng Quay May Mắn`);
        }
      }
    }, 4000); // matches CSS transition duration
  };

  return (
    <>
      <div className="floating-gift" onClick={() => setShowModal(true)} title="Vòng Quay May Mắn">
        🎁
      </div>

      {showModal && (
        <div className="lucky-wheel-overlay">
          <div className="lucky-wheel-modal">
            <button className="close-wheel" onClick={() => setShowModal(false)}>✕</button>
            <h2 style={{ color: '#f9e07e', marginBottom: '10px' }}>VÒNG QUAY MAY MẮN</h2>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>Mỗi ngày 1 lượt quay. Trúng mã giảm giá cực khủng!</p>

            <div className="wheel-container">
              <div className="wheel-pointer"></div>
              <div className="wheel-center"></div>
              <div 
                className="wheel" 
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {prizes.map((p, i) => {
                  const angle = (360 / prizes.length);
                  const skew = 90 - angle;
                  return (
                    <div 
                      key={p.id} 
                      className="wheel-segment"
                      style={{ 
                        transform: `rotate(${i * angle}deg) skewY(-${skew}deg)`,
                        backgroundColor: p.color
                      }}
                    >
                      <div 
                        className="segment-content"
                        style={{ 
                          transform: `skewY(${skew}deg) rotate(${angle / 2}deg)`
                        }}
                      >
                        {p.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              className="spin-btn" 
              onClick={spinWheel} 
              disabled={isSpinning || !canSpin}
            >
              {isSpinning ? 'ĐANG QUAY...' : (canSpin ? 'QUAY NGAY' : 'HẾT LƯỢT')}
            </button>

            {prize && (
              <div className="prize-result">
                <h3>{prize.code ? '🎉 CHÚC MỪNG BẠN!' : '😢 TIẾC QUÁ!'}</h3>
                <p>Bạn quay vào ô: <strong>{prize.text}</strong></p>
                {prize.code && prize.code !== 'EXTRA' && (
                  <div>
                    <p style={{ marginTop: '10px' }}>Mã giảm giá của bạn:</p>
                    <div className="prize-code">{prize.code}</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#aaa' }}>
                      (Hãy copy mã này và nhập vào bước Thanh toán nhé)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LuckyWheel;
