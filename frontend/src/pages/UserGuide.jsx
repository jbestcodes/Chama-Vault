import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function UserGuide() {
  const [activeSection, setActiveSection] = useState('getting-started');

  useEffect(() => {
    document.title = "User Guide - Jaza Nyumba | How to Use Our Platform";
  }, []);

  const sections = {
    'getting-started': {
      title: '🚀 Getting Started',
      icon: '🚀',
      content: [
        {
          subtitle: 'Welcome to Jaza Nyumba!',
          text: 'Jaza Nyumba is your comprehensive group savings platform designed to make managing your Chama or savings group easy and transparent.'
        },
        {
          subtitle: '1. Creating Your Account',
          text: 'Start by registering for a new account. You\'ll need to provide your basic information including phone number for SMS notifications.'
        },
        {
          subtitle: '2. Joining a Group',
          text: 'You can register as an admin or member. A group can only have one admin. After registration, you can either create a new(if you register as admin) savings group or join an existing one using an invitation code from your group admin.'
        },
        {
          subtitle: '3. Setting Up Your Profile(Admin)',
          text: 'Complete your profile with your contribution preferences, savings goals, and notification settings to get the most out of the platform.'
        }
      ]
    },
    'features': {
      title: '✨ Key Features',
      icon: '✨',
      content: [
        {
          subtitle: '💰 Smart Savings Tracking',
          text: 'Monitor your weekly contributions, track your savings growth, and view detailed analytics of your financial progress.'
        },
        {
          subtitle: '🔄 Merry-go-Round System',
          text: 'Participate in rotating savings with automated tracking, contribution timing ratings, and fair distribution management.'
        },
        {
          subtitle: '💳 Loan Management',
          text: 'Apply for loans based on your contribution history, track repayments, and build your credit profile within the group.'
        },
        {
          subtitle: '🤖 AI Assistant',
          text: 'Get personalized financial advice, group rule clarifications, and savings tips from our intelligent assistant.'
        },
        {
          subtitle: '📊 Performance Analytics',
          text: 'View your payment timing performance, contribution consistency, and overall financial health metrics.'
        },
        {
          subtitle: '📱 SMS Notifications',
          text: 'Receive timely reminders for contributions, meeting dates, loan repayments, and important group announcements.'
        }
      ]
    },
    'dashboard': {
      title: '🏠 Dashboard Guide',
      icon: '🏠',
      content: [
        {
          subtitle: 'Dashboard Overview',
          text: 'Your dashboard is your financial command center, showing all important information at a glance.'
        },
        {
          subtitle: '📈 Savings Summary',
          text: 'View your total savings, recent contributions, and progress towards your personal savings goals.'
        },
        {
          subtitle: '📅 Upcoming Activities',
          text: 'See upcoming contribution deadlines, meeting dates, and loan repayment schedules to stay on track.'
        },
        {
          subtitle: '🏆 Performance Metrics',
          text: 'Track your contribution timing, attendance record, and overall group standing with visual indicators.'
        },
        {
          subtitle: '💬 Recent Activity',
          text: 'Stay updated with recent group activities, announcements, and member interactions.'
        }
      ]
    },
    'table-banking': {
      title: '🔄 Merry-go-Round System',
      icon: '🔄',
      content: [
        {
          subtitle: 'What is Merry-go-Round System?',
          text: 'Merry-go-Round System is a rotating savings system where members take turns receiving the collective contributions from the group.'
        },
        {
          subtitle: 'How It Works',
          text: 'Each cycle, one member receives the total contributions from all members. The order is determined fairly and tracked automatically.'
        },
        {
          subtitle: 'Contribution Timing',
          text: 'Your contributions are rated as Early, On-time, or Late. Consistent early/on-time payments improve your group standing.'
        },
        {
          subtitle: 'Receiving Your Turn',
          text: 'When it\'s your turn to receive, you\'ll be notified via SMS and dashboard alerts. The amount depends on group size and contribution levels.'
        },
        {
          subtitle: 'Performance Impact',
          text: 'Your table banking performance affects loan eligibility and group trust. Maintain good payment habits for better benefits.'
        }
      ]
    },
    'loans': {
      title: '💳 Loans & Repayments',
      icon: '💳',
      content: [
        {
          subtitle: 'Loan Eligibility',
          text: 'Loan eligibility is based on your contribution history, payment timing performance, and group standing.'
        },
        {
          subtitle: 'Applying for Loans',
          text: 'Submit loan applications through the loans section. Include the amount, purpose, and proposed repayment schedule.'
        },
        {
          subtitle: 'Interest Rates',
          text: 'Interest rates are determined by group rules and your performance history. Better performers get preferential rates.'
        },
        {
          subtitle: 'Repayment Tracking',
          text: 'Track your repayment schedule, make payments, and monitor your loan balance through the dedicated loans section.'
        },
        {
          subtitle: 'Performance Rating',
          text: 'Loan repayments are also rated for timing. Consistent on-time payments improve your overall financial profile.'
        }
      ]
    },
    'admin': {
      title: '👑 Admin Features',
      icon: '👑',
      content: [
        {
          subtitle: 'Group Management',
          text: 'Admins can invite new members, manage group settings, and oversee all group financial activities.'
        },
        {
          subtitle: 'Contribution Oversight',
          text: 'Rate member contribution timing, track group performance, and manage table banking cycles.'
        },
        {
          subtitle: 'Loan Administration',
          text: 'Review loan applications, set interest rates, approve loans, and monitor repayment performance.'
        },
        {
          subtitle: 'Custom Rules',
          text: 'Create and manage group-specific rules that guide member behavior and AI assistant responses.'
        },
        {
          subtitle: 'Analytics Dashboard',
          text: 'Access comprehensive group analytics, performance reports, and financial trends.'
        },
        {
          subtitle: 'Member Performance',
          text: 'View and rate individual member performance across all financial activities.'
        }
      ]
    },
    'tips': {
      title: '💡 Success Tips',
      icon: '💡',
      content: [
        {
          subtitle: '⏰ Stay Consistent',
          text: 'Make contributions early or on-time consistently. This builds trust and improves your loan eligibility.'
        },
        {
          subtitle: '🎯 Set Clear Goals',
          text: 'Define specific savings goals and use the milestone tracking to monitor your progress regularly.'
        },
        {
          subtitle: '📱 Use Notifications',
          text: 'Keep SMS notifications enabled to never miss contribution deadlines or important group updates.'
        },
        {
          subtitle: '🤖 Leverage AI Assistant',
          text: 'Use the AI assistant for financial advice, group rule clarifications, and savings optimization tips.'
        },
        {
          subtitle: '📊 Monitor Performance',
          text: 'Regularly check your performance metrics to identify areas for improvement and track your growth.'
        },
        {
          subtitle: '💬 Stay Engaged',
          text: 'Participate actively in group activities and maintain good communication with fellow members.'
        }
      ]
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "0",
    }}>
      <div style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "40px 20px",
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '30px',
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr',
          gap: '20px'
        }
      }}>
        
        {/* Navigation Sidebar */}
        <div style={{
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "25px",
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <h3 style={{ 
            color: "#333", 
            marginBottom: '20px',
            fontSize: '20px',
            textAlign: 'center'
          }}>📚 Guide Sections</h3>
          
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                width: '100%',
                padding: '12px 16px',
                margin: '8px 0',
                background: activeSection === key ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
                color: activeSection === key ? 'white' : '#333',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === key ? 'bold' : 'normal',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <span>{section.icon}</span>
              <span>{section.title.replace(/^[^\s]+ /, '')}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "40px"
        }}>
          
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            color: 'white'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '15px' }}>📖</div>
            <h1 style={{ 
              margin: '0 0 10px 0',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              Jaza Nyumba User Guide
            </h1>
            <p style={{ 
              margin: 0,
              fontSize: '18px',
              opacity: 0.9
            }}>
              Everything you need to know to succeed with your group savings
            </p>
          </div>

          {/* Active Section Content */}
          <div>
            <h2 style={{ 
              color: "#1976d2", 
              marginBottom: '30px',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {sections[activeSection].icon} {sections[activeSection].title}
            </h2>
            
            {sections[activeSection].content.map((item, index) => (
              <div key={index} style={{
                marginBottom: '30px',
                padding: '25px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ 
                  color: "#333", 
                  marginBottom: '15px',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {item.subtitle}
                </h3>
                <p style={{ 
                  color: "#666", 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            marginTop: '50px',
            padding: '30px',
            background: '#f0f2f5',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: "#333", 
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              Ready to Get Started? 🚀
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {!localStorage.getItem('token') && (
                <>
                  <Link to="/register">
                    <button style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Create Account
                    </button>
                  </Link>
                  <Link to="/login">
                    <button style={{
                      background: '#f8f9fa',
                      color: '#333',
                      border: '2px solid #667eea',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>
                      Sign In
                    </button>
                  </Link>
                </>
              )}
              {localStorage.getItem('token') && (
                <Link to="/dashboard">
                  <button style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    Go to Dashboard
                  </button>
                </Link>
              )}
              <Link to="/contact">
                <button style={{
                  background: '#f8f9fa',
                  color: '#333',
                  border: '2px solid #28a745',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                  Contact Support
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            padding: '20px',
            background: '#fff3cd',
            borderRadius: '10px',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ color: '#856404', marginBottom: '15px' }}>
              📌 Quick Links
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '14px'
            }}>
              <Link to="/why-us" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                Why Choose Us?
              </Link>
              <Link to="/terms" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                Terms & Conditions
              </Link>
              <Link to="/privacy" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                Privacy Policy
              </Link>
              <Link to="/contact" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserGuide;