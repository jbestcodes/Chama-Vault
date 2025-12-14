import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

function SupportChat({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m your Jaza Nyumba support assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSatisfactionCheck, setShowSatisfactionCheck] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Send chat history for context
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await axios.post(
                `${apiUrl}/api/support/chat`,
                {
                    message: inputMessage,
                    chatHistory: chatHistory
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const assistantMessage = {
                role: 'assistant',
                content: response.data.reply,
                timestamp: new Date(),
                source: response.data.source
            };

            setMessages(prev => [...prev, assistantMessage]);
            
            // Show satisfaction check after 3 exchanges (6 messages)
            const newMessageCount = messageCount + 2;
            setMessageCount(newMessageCount);
            if (newMessageCount >= 6 && !showSatisfactionCheck) {
                setTimeout(() => setShowSatisfactionCheck(true), 1000);
            }
        } catch (error) {
            console.error('Support chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: '😔 Sorry, I\'m having trouble connecting right now. Please try again in a moment or contact your group admin for urgent issues.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendTranscript = async () => {
        try {
            const token = localStorage.getItem('token');
            const member = JSON.parse(localStorage.getItem('member') || '{}');
            
            // Format chat transcript
            const transcript = messages
                .map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`)
                .join('\n\n');
            
            await axios.post(
                `${apiUrl}/api/contact/submit`,
                {
                    name: member.full_name || 'User',
                    email: member.email || member.phone + '@chama.app',
                    message: `CHAT TRANSCRIPT - User needs additional support:\n\n${transcript}`
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            const confirmMessage = {
                role: 'assistant',
                content: '✅ Your chat transcript has been sent to our support team. We\'ll get back to you via email shortly!',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, confirmMessage]);
            setShowSatisfactionCheck(false);
        } catch (error) {
            console.error('Error sending transcript:', error);
            alert('Failed to send transcript. Please use the contact form instead.');
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickQuestions = [
        'How do I check my savings?',
        'How do I request a loan?',
        'What are the subscription plans?',
        'How does the leaderboard work?'
    ];

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
        inputRef.current?.focus();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '380px',
            maxWidth: 'calc(100vw - 40px)',
            height: '600px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                        💬 Jaza Nyumba Support
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                        We typically reply instantly
                    </p>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    ×
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                backgroundColor: '#f5f7fa'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            maxWidth: '75%',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            backgroundColor: msg.role === 'user' ? '#1976d2' : 'white',
                            color: msg.role === 'user' ? 'white' : '#333',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                        }}>
                            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                {msg.content}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                marginTop: '6px',
                                opacity: 0.7,
                                textAlign: 'right'
                            }}>
                                {formatTime(msg.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ animation: 'bounce 1s infinite' }}>●</span>
                                <span style={{ animation: 'bounce 1s infinite 0.2s' }}>●</span>
                                <span style={{ animation: 'bounce 1s infinite 0.4s' }}>●</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {messages.length === 1 && (
                    <div style={{ marginTop: '12px' }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '8px',
                            fontWeight: '500'
                        }}>
                            Quick questions:
                        </p>
                        {quickQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickQuestion(q)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 12px',
                                    marginBottom: '6px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: '#1976d2',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f0f7ff';
                                    e.target.style.borderColor = '#1976d2';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#e0e0e0';
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Satisfaction Check */}
                {showSatisfactionCheck && (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        padding: '16px',
                        borderRadius: '12px',
                        marginTop: '16px',
                        border: '1px solid #ffc107'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#856404',
                            marginBottom: '12px'
                        }}>
                            Was your question answered? 🤔
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    const thankYouMsg = {
                                        role: 'assistant',
                                        content: '🎉 Great! I\'m glad I could help. Feel free to ask if you have more questions!',
                                        timestamp: new Date()
                                    };
                                    setMessages(prev => [...prev, thankYouMsg]);
                                    setShowSatisfactionCheck(false);
                                }}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                            >
                                ✓ Yes, I'm satisfied
                            </button>
                            <button
                                onClick={handleSendTranscript}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                            >
                                📧 Send transcript to support team
                            </button>
                            <a
                                href="/contact"
                                target="_blank"
                                onClick={() => setShowSatisfactionCheck(false)}
                                style={{
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    color: '#1976d2',
                                    border: '1px solid #1976d2',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f7ff'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                📝 Fill contact form
                            </a>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} style={{
                padding: '16px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: 'white'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '10px 14px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: inputMessage.trim() && !isLoading ? '#1976d2' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (inputMessage.trim() && !isLoading) {
                                e.target.style.backgroundColor = '#1565c0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (inputMessage.trim() && !isLoading) {
                                e.target.style.backgroundColor = '#1976d2';
                            }
                        }}
                    >
                        Send
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
}

export default SupportChat;
