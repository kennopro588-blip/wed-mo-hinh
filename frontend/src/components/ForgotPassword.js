import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../services/apiService';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email.includes('@')) {
            setError('Vui lòng nhập một địa chỉ email hợp lệ.');
            return;
        }
        
        setLoading(true);
        try {
            await forgotPassword(email);
            setMessage(`Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư (kể cả mục Spam).`);
            setStep(2);
        } catch (err) {
            setError(err.message || 'Không thể gửi mã. Vui lòng kiểm tra lại email.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (otp.length < 6) {
            setError('Mã OTP phải có ít nhất 6 chữ số.');
            return;
        }
        
        setLoading(true);
        try {
            await verifyOtp(email, otp);
            setMessage('Xác thực thành công. Vui lòng nhập mật khẩu mới.');
            setStep(3);
        } catch (err) {
            setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, newPassword);
            setMessage('Khôi phục mật khẩu thành công!');
            setStep(4);
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fp-container">
            <div className="fp-card">
                <div className="fp-header">
                    <h2>Quên Mật Khẩu</h2>
                    <p>Khôi phục quyền truy cập vào tài khoản của bạn</p>
                </div>

                {/* Step Indicators */}
                <div className="fp-steps">
                    {['Email', 'OTP', 'Mật khẩu', 'Xong'].map((label, i) => (
                        <div key={i} className={`fp-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                            <div className="fp-step-dot">{step > i + 1 ? '✓' : i + 1}</div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                {error && <div className="fp-alert fp-error">❌ {error}</div>}
                {message && <div className="fp-alert fp-success">✅ {message}</div>}

                {/* Bước 1: Nhập Email */}
                {step === 1 && (
                    <form className="fp-form" onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <label>Địa chỉ Email đã đăng ký</label>
                            <input 
                                type="email" 
                                placeholder="Ví dụ: example@gmail.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-button fp-btn" disabled={loading}>
                            {loading ? <span className="fp-spinner"></span> : '📧 Gửi mã xác thực'}
                        </button>
                    </form>
                )}

                {/* Bước 2: Nhập OTP */}
                {step === 2 && (
                    <form className="fp-form" onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label>Mã OTP (6 chữ số)</label>
                            <input 
                                type="text" 
                                placeholder="Nhập mã 6 chữ số"
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                                required 
                                maxLength="6"
                                style={{ letterSpacing: '10px', fontSize: '1.4rem', textAlign: 'center' }}
                            />
                        </div>
                        <button type="submit" className="auth-button fp-btn" disabled={loading}>
                            {loading ? <span className="fp-spinner"></span> : '🔍 Xác nhận mã'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button type="button" className="fp-text-btn" onClick={handleSendOTP} disabled={loading}>
                                Gửi lại mã
                            </button>
                            {' · '}
                            <button type="button" className="fp-text-btn" onClick={() => setStep(1)}>Sửa email</button>
                        </div>
                    </form>
                )}

                {/* Bước 3: Đặt lại Mật Khẩu */}
                {step === 3 && (
                    <form className="fp-form" onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input 
                                type="password" 
                                placeholder="Tối thiểu 6 ký tự"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu</label>
                            <input 
                                type="password" 
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-button fp-btn" disabled={loading}>
                            {loading ? <span className="fp-spinner"></span> : '🔒 Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Bước 4: Thành công */}
                {step === 4 && (
                    <div className="fp-success-view">
                        <div className="fp-icon-success">✓</div>
                        <h3>Hoàn tất!</h3>
                        <p>Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập.</p>
                        <button className="auth-button fp-btn" onClick={() => navigate('/login')}>
                            Quay lại trang Đăng Nhập
                        </button>
                    </div>
                )}

                {step < 4 && (
                    <div className="fp-footer">
                        <p>Nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
