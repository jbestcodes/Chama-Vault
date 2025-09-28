import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- Configuration ---
const BASE_URL = 'http://localhost:5000'; 

// --- Helper Components (Moved inside the same file) ---
const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading AI Insights</h2>
            <p className="text-gray-600">Please wait while we prepare your personalized dashboard...</p>
        </div>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="space-y-6">
            <div className="text-5xl">⚠️</div>
            <div className="space-y-3">
                <h3 className="text-2xl font-bold text-red-700">Connection Error</h3>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
            <button
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
                🔄 Try Again
            </button>
        </div>
    </div>
);

const SmartNudgeCard = ({ nudge }) => (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 mb-8 border border-gray-100">
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                    <span className="text-3xl">💡</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Smart Nudge</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <p className="text-lg text-gray-800 font-medium leading-relaxed">
                    {nudge || "Keep up the great work with your savings! Your consistency is building a strong financial foundation."}
                </p>
            </div>
            <div className="flex justify-between items-center">
                <div className="bg-white rounded-xl p-4 border border-green-100 flex-1">
                    <div className="flex items-center space-x-3">
                        <span className="text-green-600 text-2xl">💪</span>
                        <span className="text-gray-700 font-medium">Personalized encouragement based on your savings pattern</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const SavingsHealthCard = ({ health }) => (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 border border-gray-100 h-full">
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                    <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Savings Health</h3>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-purple-100">
                    <span className="text-xl font-semibold text-gray-800">Health Score</span>
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                        <span className="text-2xl font-bold text-gray-800">{health?.score || '85'}</span>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-2">
                    <p className="font-semibold text-gray-800 text-lg">Status: {health?.status || 'Excellent'}</p>
                    <p className="text-gray-700 font-medium leading-relaxed">
                        {health?.summary || 'Your savings consistency is outstanding! Keep up the excellent work.'}
                    </p>
                </div>
            </div>
            
            <div className="mt-auto">
                <Link to="/analysis/health" className="w-full block text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-2xl text-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105">
                    View Full Health Report
                </Link>
            </div>
        </div>
    </div>
);

const LoanAnalysisCard = ({ analysis }) => (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 border border-gray-100 h-full">
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                    <span className="text-3xl">🏦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Loan Analysis</h3>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
                <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <p className="font-semibold text-gray-800 text-lg">
                            Eligibility: {analysis?.eligibility || 'Qualified'}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800 text-lg">Max Amount:</span>
                            <span className="text-xl font-bold text-blue-700">
                                {analysis?.maxAmount || 'KES 300,000'}
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                    Based on your savings history, you qualify for our premium loan rates with flexible repayment terms.
                </p>
            </div>
            
            <div className="mt-auto">
                <Link to="/analysis/loan" className="w-full block text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
                    Apply for Loan
                </Link>
            </div>
        </div>
    </div>
);

const AIChatbot = ({ chatData, setChatData, sendChatMessage, handleKeyPress }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8">
            <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl">
                    <span className="text-3xl">🤖</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">AI Chat Assistant</h3>
                    <p className="text-xl text-gray-300">Ask questions about savings rules, policies, and get financial advice!</p>
                </div>
            </div>
        </div>
        
        {/* Chat Messages Area */}
        <div className="p-8 h-96 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col space-y-4">
            {chatData.messages.length === 0 ? (
                <div className="text-center space-y-6 mt-8">
                    <p className="text-2xl font-bold text-gray-900">🤖 How can I help you today?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                            "What are the savings rules?",
                            "How do loans work?", 
                            "When can I withdraw money?",
                            "What's the interest rate?"
                        ].map((question, index) => (
                            <button
                                key={index}
                                onClick={() => setChatData(prev => ({ ...prev, currentMessage: question }))}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-6 py-4 rounded-2xl hover:shadow-sm transition-all duration-300 transform hover:scale-105"
                            >
                                <p className="text-blue-800 font-semibold">{question}</p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                chatData.messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-sm ${
                            msg.type === 'user' 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                                : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                            <p className="leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))
            )}
            {chatData.loading && (
                <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border border-gray-200 max-w-xs px-6 py-4 rounded-2xl">
                        <div className="flex space-x-2 items-center">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-gray-600">AI is thinking...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex space-x-4">
                <input
                    type="text"
                    value={chatData.currentMessage}
                    onChange={(e) => setChatData(prev => ({ ...prev, currentMessage: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about savings rules, loan terms, or get financial advice..."
                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 text-lg"
                    disabled={chatData.loading}
                />
                <button
                    onClick={sendChatMessage}
                    disabled={chatData.loading || !chatData.currentMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <span className="hidden sm:inline">Send</span>
                    <span className="sm:hidden">📤</span>
                </button>
            </div>
        </div>
    </div>
);

// --- Main Component ---
function AIDashboard() {
    const [insights, setInsights] = useState({
        nudge: null,
        loanAnalysis: null,
        healthInsight: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [nudgeRes, loanRes, healthRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/ai/financial-nudge`, { headers }),
                axios.get(`${BASE_URL}/api/ai/loan-analysis`, { headers }),
                axios.get(`${BASE_URL}/api/ai/savings-health`, { headers })
            ]);

            setInsights({
                nudge: nudgeRes.data.nudge || 'Keep up the great work! Your savings consistency is 95%.',
                loanAnalysis: loanRes.data.analysis || { eligibility: 'Qualified', maxAmount: 'KES 300,000' },
                healthInsight: healthRes.data.health || { score: 85, status: 'Excellent', summary: 'Your savings pattern is highly consistent.' },
            });
            
        } catch (err) {
            console.error('AI Data fetch error:', err.response?.data || err.message);
            setError('Failed to load personalized AI insights. Please check your network or try again.');
        } finally {
            setLoading(false);
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
            const response = await axios.post(`${BASE_URL}/api/ai/chat`, 
                { question: userMessage },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setChatData(prev => ({
                ...prev,
                messages: [...prev.messages, { type: 'bot', content: response.data.response }],
                loading: false
            }));
        } catch (err) {
            console.error('Chat API error:', err);
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

    // --- Logged-In View ---
    if (isLoggedIn) {
        if (loading) {
            return <LoadingSpinner />;
        }
        
        if (error) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <ErrorMessage message={error} onRetry={fetchAllAIData} />
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                                Your AI Financial Dashboard
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Actionable insights powered by AI to maximize your Chama benefits
                            </p>
                        </div>
                    </div>

                    {/* Primary Insight */}
                    <SmartNudgeCard nudge={insights.nudge} />
                    
                    {/* Secondary Insights Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <SavingsHealthCard health={insights.healthInsight} />
                        <LoanAnalysisCard analysis={insights.loanAnalysis} />
                    </div>
                    
                    {/* AI Chatbot Section */}
                    <AIChatbot 
                        chatData={chatData} 
                        setChatData={setChatData} 
                        sendChatMessage={sendChatMessage} 
                        handleKeyPress={handleKeyPress} 
                    />
                </div>
            </div>
        );
    }

    // --- Logged-Out Preview View ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Hero Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <span className="text-3xl">🤖</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                            AI Financial Assistant
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Unlock the power of artificial intelligence to transform your savings journey with personalized insights and smart recommendations
                        </p>
                    </div>
                </div>

                {/* AI Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Smart Nudge Preview */}
                    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                                    <span className="text-3xl">💡</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Smart Nudge</h3>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 space-y-4">
                                <p className="text-gray-800 font-medium text-lg leading-relaxed">
                                    AI analyzes your savings pattern and gives personalized encouragement to help you save more consistently.
                                </p>
                                <div className="bg-white rounded-xl p-4 border border-green-100">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-green-600">💪</span>
                                        <span className="text-gray-700 font-medium">Get motivated with smart insights about your progress</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Analysis Preview */}
                    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                                    <span className="text-3xl">🏦</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Loan Analysis</h3>
                            </div>
                            
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                                        <p className="font-semibold text-gray-800 text-lg">Check Your Eligibility</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                                        <p className="font-semibold text-gray-800 text-lg">See Maximum Amount</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 font-medium leading-relaxed">
                                    AI calculates your loan eligibility based on your savings history and gives you personalized recommendations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Savings Health Preview */}
                    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 p-8 border border-gray-100">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                                    <span className="text-3xl">📈</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Savings Health</h3>
                            </div>
                            
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-purple-100">
                                    <span className="text-xl font-semibold text-gray-800">Health Score</span>
                                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                                        <span className="text-lg font-bold text-gray-800">0-100</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-2">
                                    <p className="font-semibold text-gray-800 text-lg">Track Your Status</p>
                                    <p className="text-gray-700 font-medium">Get detailed analysis of your savings consistency and performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Chatbot Preview */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-white">AI Chat Assistant</h3>
                                <p className="text-xl text-gray-300">Ask questions about savings rules, policies, and get financial advice!</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Preview */}
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 space-y-8">
                        <div className="text-center space-y-6">
                            <p className="text-2xl font-bold text-gray-900">🤖 What can I help you with?</p>
                            
                            {/* Sample Questions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                                {[
                                    "What are the savings rules?",
                                    "How do loans work?", 
                                    "When can I withdraw money?",
                                    "What's the interest rate?"
                                ].map((question, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 px-6 py-4 rounded-2xl hover:shadow-sm transition-shadow duration-300"
                                    >
                                        <p className="text-blue-800 font-semibold text-lg">{question}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-4xl mx-auto">
                            <h4 className="text-2xl font-bold text-gray-900 mb-6">✨ AI Assistant Features</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    "Explains savings rules and policies",
                                    "Answers questions about loans and interest",
                                    "Provides personalized financial advice",
                                    "24/7 availability for instant help"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full">
                                            <span className="text-green-600 text-lg">✅</span>
                                        </div>
                                        <span className="text-gray-800 font-medium text-lg">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Call to Action - FIXED COLORS */}
                <div className="text-center">
                    <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-200">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                                    <span className="text-5xl">🚀</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Ready to Get Your AI Insights?</h2>
                                <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                                    Login now to access personalized AI recommendations, chat with your financial assistant, and get smart insights about your savings!
                                </p>
                            </div>
                            
                            <div className="space-y-6">
                                <Link to="/login">
                                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-12 py-5 rounded-2xl text-2xl font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        🔑 Login to Access AI Dashboard
                                    </button>
                                </Link>
                                
                                <p className="text-gray-600 text-lg">
                                    Don't have an account? <Link to="/register" className="text-blue-600 font-bold underline hover:text-blue-700 transition-colors">Sign up here</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIDashboard;