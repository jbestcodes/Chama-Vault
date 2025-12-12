import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Milestones from './Milestones';
import TrialStatus from '../components/TrialStatus';

const apiUrl = import.meta.env.VITE_API_URL; 

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Get user's name from localStorage if available
  const userName = localStorage.getItem('full_name');

  // Check if user is logged in
  if (!token) {
    return (
      <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>Authentication Required</h2>
        <p style={{ marginBottom: '20px' }}>You must log in to view the dashboard.</p>
        <a href="/login" style={{
          background: '#800000',
          color: 'white',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          Go to Login
        </a>
      </div>
    );
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/api/savings/dashboard`, { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!data) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      {/* Greeting message */}
      {userName && (
        <h2
          style={{
            background: "#e3f2fd",
            padding: "18px 0",
            borderRadius: 10,
            textAlign: "center",
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 18,
            color: "#1976d2",
            letterSpacing: 1
          }}
        >
          Hello {userName}
        </h2>
      )}

      {/* AI Trial & Subscription Status */}
      <TrialStatus />

      {/* Show admin panel link only for admins */}
      {role && role.toLowerCase() === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <Link to="/admin-panel">
            <button type="button">View Admin Panel</button>
          </Link>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: '#e8f5e9',
            borderRadius: 10,
            padding: 16,
            minWidth: 150,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span role="img" aria-label="Money Bag" style={{ fontSize: 28 }}>💰</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Your Savings</div>
              <div style={{ fontSize: 18 }}>Ksh {data.totalSavings}</div>
            </div>
          </div>
          <div style={{
            background: '#fff8e1',
            borderRadius: 10,
            padding: 16,
            minWidth: 150,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span role="img" aria-label="People" style={{ fontSize: 28 }}>👥</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Members</div>
              <div style={{ fontSize: 18 }}>{data.memberCount}</div>
            </div>
          </div>
          <div style={{
            background: '#f0f4ff',
            borderRadius: 10,
            padding: 16,
            minWidth: 150,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span role="img" aria-label="Money Bag" style={{ fontSize: 28 }}>💰</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Group Savings</div>
              <div style={{ fontSize: 18 }}>Ksh {data.totalSavingsAll}</div>
            </div>
          </div>
        </div>
        <p>
          <strong>Your Rank:</strong> {data.userRank}
        </p>
        <Link
          to="/my-profile"
          style={{
            display: "inline-block",
            background: "#1976d2",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            margin: "16px 10px 16px 0"
          }}
        >
          My Profile
        </Link>
        <Link
          to="/loans"
          style={{
            display: "inline-block",
            background: "#388e3c",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            margin: "16px 0"
          }}
        >
          Loans & Repayments
        </Link>

        {data.lastContribution ? (
          <p>
            <strong>Last Contribution:</strong> {data.lastContribution.amount} on{' '}
            {data.lastContribution.date
              ? new Date(data.lastContribution.date).toLocaleDateString()
              : 'No date'}
          </p>
        ) : (
          <p><strong>Last Contribution:</strong> No contributions yet</p>
        )}

        {data.group_name && (
          <p><strong>Group:</strong> {data.group_name}</p>
        )}
      </div>
      <Milestones />
    </div>
  );
};

export default Dashboard;