import React from "react";
import { Link } from "react-router-dom";
import heroImg from "./hero.png";

function Home() {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Hero Section with Image */}
            <div className="relative overflow-hidden">
                {/* Hero Image with Overlay */}
                <div
                    className="w-full h-96 bg-cover bg-center bg-no-repeat relative transform hover:scale-105 transition-transform duration-700 shadow-2xl"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImg})`,
                    }}
                >
                    {/* Floating Animation Elements */}
                    <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                    <div className="absolute top-20 right-20 w-6 h-6 bg-pink-400 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-500"></div>
                    
                    {/* Hero Content Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white animate-fade-in">
                            <h1 className="text-6xl font-bold mb-4 animate-pulse shadow-lg">
                                💰 Chama Vault
                            </h1>
                            <p className="text-xl font-light animate-slide-up delay-200">
                                Secure • Smart • Simple Group Savings
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative px-6 py-12 -mt-20 z-10">
                <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 text-center mx-auto transform hover:-translate-y-3 border border-white/20">
                    
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-green-700 text-4xl font-bold mb-4 hover:text-green-800 transition-colors duration-300 animate-fade-in">
                            Welcome to Your Financial Future! 🚀
                        </h2>
                        <p className="text-lg mb-6 text-gray-700 leading-relaxed animate-slide-up delay-100">
                            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                                Chama Vault
                            </span> is your gateway to collaborative wealth building! <br />
                            Join thousands who are transforming their savings journey with our innovative platform.<br />
                            <strong className="text-green-600 text-xl animate-pulse">✨ Amazing Features:</strong>
                        </p>
                    </div>

                    {/* Interactive Features Grid */}
                    <div className="grid md:grid-cols-2 gap-4 my-8 animate-slide-up delay-200">
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
                                className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer border border-green-100 hover:border-green-300"
                            >
                                <div className="text-3xl mb-2 animate-bounce" style={{animationDelay: `${index * 100}ms`}}>
                                    {feature.icon}
                                </div>
                                <h4 className="font-bold text-green-700 mb-1">{feature.title}</h4>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 space-x-4 animate-fade-in delay-500">
                        {!isLoggedIn && (
                            <>
                                <Link to="/register">
                                    <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                        <span className="relative">🎉 Join Now - It's Free!</span>
                                    </button>
                                </Link>
                                <Link to="/login">
                                    <button className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
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
                                className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none py-4 px-10 rounded-full text-lg cursor-pointer font-bold transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                <span className="relative">👋 Logout</span>
                            </button>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 pt-8 border-t border-gray-200 animate-fade-in delay-700">
                        <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
                            <div className="flex items-center animate-pulse delay-100">
                                <span className="text-green-500 mr-2">🔐</span>
                                Bank-Level Security
                            </div>
                            <div className="flex items-center animate-pulse delay-300">
                                <span className="text-blue-500 mr-2">⚡</span>
                                Lightning Fast
                            </div>
                            <div className="flex items-center animate-pulse delay-500">
                                <span className="text-purple-500 mr-2">🌟</span>
                                Trusted by Thousands
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