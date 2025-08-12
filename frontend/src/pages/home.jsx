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
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#f9f9f9",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 600,
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    padding: "32px 16px",
                    textAlign: "center",
                }}
            >
                <h2 id="hero-title" style={{ color: "#2d7b4f", marginBottom: 16 }}>
                    Chama Vault
                </h2>
                <p style={{ fontSize: "1.15em", marginBottom: 24 }}>
                    Welcome to Chama Vault! <br />
                    Chama Vault is a simple, secure platform for group savings and financial management.
                    Track your savings, set milestones, and manage your group with ease.<br /><br />
                    <strong>Features:</strong>
                </p>
                <ul style={{ textAlign: "left", display: "inline-block", margin: "16px auto", fontSize: "1em" }}>
                    <li>Group savings dashboard</li>
                    <li>Personal savings milestones</li>
                    <li>Admin panel for group management</li>
                    <li>Easy password reset and secure login</li>
                </ul>
                <div style={{ marginTop: 32 }}>
                    {!isLoggedIn && (
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
                                    cursor: "pointer",
                                    marginRight: "10px"
                                }}
                            >
                                Log In
                            </button>
                        </Link>
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