import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const apiUrl = import.meta.env.VITE_API_URL; 

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/auth/login`, {
                phone,
                password
            });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role.toLowerCase());
                localStorage.setItem('full_name', response.data.full_name);

                // Redirect ALL users to dashboard after login
                navigate('/dashboard');
            }
        } catch (error) {
            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <div style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '40px',
                        maxWidth: '400px',
                        width: '100%',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease'
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                fontSize: '48px',
                                marginBottom: '10px'
                            }}>🏦</div>
                            <h2 style={{
                                margin: '0 0 8px 0',
                                color: '#333',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }}>Welcome Back!</h2>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '16px'
                            }}>Sign in to your Jaza Nyumba account</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                color: '#c33',
                                fontSize: '14px',
                                animation: 'shake 0.5s ease-in-out'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            {/* Phone Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="phone" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    📱 Phone Number
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #e1e5e9',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        background: '#fafafa',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.background = 'white';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e1e5e9';
                                        e.target.style.background = '#fafafa';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Password Input */}
                            <div style={{ marginBottom: '25px' }}>
                                <label htmlFor="password" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: '#333',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    🔒 Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 45px 12px 16px',
                                            border: '2px solid #e1e5e9',
                                            borderRadius: '10px',
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease',
                                            outline: 'none',
                                            background: '#fafafa',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.background = 'white';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e1e5e9';
                                            e.target.style.background = '#fafafa';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '18px',
                                            color: '#666',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#333';
                                            e.target.style.background = '#f0f0f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = '#666';
                                            e.target.style.background = 'none';
                                        }}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px 20px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '20px',
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <span style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #fff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></span>
                                        Signing in...
                                    </span>
                                ) : (
                                    '🚀 Sign In'
                                )}
                            </button>

                            {/* Forgot Password Link */}
                            <div style={{ textAlign: 'center' }}>
                                <Link 
                                    to="/request-password-reset" 
                                    style={{ 
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = '#764ba2';
                                        e.target.style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = '#667eea';
                                        e.target.style.textDecoration = 'none';
                                    }}
                                >
                                    🤔 Forgot Password?
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;