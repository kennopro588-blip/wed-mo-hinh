import React, { useState } from 'react';
import './ContactFloat.css';

const ContactFloat = () => {
    const [isOpen, setIsOpen] = useState(false);

    const phoneNumber = "0372715605";

    return (
        <div 
            className={`contact-float-container ${isOpen ? 'open' : ''}`}
        >
            <div className="contact-options">
                <a href={`tel:${phoneNumber}`} className="contact-option call" title="Gọi ngay">
                    <span className="option-label">Gọi ngay</span>
                    <div className="option-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                    </div>
                </a>
                <a href={`https://zalo.me/${phoneNumber}`} target="_blank" rel="noreferrer" className="contact-option zalo" title="Chat Zalo">
                    <span className="option-label">Zalo</span>
                    <div className="option-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M2.235 11.233c0-4.21 4.373-7.625 9.765-7.625s9.765 3.415 9.765 7.625c0 4.21-4.373 7.625-9.765 7.625-1.042 0-2.045-.125-2.983-.36l-3.327 1.83a.526.526 0 01-.767-.533l.26-2.12c-1.89-1.085-2.953-2.67-2.953-4.442z"/>
                            <text x="7" y="14" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">Z</text>
                        </svg>
                    </div>
                </a>
                <a href="https://www.facebook.com/share/1boVU28nFY/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="contact-option facebook" title="Facebook">
                    <span className="option-label">Facebook</span>
                    <div className="option-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </div>
                </a>
            </div>
            
            <div className="main-contact-btn" onClick={() => setIsOpen(!isOpen)}>
                <div className="btn-icon">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="white">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                </div>
                <span className="btn-text">Liên hệ</span>
            </div>
        </div>
    );
};

export default ContactFloat;
