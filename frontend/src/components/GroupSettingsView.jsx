import React, { useState, useEffect } from 'react';

const GroupSettingsView = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Get group_id from localStorage or member object
        let userGroupId = localStorage.getItem('group_id');

        // Fallback: try to get from member object
        if (!userGroupId) {
            const memberData = localStorage.getItem('member');
            if (memberData) {
                try {
                    const member = JSON.parse(memberData);
                    userGroupId = member.group_id;
                } catch (e) {
                    console.error('Error parsing member data:', e);
                }
            }
        }

        if (userGroupId) {
            fetchGroupSettings(userGroupId);
        } else {
            setError('Could not find group information.');
            setLoading(false);
        }
    }, []);

    const fetchGroupSettings = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load group settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Error loading group settings');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd',
                textAlign: 'center'
            }}>
                <div style={{ color: '#666' }}>Loading group settings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd'
            }}>
                <div style={{ color: '#d32f2f' }}>⚠️ {error}</div>
            </div>
        );
    }

    if (!settings) {
        return null;
    }

    return (
        <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2e7d32' }}>📋 Group Financial Rules</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '16px' }}>💰 Interest Rate</h4>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        {settings.interest_rate || 5}% per month
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '16px' }}>🏦 Minimum Savings for Loans</h4>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        KSh {settings.minimum_loan_savings?.toLocaleString() || '500'}
                    </p>
                </div>

                {settings.contribution_settings && (
                    <>
                        {settings.contribution_settings.amount && (
                            <div style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '6px',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '16px' }}>💵 Contribution Amount</h4>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                    KSh {settings.contribution_settings.amount.toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#1976d2', fontSize: '16px' }}>📅 Contribution Schedule</h4>
                            <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                {settings.contribution_settings.frequency === 'weekly' ? 'Weekly' : 'Monthly'} on{' '}
                                {settings.contribution_settings.frequency === 'weekly'
                                    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][settings.contribution_settings.due_day - 1]
                                    : settings.contribution_settings.due_day
                                }
                            </p>
                        </div>

                        {settings.contribution_settings.penalty_amount > 0 && (
                            <div style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '6px',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#d32f2f', fontSize: '16px' }}>⚠️ Late Payment Penalty</h4>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>
                                    KSh {settings.contribution_settings.penalty_amount.toLocaleString()}
                                </p>
                            </div>
                        )}

                        {settings.contribution_settings.grace_period_days > 0 && (
                            <div style={{
                                background: 'white',
                                padding: '16px',
                                borderRadius: '6px',
                                border: '1px solid #e0e0e0'
                            }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#ff9800', fontSize: '16px' }}>🕐 Grace Period</h4>
                                <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                    {settings.contribution_settings.grace_period_days} day{settings.contribution_settings.grace_period_days !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#e8f5e8',
                borderRadius: '6px',
                border: '1px solid #c8e6c9'
            }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32', fontWeight: '500' }}>
                    📊 <strong>Loan Qualification:</strong> Members need at least KSh {settings.minimum_loan_savings?.toLocaleString() || '500'} in savings to qualify for loans at {settings.interest_rate || 5}% interest rate.
                </p>
            </div>
        </div>
    );
};

export default GroupSettingsView;