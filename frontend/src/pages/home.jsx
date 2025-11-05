import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import heroImage from '../media/hero.jpg';

const Home = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { 
            title: "💰 Welcome to ChamaVault", 
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
            <div className="flex-1">
                {/* Hero Section */}
                <div 
                    className="flex items-center justify-center p-8 relative"
                    style={{
                        height: '70vh', // 70% of viewport height
                        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%), url(${heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-4xl w-full text-center relative z-10">
                        {/* Current Slide Content */}
                        <div className="mb-8">
                            <div className="text-6xl mb-6">🏦</div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                {currentSlideData.title}
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                {currentSlideData.description}
                            </p>
                            
                            <Link to={currentSlideData.link}>
                                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    {currentSlideData.linkText} →
                                </button>
                            </Link>
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex justify-center gap-3 mb-8">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentSlide 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 px-6 bg-white">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-800 mb-12">
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
                        <div className="flex justify-center gap-6 flex-wrap">
                            {!isLoggedIn && (
                                <>
                                    <Link to="/register">
                                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                            🎉 Join Now - It's Free! ✨
                                        </button>
                                    </Link>
                                    <Link to="/login">
                                        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                            🔑 Login Now 🚀
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;