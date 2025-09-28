import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImg from "./hero.png";

function Home() {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);

    // Carousel slides with different images for each page
    const slides = [
        {
            image: heroImg, // You can add different images later
            title: "💰 Welcome to Chama Vault",
            subtitle: "Your Smart Group Savings Platform", 
            link: "/login",
            linkText: "Login to Your Account",
            description: "Secure • Smart • Simple Group Savings"
        },
        {
            image: heroImg, // Different image for Why Us page
            title: "🤝 Why Choose Us?",
            subtitle: "Trusted by Thousands of Chamas", 
            link: "/why-us",
            linkText: "Learn Why Us",
            description: "Discover what makes us the preferred choice"
        },
        {
            image: heroImg, // Different image for Terms page
            title: "📋 Terms & Conditions",
            subtitle: "Transparent & Fair Policies",
            link: "/terms-and-conditions", 
            linkText: "Read Terms",
            description: "Clear guidelines for secure savings"
        },
        {
            image: heroImg, // Different image for Register page
            title: "🎯 Join Our Community",
            subtitle: "Start Your Savings Journey",
            link: "/register",
            linkText: "Register Now", 
            description: "Create account and join successful savers"
        }
    ];

    // Auto-slide carousel
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Hero Carousel Section */}
            <div className="relative overflow-hidden">
                <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem]">
                    {/* Carousel Content with Images */}
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            {/* Hero Image for each slide */}
                            <img 
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/50"></div>
                            
                            {/* Slide Content */}
                            <div className="absolute inset-0 flex items-center justify-center px-4">
                                <div className="text-center text-white animate-fade-in">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4 shadow-lg">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg sm:text-xl md:text-2xl font-light mb-4">
                                        {slide.subtitle}
                                    </p>
                                    <p className="text-sm sm:text-lg md:text-xl font-light animate-slide-up delay-200 mb-6">
                                        {slide.description}
                                    </p>
                                    <Link to={slide.link}>
                                        <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-bold transform hover:scale-105 transition-all duration-300 shadow-lg">
                                            {slide.linkText}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Floating Animation Elements */}
                    <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-bounce delay-100 z-30"></div>
                    <div className="absolute top-8 sm:top-20 right-8 sm:right-20 w-4 h-4 sm:w-6 sm:h-6 bg-pink-400 rounded-full animate-bounce delay-300 z-30"></div>
                    <div className="absolute bottom-8 sm:bottom-20 left-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-bounce delay-500 z-30"></div>

                    {/* Carousel Navigation */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-40"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-40"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Carousel Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentSlide 
                                        ? 'bg-white scale-125' 
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Keep ALL your existing content below - no changes */}
            <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 -mt-12 sm:-mt-20 z-10">
                <div className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 sm:p-8 lg:p-12 text-center mx-auto transform hover:-translate-y-3 border border-white/20">
                    
                    {/* Welcome Section */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-green-700 text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 hover:text-green-800 transition-colors duration-300 animate-fade-in px-2">
                            Welcome to Your Financial Future! 🚀
                        </h2>
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                            <p className="text-base sm:text-lg mb-4 sm:mb-6 text-gray-700 leading-relaxed animate-slide-up delay-100">
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold text-lg sm:text-xl">
                                    Chama Vault
                                </span> is your gateway to collaborative wealth building! <br className="hidden sm:block" />
                                Join thousands who are transforming their savings journey with our innovative platform.
                            </p>
                            <div className="bg-white/80 rounded-lg p-3 sm:p-4 inline-block">
                                <strong className="text-green-600 text-lg sm:text-xl animate-pulse">✨ Amazing Features Below ✨</strong>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Features Grid - FIXED */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-8 animate-slide-up delay-200">
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
                                className="bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer border border-green-100 hover:border-green-300 min-h-[140px] sm:min-h-[160px] flex flex-col justify-center"
                            >
                                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 animate-bounce" style={{animationDelay: `${index * 100}ms`}}>
                                    {feature.icon}
                                </div>
                                <h4 className="font-bold text-green-700 mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-600 leading-tight">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in delay-500 px-4">
                        {!isLoggedIn && (
                            <>
                                <Link to="/register" className="w-full sm:w-auto">
                                    <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none py-3 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto">
                                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                        <span className="relative">🎉 Join Now - It's Free!</span>
                                    </button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none py-3 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto">
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
                                className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none py-3 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden w-full sm:w-auto"
                            >
                                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                <span className="relative">👋 Logout</span>
                            </button>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 animate-fade-in delay-700">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center animate-pulse delay-100 bg-white rounded-lg px-3 py-2 shadow-sm">
                                    <span className="text-green-500 mr-2 text-base sm:text-lg">🔐</span>
                                    <span className="font-medium">Bank-Level Security</span>
                                </div>
                                <div className="flex items-center animate-pulse delay-300 bg-white rounded-lg px-3 py-2 shadow-sm">
                                    <span className="text-blue-500 mr-2 text-base sm:text-lg">⚡</span>
                                    <span className="font-medium">Lightning Fast</span>
                                </div>
                                <div className="flex items-center animate-pulse delay-500 bg-white rounded-lg px-3 py-2 shadow-sm">
                                    <span className="text-purple-500 mr-2 text-base sm:text-lg">🌟</span>
                                    <span className="font-medium">Trusted by Thousands</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default Home;