import React from "react";
import { Link } from "react-router-dom";

function Home() {
    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div
            id="home-section"
            style={{
                minHeight: "100vh",
                width: "100vw",
                boxSizing: "border-box",
                background: "#e8f5e9",
                padding: "24px",
            }}
        >
            <div style={{ height: 32 }} /> {/* Spacer for visual balance */}

            <div
                style={{
                    width: "100%",
                    maxWidth: 600,
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "32px 16px",
                    textAlign: "center",
                    margin: "0 auto"
                }}
            >
                <h2 id="hero-title" style={{ color: "#2d7b4f", marginBottom: 16 }}>
                    Chama Vault
                </h2>
                <p style={{ fontSize: "1.15em", marginBottom: 24 }}>
                    Welcome to Chama Vault! <br />
                    Chama Vault is a simple, secure platform for group savings and financial management.<br />
                    Track your savings, set milestones, and manage your group with ease.<br /><br />
                    <strong>Features:</strong>
                </p>
                <ul style={{ textAlign: "left", display: "inline-block", margin: "16px auto", fontSize: "1em" }}>
                    <li>Group savings dashboard with masked leaderboard</li>
                    <li>Personal savings milestones and progress tracking</li>
                    <li>Admin panel for group management and savings matrix</li>
                    <li>Visual charts for group savings</li>
                    <li>Secure login and easy password reset</li>
                    <li>Contribution history and weekly tracking</li>
                    <li>Group-specific ranking and analytics</li>
                </ul>
                <div style={{ marginTop: 32 }}>
                    {!isLoggedIn && (
                        <>
                            <Link to="/register">
                                <button
                                    id="signup-button"
                                    style={{
                                        background: "#1976d2",
                                        color: "#fff",
                                        border: "none",
                                        padding: "12px 32px",
                                        borderRadius: "6px",
                                        fontSize: "1em",
                                        cursor: "pointer",
                                        marginRight: "10px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Sign Up
                                </button>
                            </Link>
                            <Link to="/login">
                                <button
                                    id="cta-button"
                                    style={{
                                        background: "#2d7b4f",
                                        color: "#fff",
                                        border: "none",
                                        padding: "12px 32px",
                                        borderRadius: "6px",
                                        fontSize: "1em",
                                        cursor: "pointer"
                                    }}
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
                            style={{
                                background: "#d32f2f",
                                color: "#fff",
                                border: "none",
                                padding: "12px 32px",
                                borderRadius: "6px",
                                fontSize: "1em",
                                cursor: "pointer"
                            }}
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