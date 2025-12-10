import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const AIDashboard = () => {
    const BASE_URL = 'https://chama-vault-1.onrender.com';
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);

        // Set welcome message based on login status
        if (loggedIn) {
            setMessages([
                {
                    text: "Hello! I'm your AI financial assistant. Ask me anything about savings, loans, or your Chama finances! 🤖",
                    isUser: false,
                    timestamp: new Date()
                }
            ]);
        } else {
            setMessages([
                {
                    text: "Welcome to Jaza Nyumba AI! 🤖 I'd love to help you with personalized financial advice, but you need to be logged in first to access your data. Please login or register to get started! 🔐",
                    isUser: false,
                    timestamp: new Date()
                }
            ]);
        }
    }, []);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const userMessage = {
            text: userInput,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            const authMessage = {
                text: "Sorry, you must be logged in to ask questions and get personalized financial advice! 🔐 Please login to access your savings data and get smart recommendations.",
                isUser: false,
                timestamp: new Date(),
                showAuthButtons: true
            };
            setMessages(prev => [...prev, authMessage]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question: currentInput })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token is invalid/expired
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    const authMessage = {
                        text: "Your session has expired! Please login again to continue using the AI assistant. 🔄",
                        isUser: false,
                        timestamp: new Date(),
                        showAuthButtons: true
                    };
                    setMessages(prev => [...prev, authMessage]);
                    setIsLoading(false);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const aiMessage = {
                text: data.response,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat API error:', error);
            const errorMessage = {
                text: "Sorry, I'm having trouble connecting right now. Please try again later! 🔧",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
            <div className="flex-1 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            AI Financial Assistant 🤖
                        </h1>
                        <p className="text-gray-600">
                            {isLoggedIn 
                                ? "Get personalized financial advice based on your savings and loan data"
                                : "Login to get personalized financial advice based on your data"
                            }
                        </p>
                        
                        {/* Auth Status Indicator */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm font-medium ${isLoggedIn ? 'text-green-600' : 'text-red-600'}`}>
                                {isLoggedIn ? 'Logged in - Personalized advice available' : 'Not logged in - Please login for personalized advice'}
                            </span>
                        </div>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Messages Area */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index}>
                                    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.isUser
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            <p className="text-sm">{message.text}</p>
                                            <span className="text-xs opacity-75">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Auth buttons for non-logged in users */}
                                    {message.showAuthButtons && (
                                        <div className="flex justify-start mt-2">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs lg:max-w-md">
                                                <p className="text-sm text-blue-800 mb-3 font-medium">Ready to get started?</p>
                                                <div className="flex gap-2">
                                                    <Link to="/login">
                                                        <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                                                            Login
                                                        </button>
                                                    </Link>
                                                    <Link to="/register">
                                                        <button className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors">
                                                            Register
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t p-4">
                            <div className="flex space-x-2">
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isLoggedIn 
                                        ? "Ask me anything about your finances... (e.g., 'How much should I save weekly to reach 10k this year?')"
                                        : "Please login to ask personalized financial questions..."
                                    }
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="2"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !userInput.trim()}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                            
                            {/* Example Questions */}
                            {isLoggedIn && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "How much should I save weekly?",
                                            "Am I eligible for a loan?",
                                            "What's my savings health?",
                                            "How to reach 10k this year?"
                                        ].map((example, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setUserInput(example)}
                                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Auth prompt for non-logged in users */}
                            {!isLoggedIn && (
                                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800 mb-2">🔐 Want personalized financial advice?</p>
                                    <div className="flex gap-2">
                                        <Link to="/login">
                                            <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                                                Login
                                            </button>
                                        </Link>
                                        <Link to="/register">
                                            <button className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
                                                Register Free
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AIDashboard;