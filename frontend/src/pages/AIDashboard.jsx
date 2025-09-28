import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        fetchAllAIData();
    }, []);

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

    if (aiData.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your AI insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                        🤖 AI Financial Assistant
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Smart insights powered by AI to boost your savings journey
                    </p>
                </div>

                {/* Error Display */}
                {aiData.error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                        <p className="font-medium">⚠️ {aiData.error}</p>
                        <button 
                            onClick={fetchAllAIData}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* AI Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    
                    {/* Financial Nudge Card */}
                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 rounded-full p-3 mr-4">
                                <span className="text-2xl">💡</span>
                            </div>
                            <h3 className="text-xl font-bold">Smart Nudge</h3>
                        </div>
                        <p className="text-lg leading-relaxed mb-4">
                            {aiData.nudge || "Keep up the great work with your savings!"}
                        </p>
                        <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-sm opacity-90">
                                💪 Personalized encouragement based on your savings pattern
                            </p>
                        </div>
                    </div>

                    {/* Loan Analysis Card */}
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 rounded-full p-3 mr-4">
                                <span className="text-2xl">🏦</span>
                            </div>
                            <h3 className="text-xl font-bold">Loan Analysis</h3>
                        </div>
                        {aiData.loanAnalysis ? (
                            <div className="space-y-3">
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="font-semibold">Eligibility: {aiData.loanAnalysis.eligibility}</p>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="font-semibold">Max Amount: ${aiData.loanAnalysis.recommendedAmount?.toFixed(2) || '0.00'}</p>
                                </div>
                                <p className="text-sm opacity-90">{aiData.loanAnalysis.advice}</p>
                            </div>
                        ) : (
                            <p className="text-lg">Building your loan profile...</p>
                        )}
                    </div>

                    {/* Savings Health Card */}
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 lg:col-span-2 xl:col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 rounded-full p-3 mr-4">
                                <span className="text-2xl">📈</span>
                            </div>
                            <h3 className="text-xl font-bold">Savings Health</h3>
                        </div>
                        {aiData.healthInsight ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Health Score</span>
                                    <div className="bg-white/20 rounded-full px-4 py-2">
                                        <span className="text-2xl font-bold">{aiData.healthInsight.score}/100</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg p-3">
                                    <p className="font-semibold mb-2">Status: {aiData.healthInsight.status}</p>
                                    <p className="text-sm opacity-90">{aiData.healthInsight.insights}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-lg">Analyzing your savings health...</p>
                        )}
                    </div>
                </div>

                {/* AI Chatbot Section */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center">
                            <div className="bg-white/20 rounded-full p-3 mr-4">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">AI Assistant</h3>
                                <p className="opacity-90">Ask me about savings rules, loan terms, or financial advice!</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {chatData.messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <p className="text-lg mb-4">👋 Hi! I'm your AI financial assistant.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        "What are the loan terms?",
                                        "How do savings rules work?",
                                        "When can I borrow money?",
                                        "What's the interest rate?"
                                    ].map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setChatData(prev => ({ ...prev, currentMessage: suggestion }))}
                                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {chatData.messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-800 shadow-md border'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {chatData.loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-md border max-w-xs px-4 py-3 rounded-2xl">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white border-t">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={chatData.currentMessage}
                                onChange={(e) => setChatData(prev => ({ ...prev, currentMessage: e.target.value }))}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about savings rules, loan terms, or get financial advice..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={chatData.loading}
                            />
                            <button
                                onClick={sendChatMessage}
                                disabled={chatData.loading || !chatData.currentMessage.trim()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <span className="hidden sm:inline">Send</span>
                                <span className="sm:hidden">📤</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIDashboard;