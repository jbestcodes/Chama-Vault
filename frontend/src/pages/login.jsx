import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


const apiUrl = import.meta.env.VITE_API_URL; 

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: credentials, 2: OTP verification
    const [memberId, setMemberId] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/login`, {
                phone,
                password
            });
            
            if (response.data.requiresOTP) {
                setMemberId(response.data.memberId);
                setSuccess(response.data.message);
                setStep(2); // Move to OTP verification step
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

    const handleOTPVerification = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/verify-login`, {
                memberId,
                otp
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role.toLowerCase());
                localStorage.setItem('full_name', response.data.full_name);
                localStorage.setItem('memberId', response.data.memberId);

                // Check AI trial status if available
                if (response.data.trialInfo) {
                    localStorage.setItem('aiTrialInfo', JSON.stringify(response.data.trialInfo));
                }

                navigate('/dashboard');
            }
        } catch (error) {
            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'OTP verification failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resendOTP = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            await axios.post(`${apiUrl}/api/sms-auth/resend-login-otp`, {
                memberId
            });
            setSuccess('New OTP sent to your phone');
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resendPhoneVerification = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/resend-verification-phone`, {
                phone
            });
            setSuccess(response.data.message);
            if (response.data.debug?.verificationCode) {
                setSuccess(`Verification code: ${response.data.debug.verificationCode} (SMS failed, use this code)`);
            }
            setShowVerificationModal(true);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Failed to resend verification code. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const submitVerificationCode = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit verification code');
            return;
        }

        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/verify-phone`, {
                memberId: 'temp', // We'll find by phone
                otp: verificationCode,
                phone: phone
            });
            
            setSuccess('Phone verified successfully! You can now log in.');
            setShowVerificationModal(false);
            setVerificationCode('');
        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Verification failed. Please try again.'
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
                            }}>{step === 1 ? 'Welcome Back!' : 'Enter Verification Code'}</h2>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '16px'
                            }}>{step === 1 ? 'Sign in to your Jaza Nyumba account' : 'Enter the 6-digit code sent to your phone'}</p>
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
                                
                                {/* Show resend verification button if phone verification error */}
                                {(error.includes('verify your phone') || 
                                  error.includes('phone number first') || 
                                  error.includes('Please verify your phone number first') ||
                                  error.includes('pending admin approval') ||
                                  error.includes('membership is pending')) && (
                                    <div style={{ marginTop: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={resendPhoneVerification}
                                            disabled={isLoading}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                opacity: isLoading ? 0.6 : 1
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isLoading) {
                                                    e.target.style.transform = 'translateY(-1px)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isLoading) {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }
                                            }}
                                        >
                                            📱 Resend Verification Code
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div style={{
                                background: '#efe',
                                border: '1px solid #cfc',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                color: '#3c3',
                                fontSize: '14px'
                            }}>
                                ✅ {success}
                            </div>
                        )}

                        {step === 1 ? (
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
                                            Sending Code...
                                        </span>
                                    ) : (
                                        '📱 Send Login Code'
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
                        ) : (
                            <form onSubmit={handleOTPVerification}>
                                {/* OTP Input */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label htmlFor="otp" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        🔢 Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '2px solid #e1e5e9',
                                            borderRadius: '10px',
                                            fontSize: '20px',
                                            textAlign: 'center',
                                            letterSpacing: '5px',
                                            fontWeight: 'bold',
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

                                {/* Verify Button */}
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
                                            Verifying...
                                        </span>
                                    ) : (
                                        '✅ Verify & Sign In'
                                    )}
                                </button>

                                {/* Resend & Back buttons */}
                                <div style={{ textAlign: 'center', gap: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{ 
                                            color: '#667eea',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
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
                                        ← Back to Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        disabled={isLoading}
                                        style={{ 
                                            color: '#667eea',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: isLoading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isLoading) {
                                                e.target.style.color = '#764ba2';
                                                e.target.style.textDecoration = 'underline';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isLoading) {
                                                e.target.style.color = '#667eea';
                                                e.target.style.textDecoration = 'none';
                                            }
                                        }}
                                    >
                                        📱 Resend Code
                                    </button>
                                </div>
                            </form>
                        )}  
                        
                        {/* Phone Verification Help */}
                        <div style={{
                            textAlign: 'center',
                            marginTop: '20px',
                            padding: '16px',
                            border: '1px solid #e1e5e9',
                            borderRadius: '10px',
                            background: '#fafafa'
                        }}>
                            <p style={{
                                margin: '0 0 12px 0',
                                fontSize: '14px',
                                color: '#666',
                                fontWeight: '500'
                            }}>
                                📱 Having trouble logging in?
                            </p>
                            <button
                                type="button"
                                onClick={resendPhoneVerification}
                                disabled={isLoading || !phone}
                                style={{
                                    background: phone ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: (isLoading || !phone) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: (isLoading || !phone) ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading && phone) {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading && phone) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                📲 Resend Phone Verification
                            </button>
                            <p style={{
                                margin: '8px 0 0 0',
                                fontSize: '12px',
                                color: '#888'
                            }}>
                                Enter your phone number above first
                            </p>
                        </div>
                        
                        {/* Register Link */}
                        <p style={{
                            marginTop: '24px',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Don't have an account? <Link to="/register" style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }} onMouseEnter={(e) => {
                                e.target.style.color = '#764ba2';
                                e.target.style.textDecoration = 'underline';
                            }} onMouseLeave={(e) => {
                                e.target.style.color = '#667eea';
                                e.target.style.textDecoration = 'none';
                            }}>Register Now</Link>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Verification Code Modal */}
            {showVerificationModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '40px',
                        maxWidth: '400px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
                            <h2 style={{
                                margin: '0 0 8px 0',
                                color: '#333',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>Enter Verification Code</h2>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px'
                            }}>Enter the 6-digit code sent to {phone}</p>
                        </div>

                        {error && (
                            <div style={{
                                background: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                color: '#c33',
                                fontSize: '14px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                background: '#efe',
                                border: '1px solid #cfc',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                color: '#3c3',
                                fontSize: '14px'
                            }}>
                                ✅ {success}
                            </div>
                        )}

                        <div style={{ marginBottom: '25px' }}>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                maxLength="6"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e5e9',
                                    borderRadius: '10px',
                                    fontSize: '20px',
                                    textAlign: 'center',
                                    letterSpacing: '5px',
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setShowVerificationModal(false);
                                    setVerificationCode('');
                                    setError('');
                                }}
                                style={{
                                    flex: 1,
                                    background: '#f5f5f5',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitVerificationCode}
                                disabled={isLoading || verificationCode.length !== 6}
                                style={{
                                    flex: 2,
                                    background: (isLoading || verificationCode.length !== 6) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: (isLoading || verificationCode.length !== 6) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Login;