import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from './media/logo.png';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

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
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                padding: "7px 0",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}
        >
            <div
                style={{
                    maxWidth: 900,
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "28px",
                    padding: "0 8px",
                    flexWrap: "wrap",
                }}
            >
                {/* Logo Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                        src={logoImage}
                        alt="Jaza Nyumba Logo"
                        style={{ height: "32px", width: "32px", objectFit: "contain" }}
                    />
                    <span style={{ color: "#fff", fontWeight: "bold", fontSize: "18px" }}>
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
                            fontSize: '24px',
                            cursor: 'pointer',
                            order: 1,
                        }}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? '✕' : '≡'}
                    </button>
                )}

                {/* Navigation Links Container */}
                <div
                    style={{
                        display: isMobile ? (isMenuOpen ? "flex" : "none") : "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: "center",
                        gap: isMobile ? "10px" : "28px",
                        marginTop: isMobile ? "10px" : "0",
                        flex: 1,
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                    }}
                >
                    <Link to="/" onClick={() => setIsMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                        Home
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                        Dashboard
                    </Link>
                    <Link to="/why-us" onClick={() => setIsMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                        Why Us
                    </Link>
                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                        Contact Us
                    </Link>
                    <Link to="/ai-dashboard" onClick={() => setIsMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                        AI Assistant
                    </Link>
                    {token && (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "#d32f2f",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 14px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginLeft: isMobile ? 0 : "10px",
                                marginTop: isMobile ? "10px" : 0,
                            }}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;