import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AIDashboard() {
    const [aiData, setAiData] = useState({
        nudge: '',
        loanAnalysis: null,
        healthInsight: null,
        loading: true,
        error: null
    });
    const [chatData, setChatData] = useState({
        messages: [],
        currentMessage: '',
        loading: false
    });

    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        if (isLoggedIn) {
            fetchAllAIData();
        }
    }, [isLoggedIn]);

    const fetchAllAIData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all AI insights in parallel
            const [nudgeRes, loanRes, healthRes] = await Promise.all([
                axios.get('http://localhost:5000/api/ai/financial-nudge', { headers }),
                axios.get('http://localhost:5000/api/ai/loan-analysis', { headers }),
                axios.get('http://localhost:5000/api/ai/savings-health', { headers })
            ]);

            setAiData({
                nudge: nudgeRes.data.nudge,
                loanAnalysis: loanRes.data.analysis,
                healthInsight: healthRes.data.health,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('AI Data fetch error:', error);
            setAiData(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load AI insights. Please make sure you\'re logged in.'
            }));
        }
    };

    const sendChatMessage = async () => {
        if (!chatData.currentMessage.trim()) return;

        const userMessage = chatData.currentMessage;
        setChatData(prev => ({
            ...prev,
            messages: [...prev.messages, { type: 'user', content: userMessage }],
            currentMessage: '',
            loading: true
        }));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/ai/chat', 
                { question: userMessage },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setChatData(prev => ({
                ...prev,
                messages: [...prev.messages, { type: 'bot', content: response.data.response }],
                loading: false
            }));
        } catch (error) {
            setChatData(prev => ({
                ...prev,
                messages: [...prev.messages, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }],
                loading: false
            }));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            🤖 AI Financial Assistant
                        </h1>
                        <p className="text-gray-700 text-lg">
                            Smart insights powered by AI to boost your savings journey
                        </p>
                    </div>

                    {/* AI Features Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        
                        {/* Smart Nudge Feature */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 rounded-full p-3 mr-4">
                                    <span className="text-2xl">💡</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Smart Nudge</h3>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-gray-800 mb-3 font-medium">
                                    AI analyzes your savings pattern and gives personalized encouragement to help you save more consistently.
                                </p>
                                <div className="bg-green-100 rounded-lg p-3">
                                    <p className="text-sm text-gray-700">
                                        💪 Get motivated with smart insights about your progress
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loan Analysis Feature */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 rounded-full p-3 mr-4">
                                    <span className="text-2xl">🏦</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Loan Analysis</h3>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                <div className="bg-blue-100 rounded-lg p-3">
                                    <p className="font-semibold text-gray-800">Check Your Eligibility</p>
                                </div>
                                <div className="bg-blue-100 rounded-lg p-3">
                                    <p className="font-semibold text-gray-800">See Maximum Amount</p>
                                </div>
                                <p className="text-sm text-gray-700">AI calculates your loan eligibility based on your savings history and gives you personalized recommendations.</p>
                            </div>
                        </div>

                        {/* Savings Health Feature */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-100 rounded-full p-3 mr-4">
                                    <span className="text-2xl">📈</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Savings Health</h3>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-gray-800">Health Score</span>
                                    <div className="bg-purple-100 rounded-full px-4 py-2">
                                        <span className="text-xl font-bold text-gray-800">0-100</span>
                                    </div>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-3">
                                    <p className="font-semibold mb-2 text-gray-800">Track Your Status</p>
                                    <p className="text-sm text-gray-700">Get detailed analysis of your savings consistency and performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Chatbot Preview */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-12">
                        {/* Header */}
                        <div className="bg-gray-900 p-6">
                            <div className="flex items-center">
                                <div className="bg-gray-700 rounded-full p-3 mr-4">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-white">AI Chat Assistant</h3>
                                    <p className="text-gray-300">Ask questions about savings rules, policies, and get financial advice!</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Preview */}
                        <div className="p-6 bg-gray-50">
                            <div className="space-y-4 mb-6">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-800 mb-4">🤖 What can I help you with?</p>
                                </div>
                                
                                {/* Sample Questions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        "What are the savings rules?",
                                        "How do loans work?", 
                                        "When can I withdraw money?",
                                        "What's the interest rate?"
                                    ].map((question, index) => (
                                        <div
                                            key={index}
                                            className="bg-blue-100 border border-blue-200 px-4 py-3 rounded-lg text-center"
                                        >
                                            <p className="text-blue-800 font-medium text-sm">{question}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3">✨ AI Assistant Features:</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <span className="text-green-600 mr-2">✅</span>
                                        <span className="text-gray-800">Explains savings rules and policies</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-600 mr-2">✅</span>
                                        <span className="text-gray-800">Answers questions about loans and interest</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-600 mr-2">✅</span>
                                        <span className="text-gray-800">Provides personalized financial advice</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-600 mr-2">✅</span>
                                        <span className="text-gray-800">24/7 availability for instant help</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Call to Action */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                            <div className="mb-6">
                                <div className="text-5xl mb-4">🚀</div>
                                <h2 className="text-2xl font-bold mb-4 text-white">Ready to Get Your AI Insights?</h2>
                                <p className="text-lg text-gray-100 mb-6">
                                    Login now to access personalized AI recommendations, chat with your financial assistant, and get smart insights about your savings!
                                </p>
                            </div>
                            
                            <Link to="/login">
                                <button className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full text-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    🔑 Login to Access AI Dashboard
                                </button>
                            </Link>
                            
                            <div className="mt-4">
                                <p className="text-gray-200 text-sm">
                                    Don't have an account? <Link to="/register" className="text-white font-semibold underline hover:text-gray-100">Sign up here</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If logged in, redirect or show logged-in message
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                <div className="text-4xl mb-4">🤖</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Dashboard</h1>
                <p className="text-gray-700 mb-6">Full AI functionality will be implemented here for logged-in users.</p>
                <div className="space-y-3">
                    <Link to="/dashboard" className="block">
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Go to Dashboard
                        </button>
                    </Link>
                    <Link to="/my-profile" className="block">
                        <button className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                            Go to Profile
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AIDashboard;