import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


const apiUrl = import.meta.env.VITE_API_URL; 

const Register = () => {
    const [full_name, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [group_name, setGroupName] = useState('');
    const [group_type, setGroupType] = useState('savings_and_loans');
    const [role, setRole] = useState('member');
    const [verificationCode, setVerificationCode] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: registration, 2: email verification
    const [memberId, setMemberId] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!agreed) {
            setError('Please agree to the terms and conditions');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/api/auth/register`, {
                full_name,
                phone,
                email,
                password,
                group_name,
                group_type,
                role
            });

            setMemberId(response.data.memberId);
            setSuccess(response.data.message);
            setStep(2); // Move to email verification step
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    const handleEmailVerification = async (e) => {
        e.preventDefault();
        setError('');

        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit verification code');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/api/auth/verify-email`, {
                email,
                verificationCode
            });

            const { status, requiresApproval } = response.data;

            if (requiresApproval) {
                setSuccess('Email verified! Your registration is pending admin approval. You\'ll receive an email once approved.');
            } else {
                setSuccess('Email verified successfully! You can now log in.');
            }
            
            // Redirect to login after successful verification
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.error || 'Email verification failed. Please try again.');
        }
    };

    const resendVerification = async () => {
        setError('');
        try {
            await axios.post(`${apiUrl}/api/auth/resend-verification`, {
                email
            });
            setSuccess('New verification code sent to your email');
        } catch (error) {
            setError('Failed to resend verification code. Please try again.');
        }
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
                        maxWidth: '450px',
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
                            }}>{step === 1 ? 'Create Your Account' : 'Verify Your Email'}</h2>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '16px'
                            }}>{step === 1 ? 'Join Jaza Nyumba and start your financial journey' : 'Enter the 6-digit code sent to your email'}</p>
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
                            <form onSubmit={handleRegister}>
                                {/* Full Name */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="full_name" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        👤 Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        value={full_name}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="e.g., Julie Achon"
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
                                
                                {/* Phone Number */}
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
                                        placeholder="e.g., 0712345678 or +254712345678"
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
                                
                                {/* Email */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="email" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        📧 Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
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
                                
                                {/* Password */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="password" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        🔒 Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Must be at least 6 characters"
                                        required
                                        minLength="6"
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
                                
                                {/* Confirm Password */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="confirmPassword" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        🔒 Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        required
                                        minLength="6"
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
                                
                                {/* Group Name */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label htmlFor="group_name" style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        🏢 Group Name
                                    </label>
                                    <input
                                        type="text"
                                        id="group_name"
                                        value={group_name}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="e.g., Smart Savers Chama"
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
                                
                                {/* Role Selection */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '12px',
                                        color: '#333',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        💼 Role Selection
                                    </label>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            border: role === 'admin' ? '2px solid #667eea' : '2px solid #e1e5e9',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            background: role === 'admin' ? '#f0f4ff' : '#fafafa',
                                            flex: 1
                                        }}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={role === "admin"}
                                                onChange={() => setRole("admin")}
                                                required
                                                style={{ marginRight: '8px' }}
                                            />
                                            <span style={{
                                                color: role === 'admin' ? '#667eea' : '#666',
                                                fontWeight: role === 'admin' ? '600' : '400'
                                            }}>🔑 Admin</span>
                                        </label>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            border: role === 'member' ? '2px solid #667eea' : '2px solid #e1e5e9',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            background: role === 'member' ? '#f0f4ff' : '#fafafa',
                                            flex: 1
                                        }}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="member"
                                                checked={role === "member"}
                                                onChange={() => setRole("member")}
                                                required
                                                style={{ marginRight: '8px' }}
                                            />
                                            <span style={{
                                                color: role === 'member' ? '#667eea' : '#666',
                                                fontWeight: role === 'member' ? '600' : '400'
                                            }}>👥 Member</span>
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Group Type Selection - Only show for admins */}
                                {role === 'admin' && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '12px',
                                            color: '#333',
                                            fontWeight: '500',
                                            fontSize: '14px'
                                        }}>
                                            🏦 Group Type
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                                border: group_type === 'savings_and_loans' ? '2px solid #667eea' : '2px solid #e1e5e9',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                background: group_type === 'savings_and_loans' ? '#f0f4ff' : '#fafafa'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="group_type"
                                                    value="savings_and_loans"
                                                    checked={group_type === "savings_and_loans"}
                                                    onChange={() => setGroupType("savings_and_loans")}
                                                    style={{ marginRight: '12px', marginTop: '2px' }}
                                                />
                                                <div>
                                                    <div style={{
                                                        color: group_type === 'savings_and_loans' ? '#667eea' : '#333',
                                                        fontWeight: group_type === 'savings_and_loans' ? '600' : '500',
                                                        marginBottom: '4px'
                                                    }}>
                                                        💰 Savings & Loans
                                                    </div>
                                                    <div style={{
                                                        color: '#666',
                                                        fontSize: '12px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        Traditional chama for savings, loans, and investments
                                                    </div>
                                                </div>
                                            </label>
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                                border: group_type === 'table_banking' ? '2px solid #667eea' : '2px solid #e1e5e9',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                background: group_type === 'table_banking' ? '#f0f4ff' : '#fafafa'
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="group_type"
                                                    value="table_banking"
                                                    checked={group_type === "table_banking"}
                                                    onChange={() => setGroupType("table_banking")}
                                                    style={{ marginRight: '12px', marginTop: '2px' }}
                                                />
                                                <div>
                                                    <div style={{
                                                        color: group_type === 'table_banking' ? '#667eea' : '#333',
                                                        fontWeight: group_type === 'table_banking' ? '600' : '500',
                                                        marginBottom: '4px'
                                                    }}>
                                                        🔄 Table Banking (Merry-go-round)
                                                    </div>
                                                    <div style={{
                                                        color: '#666',
                                                        fontSize: '12px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        Rotating credit system where members take turns receiving pooled contributions
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Terms & Conditions */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        padding: '12px',
                                        border: '2px solid #e1e5e9',
                                        borderRadius: '10px',
                                        background: '#fafafa',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={() => setAgreed(!agreed)}
                                            required
                                            style={{
                                                marginTop: '2px',
                                                marginRight: '8px',
                                                width: '16px',
                                                height: '16px'
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            lineHeight: '1.4'
                                        }}>
                                            I agree to the <Link to="/terms" target="_blank" style={{
                                                color: '#667eea',
                                                textDecoration: 'none',
                                                fontWeight: '500'
                                            }}>Terms & Conditions</Link> and <Link to="/privacy" target="_blank" style={{
                                                color: '#667eea',
                                                textDecoration: 'none',
                                                fontWeight: '500'
                                            }}>Privacy Policy</Link>
                                        </span>
                                    </label>
                                </div>
                                
                                {/* Register Button */}
                                <button 
                                    type="submit" 
                                    disabled={!agreed}
                                    style={{
                                        width: '100%',
                                        background: !agreed ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '14px 20px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: !agreed ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        marginBottom: '20px',
                                        transform: 'translateY(0)',
                                        boxShadow: !agreed ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (agreed) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (agreed) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                        }
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.outline = 'none';
                                    }}
                                    onMouseDown={(e) => {
                                        e.target.style.background = !agreed ? '#ccc' : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
                                    }}
                                    onMouseUp={(e) => {
                                        e.target.style.background = !agreed ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                    }}
                                    onActive={(e) => {
                                        e.target.style.background = !agreed ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                    }}
                                >
                                    � Register & Send Verification Email
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleEmailVerification}>
                                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '14px',
                                        marginBottom: '8px'
                                    }}>
                                        We sent a 6-digit verification code to:
                                    </p>
                                    <p style={{
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        color: '#667eea'
                                    }}>{email}</p>
                                </div>
                                
                                {/* Verification Code Input */}
                                <div style={{ marginBottom: '25px' }}>
                                    <label htmlFor="verificationCode" style={{
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
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
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
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '14px 20px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        marginBottom: '20px',
                                        transform: 'translateY(0)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.outline = 'none';
                                    }}
                                >
                                    ✅ Verify Email Address
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
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                        }}
                                    >
                                        ← Back to Registration
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resendVerification}
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
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                        }}
                                    >
                                        📱 Resend Code
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        <p style={{
                            marginTop: '24px',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Already have an account? <Link to="/login" style={{
                                color: '#667eea',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }} onMouseEnter={(e) => {
                                e.target.style.color = '#764ba2';
                                e.target.style.textDecoration = 'underline';
                            }} onMouseLeave={(e) => {
                                e.target.style.color = '#667eea';
                                e.target.style.textDecoration = 'none';
                            }}>Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
