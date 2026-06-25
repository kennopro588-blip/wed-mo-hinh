import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import './ChatWidget.css';


const ChatWidget = ({ isOpenExternal, setIsOpenExternal }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { text: 'Dạ, em chào anh/chị ạ! Em là nhân viên tư vấn của PREMIUM STORE. Anh/chị đang cần tìm mô hình hay có câu hỏi gì không ạ?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sync internal state with external state if needed
  useEffect(() => {
    if (isOpenExternal !== isOpen) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const toggleChat = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (setIsOpenExternal) setIsOpenExternal(nextState);
  };


  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Gọi API đến Backend
      const response = await fetch('http://localhost:8810/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage.text })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error calling chat API:', error);
      setMessages(prev => [...prev, { text: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau ạ.', sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-widget-container">
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={toggleChat}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>
              <div className="bot-avatar">🤖</div>
              Trợ Lý Tư Vấn
            </h3>
            <button className="close-btn" onClick={toggleChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => {
                        // Check if link is internal (e.g., /product/1)
                        if (href && (href.startsWith('/') || href.includes(window.location.host))) {
                          const path = href.includes(window.location.host) 
                            ? href.split(window.location.host)[1] 
                            : href;
                          return <Link to={path} onClick={() => {
                            // Optionally close chat on link click if desired, 
                            // but usually keeping it open is better for advice
                          }}>{children}</Link>;
                        }
                        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (

                  msg.text
                )}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">Đang trả lời...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={isTyping}
            />
            <button onClick={sendMessage} disabled={isTyping || !inputValue.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
