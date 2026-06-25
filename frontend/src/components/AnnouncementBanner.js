import React, { useState, useEffect } from 'react';
import './AnnouncementBanner.css';

const AnnouncementBanner = () => {
    const [visible, setVisible] = useState(false);
    const [sliding, setSliding] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Read announcements list from localStorage
        let activeAnnouncement = null;
        try {
            const announcementsList = JSON.parse(localStorage.getItem('announcements') || '[]');
            activeAnnouncement = announcementsList.find(a => a.active);
            
            // Fallback for older single-item storage
            if (!activeAnnouncement) {
                const oldAnnouncement = JSON.parse(localStorage.getItem('announcement') || 'null');
                if (oldAnnouncement && oldAnnouncement.active) {
                    activeAnnouncement = oldAnnouncement;
                }
            }
        } catch (e) {
            console.error("Error parsing announcements", e);
        }

        if (!activeAnnouncement || !activeAnnouncement.text) return;

        setMessage(activeAnnouncement);

        // Slide in after 500ms
        const showTimer = setTimeout(() => {
            setVisible(true);
            setSliding(true);
        }, 500);

        return () => {
            clearTimeout(showTimer);
        };
    }, []);

    const handleClose = () => {
        setSliding(false);
        setTimeout(() => setVisible(false), 600);
    };

    if (!visible || !message) return null;

    const typeStyles = {
        sale:    { bg: 'linear-gradient(90deg, #e74c3c, #c0392b)', icon: '🔥' },
        new:     { bg: 'linear-gradient(90deg, #2c3e50, #d4af37)',  icon: '✨' },
        info:    { bg: 'linear-gradient(90deg, #2980b9, #1abc9c)',  icon: '📢' },
        warning: { bg: 'linear-gradient(90deg, #e67e22, #f39c12)', icon: '⚠️' },
    };
    const style = typeStyles[message.type] || typeStyles.info;

    return (
        <div
            className={`announcement-bar ${sliding ? 'slide-in' : 'slide-out'}`}
            style={{ background: style.bg }}
        >
            <div className="announcement-inner">
                <div className="announcement-content">
                    <span className="announcement-icon">{style.icon}</span>
                    <span className="announcement-text">{message.text}</span>
                    {message.link && (
                        <a className="announcement-cta" href={message.link}>
                            {message.linkLabel || 'Xem ngay →'}
                        </a>
                    )}
                </div>
            </div>
            <button className="announcement-close" onClick={handleClose}>✕</button>
        </div>
    );
};

export default AnnouncementBanner;
