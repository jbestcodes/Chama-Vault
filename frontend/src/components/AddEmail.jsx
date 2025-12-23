import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const AddEmail = ({ phone, onEmailVerified, onCancel }) => {
    const [step, setStep] = useState(1); // 1: Add email, 2: Verify code
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/api/auth/add-email`, {
                phone,
                email
            });

            setSuccess(response.data.message);
            setStep(2); // Move to verification step
        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Failed to add email. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/api/auth/verify-added-email`, {
                phone,
                email,
                verificationCode
            });

            setSuccess(response.data.message);
            setTimeout(() => {
                onEmailVerified();
            }, 1500);
        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Verification failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/api/auth/add-email`, {
                phone,
                email
            });

            setSuccess('Verification code resent to your email');
        } catch (error) {
            setError(
                error.response?.data?.error ||
                'Failed to resend code. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                padding: '40px',
                maxWidth: '450px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                        {step === 1 ? '📧' : '✅'}
                    </div>
                    <h2 style={{
                        margin: '0 0 8px 0',
                        color: '#333',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        {step === 1 ? 'Add Email to Your Account' : 'Verify Your Email'}
                    </h2>
                    <p style={{
                        margin: 0,
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        {step === 1 
                            ? 'Please add an email address to continue' 
                            : `Enter the 6-digit code sent to ${email}`}
                    </p>
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
                        fontSize: '14px'
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
                    /* Add Email Form */
                    <form onSubmit={handleAddEmail}>
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
                                    color: '#333',
                                    backgroundColor: '#fafafa',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e1e5e9';
                                    e.target.style.background = '#fafafa';
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
                            <button
                                type="button"
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    background: '#f5f5f5',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#e5e5e5';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#f5f5f5';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                style={{
                                    flex: 2,
                                    background: (isLoading || !email) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: (isLoading || !email) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isLoading ? 'Sending...' : 'Add Email & Send Code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Verify Email Form */
                    <form onSubmit={handleVerifyEmail}>
                        <div style={{ marginBottom: '25px' }}>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength="6"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e5e9',
                                    borderRadius: '10px',
                                    fontSize: '24px',
                                    textAlign: 'center',
                                    letterSpacing: '8px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    backgroundColor: '#fafafa',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.background = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e1e5e9';
                                    e.target.style.background = '#fafafa';
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    background: '#f5f5f5',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 6}
                                style={{
                                    flex: 2,
                                    background: (isLoading || verificationCode.length !== 6) ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: (isLoading || verificationCode.length !== 6) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    fontSize: '13px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    textDecoration: 'underline',
                                    padding: '8px'
                                }}
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddEmail;
