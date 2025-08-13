import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar (){
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
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/" className="navbar-link logo">
                    Home
                </Link>
                <Link to="/dashboard" className="navbar-link">
                    Dashboard
                </Link>
                <Link to="/my-profile" className="navbar-link">
                    My Profile
                </Link>
                {!token ? (
                    <>
                        <Link to="/login" className="navbar-link">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-link">
                            Register
                        </Link>
                    </>
                ) : (
                    <button onClick={handleLogout} className="navbar-link logout-btn">
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
export default Navbar;