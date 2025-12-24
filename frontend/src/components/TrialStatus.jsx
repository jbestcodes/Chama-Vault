import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const TrialStatus = () => {
    const navigate = useNavigate();
    const [trialInfo, setTrialInfo] = useState(null);
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTrialAndSubscriptionStatus();
    }, []);

    const fetchTrialAndSubscriptionStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Check localStorage first for immediate UI update
            const memberData = localStorage.getItem('member');
            if (memberData) {
                const member = JSON.parse(memberData);
                if (member.has_active_subscription && new Date() < new Date(member.subscription_expires)) {
                    setSubscriptionInfo({
                        hasActiveSubscription: true,
                        plan: member.subscription_plan || 'premium',
                        frequency: member.subscription_plan === 'weekly' ? 'weekly' : 'monthly',
                        expiresAt: member.subscription_expires
                    });
                }
            }
            
            // Try to get AI trial status
            try {
                const trialResponse = await axios.get(`${apiUrl}/api/ai/trial-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTrialInfo(trialResponse.data);
            } catch (trialError) {
                // If trial endpoint doesn't exist, create local trial info from localStorage
                const storedTrialInfo = localStorage.getItem('aiTrialInfo');
                if (storedTrialInfo) {
                    setTrialInfo(JSON.parse(storedTrialInfo));
                }
            }

            // Get subscription info from API (this will override localStorage if API is available)
            try {
                const subResponse = await axios.get(`${apiUrl}/api/subscriptions/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubscriptionInfo(subResponse.data);
            } catch (subError) {
                // Keep localStorage data if API fails
                console.log('Using localStorage subscription data');
            }

        } catch (error) {
            console.error('Error fetching trial/subscription status:', error);
            setError('Failed to load subscription status');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-blue-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-blue-100 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
            </div>
        );
    }

    // Show AI trial status if user is in trial
    if (trialInfo?.inTrial) {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <h3 className="font-semibold text-purple-900">AI Trial Active</h3>
                </div>
                <p className="text-purple-700 text-sm mb-2">
                    You're enjoying your free 2-week AI assistant trial!
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600">
                        {trialInfo.daysLeft} days remaining
                    </span>
                    <button
                        onClick={() => window.open('/subscribe', '_blank')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors"
                    >
                        Subscribe Now
                    </button>
                </div>
                {trialInfo.daysLeft <= 3 && (
                    <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-orange-800 text-xs">
                        ⚠️ Your trial expires soon! Subscribe to continue using AI features.
                    </div>
                )}
            </div>
        );
    }

    // Show subscription status if user has active subscription
    if (subscriptionInfo?.hasActiveSubscription) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💎</span>
                    <h3 className="font-semibold text-green-900">Premium Active</h3>
                </div>
                <p className="text-green-700 text-sm mb-2">
                    Plan: {subscriptionInfo.plan} ({subscriptionInfo.frequency})
                </p>
                <div className="text-sm text-green-600">
                    <p>Expires: {new Date(subscriptionInfo.expiresAt).toLocaleDateString()}</p>
                    {subscriptionInfo.usage && (
                        <p className="mt-1">
                            SMS sent this month: {subscriptionInfo.usage.sms_sent_this_month}/{subscriptionInfo.usage.sms_limit}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Show upgrade prompt if no trial or subscription
    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-semibold text-yellow-900">Upgrade to Premium</h3>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
                Get AI insights, SMS notifications, and advanced features!
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => navigate('/subscribe')}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#d97706',
                        color: 'white',
                        fontSize: '14px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b45309'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#d97706'}
                >
                    View Plans
                </button>
                <button
                    onClick={() => navigate('/ai-dashboard')}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #fcd34d',
                        backgroundColor: 'transparent',
                        color: '#92400e',
                        fontSize: '14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fef3c7';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                    }}
                >
                    Try AI Free
                </button>
            </div>
        </div>
    );
};

export default TrialStatus;