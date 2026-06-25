import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/apiService';

const Register = () => {
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = {
            userName,
            userPassword,
            active: 1,
            userDetails: {
                firstName,
                lastName,
                email
            }
        };
        try {
            await register(userData);
            navigate('/login');
        } catch (err) {
            setError('Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Đăng Ký Tài Khoản</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Họ</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Tên</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <button type="submit" className="auth-button">Đăng Ký</button>
                <p>Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link></p>
            </form>
        </div>
    );
};

export default Register;
