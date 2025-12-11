import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

function Subscribe() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Paystack configuration
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    
    const plans = {
        monthly: {
            name: 'Monthly AI Access',
            price: 10000, // KES 100 in kobo
            description: 'Full access to AI features and premium support',
            features: [
                'AI Financial Insights',
                'SMS Notifications',
                'Advanced Analytics',
                'Priority Support',
                'Unlimited Groups'
            ]
        },
        weekly: {
            name: 'Weekly AI Access',
            price: 3000, // KES 30 in kobo
            description: 'Weekly access to AI features',
            features: [
                'AI Financial Insights',
                'SMS Notifications',
                'Basic Analytics',
                'Standard Support',
                'Up to 3 Groups'
            ]
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (reference) => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/api/subscriptions/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reference: reference.reference,
                    plan: selectedPlan
                })
            });

            if (response.ok) {
                alert('Subscription activated successfully!');
                navigate('/dashboard');
            } else {
                alert('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please contact support.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentClose = () => {
        setProcessing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!publicKey) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-bold mb-2">Payment Configuration Error</h2>
                    <p>Paystack public key not configured. Please contact support.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const componentProps = {
        email: user?.email || `${user?.phoneNumber}@chamavault.com`,
        amount: plans[selectedPlan].price,
        publicKey,
        text: `Subscribe - KES ${plans[selectedPlan].price / 100}`,
        onSuccess: handlePaymentSuccess,
        onClose: handlePaymentClose,
        currency: 'KES'
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
                    <p className="text-gray-600">Unlock AI features and premium tools for your Chama</p>
                </div>

                {/* Plan Selection */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {Object.entries(plans).map(([key, plan]) => (
                        <div
                            key={key}
                            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                                selectedPlan === key
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPlan(key)}
                        >
                            {key === 'monthly' && (
                                <span className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                                    Most Popular
                                </span>
                            )}
                            
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold">{plan.name}</h3>
                                <input
                                    type="radio"
                                    checked={selectedPlan === key}
                                    onChange={() => setSelectedPlan(key)}
                                    className="h-4 w-4 text-blue-600"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <span className="text-3xl font-bold">KES {plan.price / 100}</span>
                                <span className="text-gray-500">/{key}</span>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{plan.description}</p>
                            
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Payment Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Complete Your Subscription</h3>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Selected Plan:</span>
                            <span className="text-lg font-bold">{plans[selectedPlan].name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Amount:</span>
                            <span className="text-lg font-bold text-green-600">
                                KES {plans[selectedPlan].price / 100}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {!processing ? (
                            <PaystackButton
                                {...componentProps}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            />
                        ) : (
                            <button
                                disabled
                                className="flex-1 bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
                            >
                                Processing...
                            </button>
                        )}
                        
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Secure payment powered by Paystack</p>
                        <p>Your subscription will auto-renew unless cancelled</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Subscribe;