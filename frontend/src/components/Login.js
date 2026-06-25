import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/apiService';

const Login = ({ setUser }) => {
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login({ userName, userPassword });
            setUser(data);
            if (data.role && data.role.roleName === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Đăng Nhập</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input 
                        type="password" 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="auth-button">Đăng Nhập</button>
                <div style={{ textAlign: 'right', marginTop: '10px', marginBottom: '15px' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: '#2980b9', textDecoration: 'none' }}>Quên mật khẩu?</Link>
                </div>
                <p>Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link></p>
            </form>
        </div>
    );
};

export default Login;
