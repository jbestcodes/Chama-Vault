import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from './media/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();
    const location = window.location.pathname;

    // Update token state when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'));
        };
        
        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Also check periodically in case of same-tab changes
        const interval = setInterval(() => {
            setToken(localStorage.getItem('token'));
        }, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Responsive handler
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null); // Update state immediately
        window.location.href = '/login';
    };

    // Auto-logout on inactivity
    useEffect(() => {
        let timeout;
        const logout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
        };

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(logout, 15 * 60 * 1000);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        resetTimer();

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
        };
    }, [navigate]);

    return (
        <nav
            style={{
                width: "100%",
                background: "#800000",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "12px 0",
                position: "sticky",
                top: 0,
                zIndex: 100,
                borderBottom: "2px solid #600000",
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    padding: "0 20px",
                    flexWrap: "wrap",
                }}
            >
                {/* Logo Section */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0
                }}>
                    <img
                        src={logoImage}
                        alt="Jaza Nyumba Logo"
                        style={{
                            height: "40px",
                            width: "40px",
                            objectFit: "contain",
                            borderRadius: "6px"
                        }}
                    />
                    <span style={{
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "22px",
                        letterSpacing: "0.5px",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                    }}>
                        Jaza Nyumba
                    </span>
                </div>

                {/* Hamburger Menu Toggle Button */}
                {isMobile && (
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '20px',
                            cursor: 'pointer',
                            order: 1,
                            padding: '8px',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                        }}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                )}

                {/* Navigation Links Container */}
                <div
                    style={{
                        display: isMobile ? (isMenuOpen ? "flex" : "none") : "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: "center",
                        gap: isMobile ? "15px" : "24px",
                        marginTop: isMobile ? "15px" : "0",
                        flex: 1,
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                    }}
                >
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease",
                            position: "relative"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Home
                    </Link>
                    <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/why-us"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Why Us
                    </Link>
                    <Link
                        to="/contact"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        Contact Us
                    </Link>
                    <Link
                        to="/ai-dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        AI Assistant
                    </Link>
                    <Link
                        to="/user-guide"
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "16px",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                            e.target.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        User Guide
                    </Link>
                    {token && (location === '/dashboard' || location === '/my-profile' || location === '/ai-dashboard' || location.includes('/admin')) ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "#d32f2f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: "pointer",
                                marginLeft: isMobile ? 0 : "8px",
                                marginTop: isMobile ? "10px" : 0,
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#b71c1c";
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#d32f2f";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                            }}
                        >
                            Logout
                        </button>
                    ) : !token && location !== '/login' && location !== '/register' && (
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                background: "#4CAF50",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontWeight: "600",
                                fontSize: "14px",
                                marginLeft: isMobile ? 0 : "8px",
                                marginTop: isMobile ? "10px" : 0,
                                display: "inline-block",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#388e3c";
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#4CAF50";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;