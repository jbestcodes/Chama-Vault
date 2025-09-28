import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImg from "./hero.png";

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

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const currentSlideData = slides[currentSlide];

    return (
        <div className="min-h-screen">
            {/* Hero Section - Different color from body */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${heroImg})`,
                    }}
                />
                
                {/* Fallback gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black"></div>
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/60"></div>

                {/* Hero Content */}
                <div className="relative z-20 h-full flex items-center justify-center px-4">
                    <div className="text-center text-white max-w-4xl">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl text-white">
                            {currentSlideData.title}
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl md:text-2xl font-light mb-4 drop-shadow-xl text-gray-100">
                            {currentSlideData.subtitle}
                        </p>
                        
                        {/* Description */}
                        <p className="text-base sm:text-lg mb-8 drop-shadow-lg text-gray-200">
                            {currentSlideData.description}
                        </p>
                        
                        {/* Call to Action Button */}
                        <Link to={currentSlideData.link}>
                            <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                                {currentSlideData.linkText}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-30 shadow-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-30 shadow-lg"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Carousel Dots */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'bg-white scale-125 shadow-lg' 
                                    : 'bg-white/60 hover:bg-white/80'
                            }`}
                        />
                    ))}
                </div>

                {/* Floating Animation Elements */}
                <div className="absolute top-8 left-8 w-4 h-4 bg-yellow-400 rounded-full animate-bounce z-10 opacity-80"></div>
                <div className="absolute top-16 right-12 w-6 h-6 bg-pink-400 rounded-full animate-bounce delay-300 z-10 opacity-80"></div>
                <div className="absolute bottom-16 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500 z-10 opacity-80"></div>

                {/* Current Slide Indicator */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-30">
                    {currentSlide + 1} / {slides.length}
                </div>
            </div>

            {/* Main Content Section - Light background, different from hero */}
            <div id="home-section" className="relative px-6 py-12 -mt-16 z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 min-h-screen">
                <div className="h-8"></div>
                <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 sm:p-8 lg:p-12 text-center mx-auto transform hover:-translate-y-3 border border-white/20">
                    
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 id="hero-title" className="text-gray-800 text-3xl sm:text-4xl font-bold mb-4 hover:text-green-700 transition-colors duration-300">
                            Welcome to Your Financial Future! 🚀
                        </h2>
                        
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-6">
                            <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold text-xl">
                                    Chama Vault
                                </span> is your gateway to collaborative wealth building! <br />
                                Join thousands who are transforming their savings journey with our innovative platform.
                            </p>
                            <div className="bg-white/80 rounded-lg p-4 inline-block">
                                <strong className="text-green-600 text-xl animate-pulse">✨ Amazing Features ✨</strong>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 my-8">
                        {[
                            { icon: "📊", title: "Smart Dashboard", desc: "Group savings dashboard with masked leaderboard" },
                            { icon: "🎯", title: "Goal Tracking", desc: "Personal savings milestones and progress tracking" },
                            { icon: "🛡️", title: "Admin Control", desc: "Powerful admin panel for group management" },
                            { icon: "📈", title: "Visual Analytics", desc: "Beautiful charts for group savings insights" },
                            { icon: "🔒", title: "Bank-Level Security", desc: "Secure login and easy password recovery" },
                            { icon: "📅", title: "History Tracking", desc: "Complete contribution history and weekly tracking" },
                            { icon: "🏆", title: "Competitive Edge", desc: "Group-specific ranking and analytics" },
                            { icon: "💡", title: "Smart Notifications", desc: "Stay updated with real-time alerts" }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer border border-green-100 hover:border-green-300 min-h-[160px] flex flex-col justify-center group"
                            >
                                <div className="text-3xl mb-3 animate-bounce group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${index * 100}ms`}}>
                                    {feature.icon}
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2 text-base group-hover:text-green-700 transition-colors duration-300">{feature.title}</h4>
                                <p className="text-sm text-gray-600 leading-tight group-hover:text-gray-700 transition-colors duration-300">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center px-4">
                        {!isLoggedIn && (
                            <>
                                <Link to="/register" className="w-full sm:w-auto">
                                    <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto">
                                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                        <span className="relative">🎉 Join Now - It's Free!</span>
                                    </button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto">
                                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                        <span className="relative">🔑 Login Now</span>
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
                                className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto"
                            >
                                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                <span className="relative">👋 Logout</span>
                            </button>
                        )}
                    </div>

                    {/* Trust Indicators - REMOVED BORDER */}
                    <div className="mt-12 pt-8">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-600">
                                <div className="flex items-center animate-pulse delay-100 bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <span className="text-green-500 mr-2 text-lg">🔐</span>
                                    <span className="font-medium text-gray-800">Bank-Level Security</span>
                                </div>
                                <div className="flex items-center animate-pulse delay-300 bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <span className="text-blue-500 mr-2 text-lg">⚡</span>
                                    <span className="font-medium text-gray-800">Lightning Fast</span>
                                </div>
                                <div className="flex items-center animate-pulse delay-500 bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <span className="text-purple-500 mr-2 text-lg">🌟</span>
                                    <span className="font-medium text-gray-800">Trusted by Thousands</span>
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