import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar (){
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login'; // Redirect to login page after logout
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
            timeout = setTimeout(logout, 15 * 60 * 1000); // 15 minutes
        };

        // Listen for user activity
        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);

        // Start timer on mount
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
                background: "#2d7b4f",
                padding: "16px 0",
                marginBottom: "32px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "32px"
                }}
            >
                <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
                    Home
                </Link>
                <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>
                    Dashboard
                </Link>
                <Link to="/my-profile" style={{ color: "#fff", textDecoration: "none" }}>
                    My Profile
                </Link>
                {!token? (
                    <>
                    <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>
                        Login
                    </Link>
                    <Link to="/register" style={{ color: "#fff", textDecoration: "none" }}>
                        Register
                    </Link>
                    </>
                ) :(
                    <button onClick={handleLogout} className="text-red-500 hover:underline">
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
export default Navbar;