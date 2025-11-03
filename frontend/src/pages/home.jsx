import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';

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
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ChamaVault
                    </h1>
                    <div className="flex items-center gap-4">
                        {isLoggedIn && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("role");
                                    window.location.reload();
                                }}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 pt-20">
                {/* Hero Section */}
                <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl w-full text-center">
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
                                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer hover:border-blue-200"
                                >
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-lg">
                                        {feature.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
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