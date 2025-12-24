import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useSEO from '../hooks/useSEO';

function WhyUs() {
  // SEO optimization for why-us page
  useSEO({
    title: "Why Choose Jaza Nyumba - Smart Group Savings Platform",
    description: "Discover why thousands of Chamas trust Jaza Nyumba for their group savings. AI-powered insights, automated SMS notifications, secure loan management, and comprehensive financial tools.",
    keywords: "why choose us, Chama benefits, group savings advantages, AI financial insights, SMS notifications, loan management, secure savings platform",
    url: "https://jazanyumba.online/why-us",
    type: "website"
  });

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
          To make group savings simple, transparent, and accessible for everyone, empowering communities to achieve their financial goals together through innovative technology.
        </p>

        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Our Vision</h3>
        <p>
          To be the leading AI-powered digital platform for group savings and financial collaboration across Africa, fostering trust, transparency, and prosperity for all.
        </p>

        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Unique Features That Set Us Apart</h3>
        <ul style={{
          fontSize: "1.08em",
          marginLeft: 0,
          paddingLeft: 24,
          listStylePosition: "inside"
        }}>
          <li style={{ marginBottom: 8 }}><strong>🤖 AI Financial Insights:</strong> Get personalized financial advice and deadline nudges powered by advanced AI</li>
          <li style={{ marginBottom: 8 }}><strong>⚡ Smart Performance Ratings:</strong> Track timing quality for contributions and loan repayments (excellent/good/fair/poor)</li>
          <li style={{ marginBottom: 8 }}><strong>🏆 Privacy-First Leaderboards:</strong> Masked member names with color-coded performance ratings protect privacy while fostering healthy competition</li>
          <li style={{ marginBottom: 8 }}><strong>📱 Automated SMS Reminders:</strong> Never miss a payment with intelligent SMS notifications via Africa's Talking</li>
          <li style={{ marginBottom: 8 }}><strong>🎯 Milestone Deadline Tracking:</strong> Set savings goals with target dates and get AI alerts when deadlines approach</li>
          <li style={{ marginBottom: 8 }}><strong>💬 Live AI Support Chat:</strong> Get instant help 24/7 with context-aware support powered by AI</li>
          <li style={{ marginBottom: 8 }}><strong>📊 Table Banking Management:</strong> Complete table banking with contribution timing ratings and detailed analytics</li>
          <li style={{ marginBottom: 8 }}><strong>🎨 Custom Group Rules:</strong> Admins can set personalized rules that AI uses for tailored advice</li>
          <li style={{ marginBottom: 8 }}><strong>🔒 Auto-Logout Security:</strong> Sessions expire after 30 minutes of inactivity for enhanced security</li>
          <li style={{ marginBottom: 8 }}><strong>📈 Advanced Analytics:</strong> Visual charts showing group performance trends and savings matrix</li>
          <li style={{ marginBottom: 8 }}><strong>� Flexible Subscription Plans:</strong> Affordable weekly (KES 30) or monthly (KES 100) plans to access premium features</li>
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