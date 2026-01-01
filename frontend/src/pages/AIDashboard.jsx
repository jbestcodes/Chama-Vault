import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TrialStatus from '../components/TrialStatus';

const AIDashboard = () => {
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nudge, setNudge] = useState(''); // New state for proactive nudge
    const [healthData, setHealthData] = useState(null); // New state for health score
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
            fetchInitialAIData(token);
        } else {
            setMessages([{
                text: "Welcome to Jaza Nyumba AI! 🤖 I'd love to help you with personalized financial advice, but you need to be logged in first.",
                isUser: false,
                timestamp: new Date()
            }]);
        }
    }, []);

    // Fetch Nudge and Savings Health on Load
    const fetchInitialAIData = async (token) => {
        try {
            // 1. Fetch Financial Nudge
            const nudgeRes = await fetch(`${BASE_URL}/api/ai/financial-nudge`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const nudgeData = await nudgeRes.json();
            setNudge(nudgeData.nudge);

            // 2. Fetch Savings Health
            const healthRes = await fetch(`${BASE_URL}/api/ai/savings-health`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const healthJson = await healthRes.json();
            setHealthData(healthJson.health);

            setMessages([{
                text: "Hello! I've analyzed your latest data. Check your personalized insights on the side or ask me anything! 🤖",
                isUser: false,
                timestamp: new Date()
            }]);
        } catch (err) {
            console.error("Failed to load AI insights", err);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        const token = localStorage.getItem('token');
        const userMessage = { text: userInput, isUser: true, timestamp: new Date() };
        
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question: userInput })
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                text: data.response,
                isUser: false,
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                text: "Connection issues. Please try again later.",
                isUser: false,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Insights & Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                        <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <span>💡</span> Personal Nudge
                        </h2>
                        <p className="text-sm text-gray-700 leading-relaxed italic">
                            "{nudge || 'Analyzing your savings pattern...'}"
                        </p>
                    </div>

                    {healthData && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                            <h2 className="text-lg font-bold text-green-900 mb-4">Savings Health</h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-3xl font-bold text-green-600">{healthData.score}%</div>
                                <div className="text-xs uppercase tracking-wider font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">
                                    {healthData.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">{healthData.summary}</p>
                        </div>
                    )}
                    
                    {isLoggedIn && <TrialStatus />}
                </div>

                {/* Right Column: Main Chat */}
                <div className="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
                        <h1 className="font-bold">AI Financial Assistant</h1>
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded">Live Analysis</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {!isLoggedIn ? (
                            <div className="text-center py-20">
                                <p className="mb-4">Please login to access AI features</p>
                                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full">Login</Link>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                        m.isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && <div className="text-xs text-gray-400 animate-pulse">AI is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask about loans, savings, or goals..."
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIDashboard;