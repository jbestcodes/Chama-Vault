import { useEffect, useState } from 'react';
import axios from 'axios';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/savings/my-profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Error fetching profile');
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <p>Total Savings: Ksh {profile.totalSavings}</p>
      <p>Your Rank: {profile.rank}</p>

      <h3>Leaderboard</h3>
      <ul>
        {profile.leaderboard.map((member, index) => (
          <li key={index}>
            {member.name} - Ksh {member.totalSavings?
            member.tota_savings.toLocaleString() : 0}
          </li>
        ))}
      </ul>
      <h3>Your Savings History</h3>
      <ul>
        {profile.savingsHistory.length === 0 && <li>No savings history available yet</li>}
        {profile.savingsHistory.map(saving => (
          <li key={saving.id}>
            Ksh {saving.amount} - {new Date(saving.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyProfile;
