import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${apiUrl}/api/auth/login`, { // <-- Use backticks here
                phone,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);

                // Redirect ALL users to dashboard after login
                navigate('/dashboard');
            }
        } catch (error) {
            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Login failed. Please try again.'
            );
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '100px' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="phone">Phone Number:</label>
                    <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button type="submit">Login</button>
                    <Link to="/request-password-reset" style={{ fontSize: '0.95em' }}>
                        Forgot Password?
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;