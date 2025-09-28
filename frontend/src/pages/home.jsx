import React from "react";
import { Link } from "react-router-dom";
import heroImg from "./hero.png";

function Home() {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div
            id="home-section"
            className="min-h-screen w-screen box-border bg-green-50 p-6 animate-fade-in"
        >
            {/* Hero image banner */}
            <div
                className="w-screen h-56 bg-cover bg-center bg-no-repeat rounded-b-3xl mx-auto mb-6 transform hover:scale-105 transition-transform duration-500 shadow-lg"
                style={{
                    backgroundImage: `url(${heroImg})`,
                }}
            />

            <div className="h-8" /> {/* Spacer for visual balance */}

            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 text-center mx-auto transform hover:-translate-y-2 transition-transform duration-300">
                <h2 
                    id="hero-title" 
                    className="text-green-700 text-3xl font-bold mb-4 animate-pulse hover:text-green-800 transition-colors duration-300"
                >
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
                                <button
                                    id="signup-button"
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-none py-3 px-8 rounded-md text-base cursor-pointer font-bold transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Sign Up
                                </button>
                            </Link>
                            <Link to="/login">
                                <button
                                    id="cta-button"
                                    className="bg-green-700 hover:bg-green-800 text-white border-none py-3 px-8 rounded-md text-base cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
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
    );
}

export default Home;