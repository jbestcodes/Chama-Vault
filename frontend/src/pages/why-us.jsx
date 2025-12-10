import React from "react";
import { Link } from "react-router-dom";

function WhyUs() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "lavender",
      padding: "0",
    }}>
      <div style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "32px 20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ color: "#2d7b4f", marginBottom: 16 }}>Why Choose Jaza Nyumba?</h2>
        
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Tagline</h3>
        <p style={{ fontSize: "1.15em", fontStyle: "italic" }}>
          "Empowering Groups. Securing Futures."
        </p>

        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Our Mission</h3>
        <p>
          To make group savings simple, transparent, and accessible for everyone, empowering communities to achieve their financial goals together.
        </p>

        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Our Vision</h3>
        <p>
          To be the leading digital platform for group savings and financial collaboration across Africa, fostering trust and prosperity for all.
        </p>

        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Our Advantages</h3>
        <ul style={{
          fontSize: "1.08em",
          marginLeft: 0,
          paddingLeft: 24,
          listStylePosition: "inside"
        }}>
          <li style={{ marginBottom: 8 }}>Group-specific dashboards and analytics for clear financial tracking</li>
          <li style={{ marginBottom: 8 }}>Masked leaderboards to protect member privacy</li>
          <li style={{ marginBottom: 8 }}>Personal milestones and progress tracking for every member</li>
          <li style={{ marginBottom: 8 }}>Admin panel for easy group management and savings oversight</li>
          <li style={{ marginBottom: 8 }}>Visual charts for group performance and trends</li>
          <li style={{ marginBottom: 8 }}>Secure authentication and data protection</li>
          <li style={{ marginBottom: 8 }}>Easy onboarding and intuitive user experience</li>
          <li style={{ marginBottom: 8 }}>Transparent contribution history and weekly tracking</li>
        </ul>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/register">
            <button
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                padding: "12px 32px",
                borderRadius: "6px",
                fontSize: "1em",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WhyUs;