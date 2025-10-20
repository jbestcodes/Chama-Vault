import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "💰 Welcome to Chama Vault",
            subtitle: "Your Smart Group Savings Platform", 
            link: "/login",
            linkText: "Login to Your Account",
            description: "Secure • Smart • Simple Group Savings"
        },
        {
            title: "🤝 Why Choose Us?",
            subtitle: "Trusted by Thousands of Chamas", 
            link: "/why-us",
            linkText: "Learn Why Us",
            description: "Discover what makes us the preferred choice"
        },
        {
            title: "📋 Terms & Conditions",
            subtitle: "Transparent & Fair Policies",
            link: "/terms-and-conditions", 
            linkText: "Read Terms",
            description: "Clear guidelines for secure savings"
        },
        {
            title: "🎯 Join Our Community",
            subtitle: "Start Your Savings Journey",
            link: "/register",
            linkText: "Register Now", 
            description: "Create account and join successful savers"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            
            {/* Hero Section - Modern Dark Design */}
            <div className="relative w-full h-screen overflow-hidden">
                
                {/* Animated Background Particles */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                {/* Hero Content */}
                <div className="relative z-20 h-full flex items-center justify-center px-4">
                    <div className="text-center max-w-5xl">
                        
                        {/* Main Title with Glow Effect */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white drop-shadow-2xl animate-fade-in">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                {currentSlideData.title}
                            </span>
                        </h1>
                        
                        {/* Subtitle with Animation */}
                        <p className="text-xl sm:text-2xl md:text-3xl font-light mb-6 text-gray-200 animate-slide-up">
                            {currentSlideData.subtitle}
                        </p>
                        
                        {/* Description with Backdrop */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-10 border border-white/20 animate-bounce-in">
                            <p className="text-lg sm:text-xl text-gray-100 font-medium">
                                {currentSlideData.description}
                            </p>
                        </div>
                        
                        {/* Enhanced CTA Button */}
                        <Link to={currentSlideData.link}>
                            <button className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white px-12 py-5 rounded-full text-xl font-bold transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 animate-float">
                                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                                <span className="relative flex items-center justify-center gap-3">
                                    ✨ {currentSlideData.linkText} ✨
                                </span>
                            </button>
                        </Link>
                        
                        {/* Slide Indicators */}
                        <div className="flex justify-center mt-12 space-x-3">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index === currentSlide 
                                            ? 'bg-white scale-125 shadow-lg' 
                                            : 'bg-white/40 hover:bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Geometric Elements */}
                <div className="absolute top-1/4 left-8 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute top-1/3 right-12 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rotate-45 animate-wiggle opacity-80"></div>
                <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rotate-12 animate-bounce delay-1000 opacity-80"></div>
            </div>

            {/* Main Content Section - Redesigned */}
            <div id="home-section" className="relative px-4 py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Main Content Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-16 text-center border border-white/50 hover:shadow-purple-200/50 transition-all duration-700 transform hover:-translate-y-2">
                        
                        {/* Welcome Section - Enhanced */}
                        <div className="mb-16">
                            <h2 id="hero-title" className="text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-black mb-8 hover:text-purple-700 transition-colors duration-300">
                                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                                    Welcome to Your Financial Future! 🚀
                                </span>
                            </h2>
                            
                            <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 rounded-3xl p-8 mb-8 border border-purple-200 shadow-lg">
                                <p className="text-xl mb-8 text-gray-800 leading-relaxed font-medium">
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-black text-2xl">
                                        Chama Vault
                                    </span> is your gateway to collaborative wealth building! <br />
                                    Join thousands who are transforming their savings journey with our innovative platform.
                                </p>
                                <div className="bg-white/90 rounded-2xl p-6 inline-block shadow-lg border border-purple-100">
                                    <strong className="text-purple-600 text-2xl animate-pulse font-black">✨ Amazing Features ✨</strong>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 my-16">
                            {{
                                { icon: "📊", title: "Smart Dashboard", desc: "Group savings dashboard with masked leaderboard", color: "from-blue-500 to-purple-500" },
                                { icon: "🎯", title: "Goal Tracking", desc: "Personal savings milestones and progress tracking", color: "from-purple-500 to-pink-500" },
                                { icon: "🛡️", title: "Admin Control", desc: "Powerful admin panel for group management", color: "from-pink-500 to-red-500" },
                                { icon: "📈", title: "Visual Analytics", desc: "Beautiful charts for group savings insights", color: "from-green-500 to-blue-500" },
                                { icon: "🔒", title: "Bank-Level Security", desc: "Secure login and easy password recovery", color: "from-yellow-500 to-orange-500" },
                                { icon: "📅", title: "History Tracking", desc: "Complete contribution history and weekly tracking", color: "from-indigo-500 to-purple-500" },
                                { icon: "🏆", title: "Competitive Edge", desc: "Group-specific ranking and analytics", color: "from-orange-500 to-red-500" },
                                { icon: "💡", title: "Smart Notifications", desc: "Stay updated with real-time alerts", color: "from-teal-500 to-cyan-500" }
                            }.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer border border-gray-100 hover:border-purple-300 min-h-[220px] flex flex-col justify-center overflow-hidden"
                                >
                                    {/* Gradient Background on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" style={{animationDelay: `${index * 150}ms`}}>
                                            {feature.icon}
                                        </div>
                                        <h4 className="font-black text-gray-900 mb-3 text-lg group-hover:text-purple-700 transition-colors duration-300">{feature.title}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 font-medium">{feature.desc}</p>
                                    </div>
                                    
                                    {/* Hover Border Glow */}
                                    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-r ${feature.color} p-[2px] transition-opacity duration-500`}>
                                        <div className="w-full h-full bg-white rounded-3xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center">
                            {!isLoggedIn && (
                                <>
                                    <Link to="/register" className="group">
                                        <button className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-500 hover:via-blue-500 hover:to-pink-500 text-white py-6 px-12 rounded-full text-xl font-black transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 overflow-hidden min-w-[280px]">
                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                            <span className="relative flex items-center justify-center gap-3">
                                                🎉 Join Now - It's Free! ✨
                                            </span>
                                        </button>
                                    </Link>
                                    <Link to="/login" className="group">
                                        <button className="relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 px-12 rounded-full text-xl font-black transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/50 overflow-hidden min-w-[280px]">
                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                            <span className="relative flex items-center justify-center gap-3">
                                                🔑 Login Now 🚀
                                            </span>
                                        </button>
                                    </Link>
                                </>
                            )}
                            {isLoggedIn && (
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        localStorage.removeItem("role");
                                        window.location.reload();
                                    }}
                                    className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white py-6 px-12 rounded-full text-xl font-black transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-red-500/50 overflow-hidden min-w-[280px]"
                                >
                                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                    <span className="relative flex items-center justify-center gap-3">
                                        👋 Logout 🚪
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Enhanced Trust Indicators */}
                        <div className="mt-16">
                            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-3xl p-8 border border-purple-100 shadow-lg">
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
                                    {{
                                        { icon: "🔐", text: "Bank-Level Security", color: "from-green-500 to-emerald-500" },
                                        { icon: "⚡", text: "Lightning Fast", color: "from-blue-500 to-cyan-500" },
                                        { icon: "🌟", text: "Trusted by Thousands", color: "from-purple-500 to-pink-500" }
                                    }.map((item, index) => (
                                        <div key={index} className="group relative bg-white rounded-2xl px-8 py-4 shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-gray-100 hover:border-purple-300">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
                                                <span className="font-black text-gray-900 text-lg group-hover:text-purple-700 transition-colors duration-300">{item.text}</span>
                                            </div>
                                            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 bg-gradient-to-r ${item.color} transition-opacity duration-500`}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;