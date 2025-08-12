import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Milestones from './Milestones';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/savings/dashboard', {
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
      <h2>Dashboard</h2>

      {/* Show admin panel link only for admins */}
      {role && role.toLowerCase() === 'admin' && (
        <div style={{ marginBottom: '20px' }}>
          <Link to="/admin-panel">
            <button>View Admin Panel</button>
          </Link>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p><strong>Total Savings (You): Ksh </strong> {data.totalSavings}</p>
        <p><strong>Total Members:</strong> {data.totalMembers}</p>
        <p><strong>Total Savings (All Members):</strong> {data.totalSavingsAll}</p>
        <p><strong>Your Rank:</strong> {data.userRank}</p>
        <Link to="/my-profile">My Profile</Link>

        {data.lastContribution ? (
          <p>
            <strong>Last Contribution:</strong> {data.lastContribution.amount} on{' '}
            {new Date(data.lastContribution.date).toLocaleDateString()}
          </p>
        ) : (
          <p><strong>Last Contribution:</strong> No contributions yet</p>
        )}
      </div>
      <Milestones />
    </div>
  );
};

export default Dashboard;