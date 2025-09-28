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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Hero Section */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden">
                
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${heroImg})`,
                    }}
                />
                
                {/* Fallback gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600"></div>
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Hero Content */}
                <div className="relative z-20 h-full flex items-center justify-center px-4">
                    <div className="text-center text-white max-w-4xl">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                            {currentSlideData.title}
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl md:text-2xl font-light mb-4 drop-shadow-md">
                            {currentSlideData.subtitle}
                        </p>
                        
                        {/* Description */}
                        <p className="text-base sm:text-lg mb-8 drop-shadow-md">
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

            {/* Rest of your existing content... */}
            <div id="home-section" className="relative px-6 py-12 -mt-16 z-10">
                <div className="h-8"></div>
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 text-center mx-auto transform hover:-translate-y-2 transition-transform duration-300">
                    <h2 id="hero-title" className="text-green-700 text-3xl font-bold mb-4 animate-pulse hover:text-green-800 transition-colors duration-300">
                        Chama Vault
                    </h2>
                    <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                        Welcome to Chama Vault! <br />
                        Chama Vault is a simple, secure platform for group savings and financial management.<br />
                        Track your savings, set milestones, and manage your group with ease.<br /><br />
                        <strong className="text-green-600">Features:</strong>
                    </p>
                    <ul className="text-left inline-block my-4 text-base space-y-2">
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            📊 Group savings dashboard with masked leaderboard
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            🎯 Personal savings milestones and progress tracking
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            🛡️ Admin panel for group management and savings matrix
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            📈 Visual charts for group savings
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            🔒 Secure login and easy password reset
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            📅 Contribution history and weekly tracking
                        </li>
                        <li className="hover:text-green-600 transition-colors duration-200 cursor-default transform hover:translate-x-2 transition-transform duration-200">
                            🏆 Group-specific ranking and analytics
                        </li>
                    </ul>
                    <div className="mt-8 space-x-3">
                        {!isLoggedIn && (
                            <>
                                <Link to="/register">
                                    <button id="signup-button" className="bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-md text-base cursor-pointer font-bold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                                        Sign Up
                                    </button>
                                </Link>
                                <Link to="/login">
                                    <button id="cta-button" className="bg-green-700 hover:bg-green-800 text-white border-none py-3 px-8 rounded-md text-base cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                                        Log In
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
                                className="bg-red-600 hover:bg-red-700 text-white border-none py-3 px-8 rounded-md text-base cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Log Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;