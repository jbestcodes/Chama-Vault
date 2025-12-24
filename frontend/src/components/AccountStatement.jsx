import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountStatement = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/statements/history`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setHistory(response.data.statements || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleRequestStatement = async () => {
        if (!window.confirm('This will charge KSh 10 to your payment method. Continue?')) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/statements/request`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Redirect to Paystack payment page
                window.location.href = response.data.payment_url;
            } else {
                setMessage('Failed to initialize payment. Please try again.');
            }
        } catch (error) {
            console.error('Error requesting statement:', error);
            setMessage(error.response?.data?.error || 'Failed to request statement');
        } finally {
            setLoading(false);
        }
    };

    // Check for payment callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const statementPayment = urlParams.get('statement_payment');
        const reference = urlParams.get('reference');

        if (statementPayment === 'success' && reference) {
            verifyPayment(reference);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const verifyPayment = async (reference) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/statements/verify/${reference}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setMessage(`✅ ${response.data.message}`);
                fetchHistory(); // Refresh history
            } else {
                setMessage('❌ Payment verification failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            setMessage('❌ ' + (error.response?.data?.error || 'Payment verification failed'));
        }
    };

    return (
        <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Account Statement
            </h3>

            <div style={{
                background: '#f0f7ff',
                border: '1px solid #b3d9ff',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
            }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>What's Included:</h4>
                <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.8' }}>
                    <li>💰 Complete savings history</li>
                    <li>🏦 All loans and repayments</li>
                    <li>🎯 Milestone progress tracking</li>
                    <li>💚 Account health score (0-100)</li>
                    <li>📈 Financial summary and insights</li>
                </ul>
                <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Statement will be sent to your registered email address.
                </p>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div>
                    <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        Cost: <span style={{ color: '#10b981' }}>KSh 10</span>
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                        One-time payment via Mpesa
                    </p>
                </div>
                <button
                    onClick={handleRequestStatement}
                    disabled={loading}
                    style={{
                        background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    {loading ? '⏳ Processing...' : '📥 Request Statement'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    ...(message.includes('✅') 
                        ? { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }
                        : { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
                    )
                }}>
                    {message}
                </div>
            )}

            {/* Statement History */}
            <div style={{ marginTop: '24px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>📜 Recent Statements</h4>
                
                {loadingHistory ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Loading history...</p>
                ) : history.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No statements requested yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.map((stmt) => (
                            <div
                                key={stmt.id}
                                style={{
                                    background: '#f9fafb',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}
                            >
                                <div>
                                    <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                        {new Date(stmt.request_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {stmt.email_sent_to && (
                                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                                            Sent to: {stmt.email_sent_to}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        ...(stmt.payment_status === 'sent' 
                                            ? { background: '#d4edda', color: '#155724' }
                                            : stmt.payment_status === 'paid'
                                            ? { background: '#cce5ff', color: '#004085' }
                                            : stmt.payment_status === 'failed'
                                            ? { background: '#f8d7da', color: '#721c24' }
                                            : { background: '#fff3cd', color: '#856404' }
                                        )
                                    }}>
                                        {stmt.payment_status === 'sent' ? '✅ Sent' :
                                         stmt.payment_status === 'paid' ? '💳 Paid' :
                                         stmt.payment_status === 'failed' ? '❌ Failed' :
                                         '⏳ Pending'}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                                        KSh {stmt.amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountStatement;
