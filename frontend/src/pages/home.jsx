import React, { useState, useEffect, useContext, createContext } from "react";
import { Link } from "react-router-dom";

// --- 1. Theme Context for Global State ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // Default to dark theme

    // Effect to run once on mount to set initial theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('color-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    // Apply theme to the root HTML element whenever it changes
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('color-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// --- 2. Header Component (Theme Toggle Removed) ---
const Header = () => {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <header className="fixed top-0 left-0 w-full z-50 p-4 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm transition-colors duration-500 border-b border-gray-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    Chama Vault
                </h1>
                <div className="flex items-center gap-4">
                    {isLoggedIn && (
                         <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("role");
                                window.location.reload();
                            }}
                            className="text-red-500 hover:text-red-400 font-semibold"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};


// --- 3. Main Page Content ---
const HomePageContent = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { title: "💰 Welcome to Chama Vault", subtitle: "Your Smart Group Savings Platform", link: "/login", linkText: "Login to Your Account", description: "Secure • Smart • Simple Group Savings" },
        { title: "🤝 Why Choose Us?", subtitle: "Trusted by Thousands of Chamas", link: "/why-us", linkText: "Learn Why Us", description: "Discover what makes us the preferred choice" },
        { title: "📋 Terms & Conditions", subtitle: "Transparent & Fair Policies", link: "/terms-and-conditions", linkText: "Read Terms", description: "Clear guidelines for secure savings" },
        { title: "🎯 Join Our Community", subtitle: "Start Your Savings Journey", link: "/register", linkText: "Register Now", description: "Create account and join successful savers" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const currentSlideData = slides[currentSlide];

    return (
        <div className="bg-gray-100 dark:bg-slate-900 transition-colors duration-500">
            <Header />
            
            {/* Hero Section */}
            <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-24">
                <div className="absolute inset-0 bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900"></div>
                
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                <div className="relative z-20 text-center max-w-5xl mx-auto px-4">
                    {/* Boxed container for hero text with increased padding */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 md:p-16 border border-gray-200 dark:border-slate-700 shadow-xl">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-gray-800 dark:text-white drop-shadow-2xl animate-fade-in">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-500 bg-clip-text text-transparent">
                                {currentSlideData.title}
                            </span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl md:text-3xl font-light mb-6 text-gray-600 dark:text-gray-200 animate-slide-up">
                            {currentSlideData.subtitle}
                        </p>
                        
                        <div className="bg-black/5 dark:bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-10 border border-black/10 dark:border-white/20 animate-bounce-in">
                            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-100 font-medium">
                                {currentSlideData.description}
                            </p>
                        </div>
                        
                        <Link to={currentSlideData.link}>
                            <button className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white px-12 py-5 rounded-full text-xl font-bold transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 animate-float">
                                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                                <span className="relative flex items-center justify-center gap-3">
                                    ✨ {currentSlideData.linkText} ✨
                                </span>
                            </button>
                        </Link>
                    </div>
                    
                    <div className="flex justify-center mt-12 space-x-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentSlide 
                                        ? 'bg-purple-600 dark:bg-white scale-125 shadow-lg' 
                                        : 'bg-gray-400/40 dark:bg-white/40 hover:bg-gray-500/60 dark:hover:bg-white/60'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute top-1/4 left-8 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce opacity-50 dark:opacity-80"></div>
                <div className="absolute top-1/3 right-12 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rotate-45 animate-wiggle opacity-50 dark:opacity-80"></div>
                <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse opacity-50 dark:opacity-80"></div>
                <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rotate-12 animate-bounce delay-1000 opacity-50 dark:opacity-80"></div>
            </div>

            {/* Welcome Section */}
            <div className="relative px-4 pt-10 pb-20 bg-gray-100 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-gray-900 dark:text-gray-100 text-4xl font-semibold animate-fade-in">
                            Welcome to Chama Vault
                    </h2>
                    <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        Chama Vault is your gateway to collaborative wealth building! <br />
                        Join thousands who are transforming their savings journey with our innovative platform.
                    </p>
                </div>
            </div>

            {/* Main Content Section - Features and CTAs */}
            <div id="home-section" className="relative px-4 pb-20 bg-gray-100 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    
                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-16 text-center border border-gray-200 dark:border-slate-700 hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50 transition-all duration-700 transform hover:-translate-y-2">
                        
                        <div className="mb-16">
                            <div className="bg-white/90 dark:bg-slate-700/50 rounded-2xl p-6 inline-block shadow-lg border border-purple-100 dark:border-slate-600">
                                <strong className="text-purple-600 dark:text-purple-400 text-2xl animate-pulse font-black">✨ Amazing Features ✨</strong>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 my-16">
                            {[
                                { icon: "📊", title: "Smart Dashboard", desc: "Group savings dashboard with masked leaderboard", color: "from-blue-500 to-purple-500" },
                                { icon: "🎯", title: "Goal Tracking", desc: "Personal savings milestones and progress tracking", color: "from-purple-500 to-pink-500" },
                                { icon: "🛡️", title: "Admin Control", desc: "Powerful admin panel for group management", color: "from-pink-500 to-red-500" },
                                { icon: "📈", title: "Visual Analytics", desc: "Beautiful charts for group savings insights", color: "from-green-500 to-blue-500" },
                                { icon: "🔒", title: "Bank-Level Security", desc: "Secure login and easy password recovery", color: "from-yellow-500 to-orange-500" },
                                { icon: "📅", title: "History Tracking", desc: "Complete contribution history and weekly tracking", color: "from-indigo-500 to-purple-500" },
                                { icon: "🏆", title: "Competitive Edge", desc: "Group-specific ranking and analytics", color: "from-orange-500 to-red-500" },
                                { icon: "💡", title: "Smart Notifications", desc: "Stay updated with real-time alerts", color: "from-teal-500 to-cyan-500" }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 cursor-pointer border border-gray-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 min-h-[220px] flex flex-col justify-center overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`}></div>
                                    
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" style={{animationDelay: `${index * 150}ms`}}>
                                            {feature.icon}
                                        </div>
                                        <h4 className="font-black text-gray-900 dark:text-white mb-3 text-lg group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">{feature.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-300 font-medium">{feature.desc}</p>
                                    </div>
                                    
                                    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-r ${feature.color} p-[2px] transition-opacity duration-500`}>
                                        <div className="w-full h-full bg-white dark:bg-slate-800 rounded-3xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Horizontal Button Layout for all screen sizes */}
                        <div className="mt-16 flex flex-row flex-wrap gap-8 justify-center items-center">
                            {!isLoggedIn && (
                                <>
                                    <Link to="/register" className="group">
                                        <button className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-500 hover:via-blue-500 hover:to-pink-500 text-white py-6 px-12 rounded-full text-xl font-black transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 overflow-hidden">
                                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                                            <span className="relative flex items-center justify-center gap-3">
                                                🎉 Join Now - It's Free! ✨
                                            </span>
                                        </button>
                                    </Link>
                                    <Link to="/login" className="group">
                                        <button className="relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 px-12 rounded-full text-xl font-black transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/50 overflow-hidden">
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

                        {/* Footer Section */}
                        <div className="mt-16">
                            <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-purple-900/50 rounded-3xl p-8 border border-purple-100 dark:border-slate-700 shadow-lg">
                                <div className="flex flex-wrap justify-center items-center gap-8">
                                    {[
                                        { icon: "🔐", text: "Bank-Level Security", color: "from-green-500 to-emerald-500" },
                                        { icon: "⚡", text: "Lightning Fast", color: "from-blue-500 to-cyan-500" },
                                        { icon: "🌟", text: "Trusted by Thousands", color: "from-purple-500 to-pink-500" }
                                    ].map((item, index) => (
                                        <div key={index} className="group relative bg-white dark:bg-slate-700 rounded-2xl px-8 py-4 shadow-md hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-gray-100 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
                                                <span className="font-black text-gray-900 dark:text-white text-lg group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">{item.text}</span>
                                            </div>
                                            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 bg-gradient-to-r ${item.color} transition-opacity duration-500`}></div>
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

// --- 4. Final Component Structure ---
function Home() {
    return (
        <ThemeProvider>
            <HomePageContent />
        </ThemeProvider>
    );
}

export default Home;