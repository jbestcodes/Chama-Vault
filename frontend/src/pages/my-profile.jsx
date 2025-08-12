import { useEffect, useState } from 'react';
import axios from 'axios';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState('');

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
        setFullName(response.data.full_name);
        setPhone(response.data.phone);
      } catch (err) {
        setError('Error fetching profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/auth/update-profile', 
        { full_name: fullName, phone },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Profile updated successfully.');
      setProfile({ ...profile, full_name: fullName, phone });
      setEditMode(false);
    } catch (err) {
      setError('Error updating profile');
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return null;

  return (
    <div>
      <h2>My Profile</h2>
      {editMode ? (
        <form onSubmit={handleUpdateProfile} style={{ marginBottom: 16 }}>
          <div>
            <label>Full Name: </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Phone: </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p><strong>Full Name:</strong> {profile.full_name}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      )}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <p><strong>Group Name:</strong> {profile.group_name}</p>
      <p><strong>Total Savings:</strong> Ksh {profile.totalSavings}</p>
      <p><strong>Your Rank:</strong> {profile.rank}</p>

      <h3>Leaderboard</h3>
      <ul>
        {profile.leaderboard.map((member, index) => (
          <li key={index}>
            {member.name} - Ksh {member.total_savings ? member.total_savings.toLocaleString() : 0}
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
