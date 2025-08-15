import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar () {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

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
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "28px",
                    padding: "0 8px"
                }}
            >
                <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                    Home
                </Link>
                <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                    Dashboard
                </Link>
                <Link to="/why-us" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                    Why Us
                </Link>
                <Link to="/contact" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                    Contact Us
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
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
export default Navbar;