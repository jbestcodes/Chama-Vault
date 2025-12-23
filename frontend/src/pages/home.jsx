import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from '../media/hero.jpg';

const Home = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        document.title = "Jaza Nyumba - Smart Group Savings & Chama Management Platform";
    }, []);

    const slides = [
        { 
            title: "💰 Welcome to Jaza Nyumba", 
            description: "Your Smart Group Savings Platform. Secure, Smart, and Simple group savings for everyone.",
            link: "/login", 
            linkText: "Login to Your Account"
        },
        { 
            title: "🤝 Why Choose Us?", 
            description: "Trusted by thousands of Chamas across the region. Discover what makes us the preferred choice.",
            link: "/why-us", 
            linkText: "Learn Why Us"
        },
        { 
            title: "📋 Terms & Conditions", 
            description: "Transparent and fair policies. Clear guidelines for secure savings and group management.",
            link: "/terms-and-conditions", 
            linkText: "Read Terms"
        },
        { 
            title: "🎯 Join Our Community", 
            description: "Start your savings journey today. Create your account and join thousands of successful savers.",
            link: "/register", 
            linkText: "Register Now"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const currentSlideData = slides[currentSlide];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div className="flex-1">
                {/* Hero Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    minHeight: '80vh'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        padding: '40px',
                        maxWidth: '800px',
                        width: '100%',
                        textAlign: 'center',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease'
                    }}>
                        {/* Current Slide Content */}
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                fontSize: '64px',
                                marginBottom: '20px'
                            }}>🏦</div>
                            <h1 style={{
                                margin: '0 0 16px 0',
                                color: '#333',
                                fontSize: '36px',
                                fontWeight: 'bold'
                            }}>
                                {currentSlideData.title}
                            </h1>
                            <p style={{
                                margin: '0 0 32px 0',
                                color: '#666',
                                fontSize: '18px',
                                lineHeight: '1.6'
                            }}>
                                {currentSlideData.description}
                            </p>
                            
                            <Link to={currentSlideData.link}>
                                <button style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '14px 32px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                }}>
                                    {currentSlideData.linkText} →
                                </button>
                            </Link>
                        </div>

                        {/* Slide Indicators */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '30px' }}>
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: index === currentSlide 
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : '#e1e5e9'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (index !== currentSlide) {
                                            e.target.style.background = '#ccc';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (index !== currentSlide) {
                                            e.target.style.background = '#e1e5e9';
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div style={{ padding: '60px 20px', backgroundColor: 'transparent' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{
                            margin: '0 0 48px 0',
                            color: 'white',
                            fontSize: '36px',
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            ✨ Amazing Features ✨
                        </h2>

                        {/* Features Section - Fixed Animations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {[
                                { icon: "📊", title: "Smart Dashboard", desc: "Group savings dashboard with masked leaderboard" },
                                { icon: "🎯", title: "Goal Tracking", desc: "Personal savings milestones and progress tracking" },
                                { icon: "🛡️", title: "Admin Control", desc: "Powerful admin panel for group management" },
                                { icon: "📈", title: "Visual Analytics", desc: "Beautiful charts for group savings insights" },
                                { icon: "🔒", title: "Bank-Level Security", desc: "Secure login and easy password recovery" },
                                { icon: "📅", title: "History Tracking", desc: "Complete contribution history and weekly tracking" }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer hover:border-blue-300 group"
                                >
                                    <div className="text-5xl mb-4 group-hover:animate-bounce">{feature.icon}</div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Call to Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            {!isLoggedIn && (
                                <>
                                    <Link to="/register">
                                        <button style={{
                                            background: 'white',
                                            color: '#667eea',
                                            border: '2px solid white',
                                            borderRadius: '12px',
                                            padding: '14px 32px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.3)';
                                        }}>
                                            🎉 Join Now - It's Free! ✨
                                        </button>
                                    </Link>
                                    <Link to="/login">
                                        <button style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 32px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                        }}>
                                            🔑 Login Now 🚀
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default Home;