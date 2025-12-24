import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage from '../media/hero.jpg';
import useSEO from '../hooks/useSEO';

const Home = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

    // SEO optimization for homepage
    useSEO({
        title: "Jaza Nyumba - Smart Group Savings & Chama Management Platform",
        description: "Manage your Chama savings, loans, and contributions with ease. AI-powered insights, SMS notifications, and secure payment integration. Join thousands of successful savings groups in Kenya.",
        keywords: "Chama, Savings Group, Kenya Chama, Group Savings, Table Banking, ROSCA, Merry Go Round, Savings Platform, Loan Management, Contribution Tracking, Group Finance, AI Financial Insights, Mpesa Payments, SMS Notifications",
        url: "https://jazanyumba.online",
        type: "website"
    });

    // Fetch homepage statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('https://jazanyumba.online/api/public/stats');
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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

    // Handle newsletter signup
    const handleNewsletterSignup = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            // You can implement newsletter signup API call here
            setNewsletterSubmitted(true);
            setEmail('');
            setTimeout(() => setNewsletterSubmitted(false), 3000);
        } catch (error) {
            console.error('Newsletter signup error:', error);
        }
    };

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

                {/* Statistics Section */}
                <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{
                            margin: '0 0 16px 0',
                            color: '#333',
                            fontSize: '36px',
                            fontWeight: 'bold'
                        }}>
                            🚀 Trusted by Thousands
                        </h2>
                        <p style={{
                            margin: '0 0 48px 0',
                            color: '#666',
                            fontSize: '18px'
                        }}>
                            Join the growing community of successful savers across Kenya
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                {
                                    number: loading ? '...' : (stats?.totalMembers || 0).toLocaleString(),
                                    label: 'Active Members',
                                    icon: '👥'
                                },
                                {
                                    number: loading ? '...' : (stats?.totalGroups || 0).toLocaleString(),
                                    label: 'Savings Groups',
                                    icon: '🏢'
                                },
                                {
                                    number: loading ? '...' : `KSh ${(stats?.totalSavingsAmount || 0).toLocaleString()}`,
                                    label: 'Total Savings',
                                    icon: '💰'
                                },
                                {
                                    number: loading ? '...' : (stats?.activeSubscriptions || 0).toLocaleString(),
                                    label: 'Premium Users',
                                    icon: '⭐'
                                }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="text-4xl mb-3">{stat.icon}</div>
                                    <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                                    <div className="text-gray-600 font-medium">{stat.label}</div>
                                </div>
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

                        {/* Features Section - Dynamic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {(stats?.features || [
                                { icon: "📊", title: "Smart Dashboard", desc: "Group savings dashboard with masked leaderboard" },
                                { icon: "🎯", title: "Goal Tracking", desc: "Personal savings milestones and progress tracking" },
                                { icon: "🛡️", title: "Admin Control", desc: "Powerful admin panel for group management" },
                                { icon: "📈", title: "Visual Analytics", desc: "Beautiful charts for group savings insights" },
                                { icon: "🔒", title: "Bank-Level Security", desc: "Secure login and easy password recovery" },
                                { icon: "📅", title: "History Tracking", desc: "Complete contribution history and weekly tracking" }
                            ]).map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer hover:border-blue-300 group"
                                >
                                    <div className="text-5xl mb-4 group-hover:animate-bounce">{feature.icon}</div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                        {feature.description || feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Testimonials Section */}
                        <div style={{ padding: '60px 20px', backgroundColor: '#f8fafc' }}>
                            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                                <h2 style={{
                                    margin: '0 0 16px 0',
                                    color: '#333',
                                    fontSize: '36px',
                                    fontWeight: 'bold'
                                }}>
                                    💬 What Our Users Say
                                </h2>
                                <p style={{
                                    margin: '0 0 48px 0',
                                    color: '#666',
                                    fontSize: '18px'
                                }}>
                                    Real stories from real savers who have transformed their financial future
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {(stats?.testimonials || [
                                        {
                                            name: "Sarah Wanjiku",
                                            group: "Hope Savings Group",
                                            message: "Jaza Nyumba has transformed how we save as a group. The AI insights are incredible!",
                                            rating: 5
                                        },
                                        {
                                            name: "David Kiprop",
                                            group: "Future Builders Chama",
                                            message: "Finally, a platform that understands Kenyan Chamas. Highly recommended!",
                                            rating: 5
                                        },
                                        {
                                            name: "Grace Achieng",
                                            group: "Women's Empowerment Circle",
                                            message: "The automated reminders and secure payments make group savings so much easier.",
                                            rating: 5
                                        }
                                    ]).map((testimonial, index) => (
                                        <div
                                            key={index}
                                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="flex mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                                                ))}
                                            </div>
                                            <p className="text-gray-700 mb-4 italic">"{testimonial.message}"</p>
                                            <div className="border-t pt-4">
                                                <div className="font-bold text-gray-800">{testimonial.name}</div>
                                                <div className="text-gray-600 text-sm">{testimonial.group}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Newsletter Signup Section */}
                        <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                                <h2 style={{
                                    margin: '0 0 16px 0',
                                    color: '#333',
                                    fontSize: '36px',
                                    fontWeight: 'bold'
                                }}>
                                    📧 Stay Updated
                                </h2>
                                <p style={{
                                    margin: '0 0 32px 0',
                                    color: '#666',
                                    fontSize: '18px'
                                }}>
                                    Get the latest updates on new features, financial tips, and Chama success stories
                                </p>

                                <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Subscribe ✨
                                    </button>
                                </form>

                                {newsletterSubmitted && (
                                    <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                        ✅ Thanks for subscribing! We'll keep you updated.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Call to Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
                            {!isLoggedIn && (
                                <>
                                    <Link to="/register">
                                        <button style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '16px 40px',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                            minWidth: '200px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0) scale(1)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                        }}>
                                            🚀 Start Saving Today - FREE! ✨
                                        </button>
                                    </Link>
                                    <Link to="/login">
                                        <button style={{
                                            background: 'white',
                                            color: '#667eea',
                                            border: '3px solid #667eea',
                                            borderRadius: '12px',
                                            padding: '16px 40px',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: 'translateY(0)',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                                            minWidth: '200px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                                            e.target.style.background = '#667eea';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0) scale(1)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
                                            e.target.style.background = 'white';
                                            e.target.style.color = '#667eea';
                                        }}>
                                            🔑 Welcome Back! 💫
                                        </button>
                                    </Link>
                                </>
                            )}
                            {isLoggedIn && (
                                <Link to="/dashboard">
                                    <button style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '16px 40px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                        minWidth: '200px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                    }}>
                                        📊 Go to Dashboard 🎯
                                    </button>
                                </Link>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                            <p>🔒 Secure • 🤖 AI-Powered • 📱 Mobile-First • 🇰🇪 Made for Kenya</p>
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default Home;