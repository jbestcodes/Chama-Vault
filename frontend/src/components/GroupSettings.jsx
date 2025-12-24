import React, { useState, useEffect } from 'react';

const GroupSettings = () => {
    const [settings, setSettings] = useState({
        interest_rate: 5.0,
        minimum_loan_savings: 500.00,
        contribution_settings: {
            amount: 1000,
            frequency: 'monthly',
            due_day: 1,
            reminder_days_before: 1,
            penalty_amount: 0,
            grace_period_days: 0,
            auto_reminders: true
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [groupId, setGroupId] = useState(null);
    const [settingsSaved, setSettingsSaved] = useState(false);

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
            setGroupId(userGroupId);
            fetchGroupSettings(userGroupId);
        } else {
            setMessage('Error: Could not find group ID. Please log in again.');
        }
    }, []);

    const fetchGroupSettings = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Backend doesn't need group ID in URL - it gets it from the JWT token
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
                console.error('Error fetching settings:', errorData);
                setMessage(`Error: ${errorData.error || 'Failed to fetch settings'}`);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage('Error loading settings');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            // Backend doesn't need group ID in URL - it gets it from the JWT token
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Settings updated successfully! ✅');
                setSettingsSaved(true);
                // Update local settings with confirmed values
                if (data.interest_rate !== undefined) {
                    setSettings(prev => ({ ...prev, interest_rate: data.interest_rate }));
                }
                if (data.minimum_loan_savings !== undefined) {
                    setSettings(prev => ({ ...prev, minimum_loan_savings: data.minimum_loan_savings }));
                }
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await response.json();
                setMessage(error.error || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage('Error updating settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ddd'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2e7d32' }}>⚙️ Group Financial Settings</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end' }}>
                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        💰 Interest Rate (%)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={settings.interest_rate}
                        onChange={(e) => setSettings({...settings, interest_rate: parseFloat(e.target.value)})}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '120px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        🏦 Min. Savings for Loans (KSh)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="50"
                        value={settings.minimum_loan_savings}
                        onChange={(e) => setSettings({...settings, minimum_loan_savings: parseFloat(e.target.value)})}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '140px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ width: '100%', borderTop: '2px solid #ddd', margin: '16px 0' }}></div>

                <h4 style={{ width: '100%', margin: '0 0 12px 0', color: '#1976d2' }}>📅 Contribution Schedule</h4>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        💵 Contribution Amount (KSh) <span style={{ color: '#999', fontWeight: 'normal' }}>(optional)</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="e.g., 1000"
                        value={settings.contribution_settings?.amount || ''}
                        onChange={(e) => setSettings({
                            ...settings, 
                            contribution_settings: {
                                ...settings.contribution_settings,
                                amount: e.target.value ? parseFloat(e.target.value) : undefined
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '140px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        🔄 Frequency
                    </label>
                    <select
                        value={settings.contribution_settings?.frequency || 'monthly'}
                        onChange={(e) => setSettings({
                            ...settings,
                            contribution_settings: {
                                ...settings.contribution_settings,
                                frequency: e.target.value,
                                due_day: e.target.value === 'monthly' ? 1 : 1 // Reset to default
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '120px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        📆 {settings.contribution_settings?.frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                    </label>
                    <select
                        value={settings.contribution_settings?.due_day || 1}
                        onChange={(e) => setSettings({
                            ...settings,
                            contribution_settings: {
                                ...settings.contribution_settings,
                                due_day: parseInt(e.target.value)
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '140px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {settings.contribution_settings?.frequency === 'weekly' ? (
                            <>
                                <option value={1}>Monday</option>
                                <option value={2}>Tuesday</option>
                                <option value={3}>Wednesday</option>
                                <option value={4}>Thursday</option>
                                <option value={5}>Friday</option>
                                <option value={6}>Saturday</option>
                                <option value={7}>Sunday</option>
                            </>
                        ) : (
                            Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        ⏰ Remind Days Before
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="7"
                        value={settings.contribution_settings?.reminder_days_before || 1}
                        onChange={(e) => setSettings({
                            ...settings,
                            contribution_settings: {
                                ...settings.contribution_settings,
                                reminder_days_before: parseInt(e.target.value)
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '80px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        ⚠️ Penalty Amount (KSh)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="10"
                        value={settings.contribution_settings?.penalty_amount || 0}
                        onChange={(e) => setSettings({
                            ...settings,
                            contribution_settings: {
                                ...settings.contribution_settings,
                                penalty_amount: parseFloat(e.target.value)
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '120px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div>
                    <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#333',
                        marginBottom: '4px'
                    }}>
                        🕐 Grace Period (Days)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="30"
                        value={settings.contribution_settings?.grace_period_days || 0}
                        onChange={(e) => setSettings({
                            ...settings,
                            contribution_settings: {
                                ...settings.contribution_settings,
                                grace_period_days: parseInt(e.target.value)
                            }
                        })}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            minWidth: '80px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: loading ? '#ccc' : '#1976d2',
                        color: 'white',
                        padding: '8px 18px',
                        borderRadius: '4px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                    }}
                >
                    {loading ? 'Updating...' : (settingsSaved ? '✏️ Edit Settings' : '💾 Save Settings')}
                </button>
            </form>

            <div style={{ 
                marginTop: '12px',
                fontSize: '12px',
                color: '#666',
                background: '#f0f0f0',
                padding: '8px',
                borderRadius: '4px'
            }}>
                📊 Policy: Members need KSh {settings.minimum_loan_savings?.toLocaleString() || '0'} savings to qualify for loans at {settings.interest_rate || 5}% interest
            </div>

            {message && (
                <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    ...(message.includes('successfully') 
                        ? { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }
                        : { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
                    )
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default GroupSettings;