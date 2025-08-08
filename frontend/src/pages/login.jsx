
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                phone,
                password
            });

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('role', response.data.role);
                    navigate('/dashboard'); // Redirect to dashboard on successful login
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
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
                    <button type="submit" style={{ marginTop: '20px' }}>Login</button>
                </form>
            </div>
        );
    }


export default Login;