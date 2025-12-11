import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const SMSPreferences = () => {
    const [preferences, setPreferences] = useState({
        contribution_reminders: true,
        loan_updates: true,
        repayment_reminders: true,
        group_updates: true,
        account_updates: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/members/sms-preferences`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPreferences(response.data.smsPreferences || preferences);
        } catch (error) {
            console.error('Error fetching SMS preferences:', error);
            setError('Failed to load preferences');
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (newPreferences) => {
        setSaving(true);
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${apiUrl}/api/members/sms-preferences`, {
                smsPreferences: newPreferences
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPreferences(newPreferences);
            setSuccess('Preferences updated successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating SMS preferences:', error);
            setError(error.response?.data?.error || 'Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handlePreferenceChange = (key) => {
        const newPreferences = {
            ...preferences,
            [key]: !preferences[key]
        };
        updatePreferences(newPreferences);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>📱</span>
                    SMS Notifications
                </h3>
                <div className="animate-pulse space-y-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const preferenceOptions = [
        {
            key: 'contribution_reminders',
            label: 'Contribution Reminders',
            description: 'Get notified before contribution due dates',
            icon: '💰'
        },
        {
            key: 'loan_updates',
            label: 'Loan Updates',
            description: 'Notifications about loan approvals and rejections',
            icon: '💳'
        },
        {
            key: 'repayment_reminders',
            label: 'Repayment Reminders',
            description: 'Reminders for upcoming loan repayments',
            icon: '⏰'
        },
        {
            key: 'group_updates',
            label: 'Group Updates',
            description: 'General group announcements and updates',
            icon: '👥'
        },
        {
            key: 'account_updates',
            label: 'Account Updates',
            description: 'Important account and security notifications',
            icon: '🔔'
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📱</span>
                SMS Notification Preferences
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                    ✅ {success}
                </div>
            )}

            <div className="space-y-4">
                {preferenceOptions.map(option => (
                    <div key={option.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">{option.icon}</span>
                            <div>
                                <div className="font-medium text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={preferences[option.key]}
                                onChange={() => handlePreferenceChange(option.key)}
                                disabled={saving}
                                className="sr-only"
                                id={`pref-${option.key}`}
                            />
                            <label
                                htmlFor={`pref-${option.key}`}
                                className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                                    saving ? 'opacity-50 cursor-not-allowed' : ''
                                } ${
                                    preferences[option.key] 
                                        ? 'bg-blue-600' 
                                        : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                        preferences[option.key] 
                                            ? 'translate-x-6' 
                                            : 'translate-x-0.5'
                                    } mt-0.5`}
                                ></span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                <strong>Note:</strong> Account security notifications cannot be disabled. 
                OTP and verification messages will always be sent regardless of these settings.
            </div>

            {saving && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Updating preferences...
                </div>
            )}
        </div>
    );
};

export default SMSPreferences;