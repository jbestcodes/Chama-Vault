import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const apiUrl = import.meta.env.VITE_API_URL;

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
        const response = await axios.get(`${apiUrl}/api/savings/my-profile`, {
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
        `${apiUrl}/api/auth/update-profile`,
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
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>My Profile</h2>
      <div
        className="my-profile-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr",
          gap: 24,
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        {/* Left: Name, Phone, Edit */}
        <div style={{ background: "#f0f4ff", borderRadius: 10, padding: 16 }}>
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
        </div>

        {/* Middle: Group, Savings, Rank */}
        <div style={{ background: "#e8f5e9", borderRadius: 10, padding: 16 }}>
          <p><strong>Group Name:</strong> {profile.group_name || "N/A"}</p>
          <p><strong>Total Savings:</strong> Ksh {profile.total_savings}</p>
          <p><strong>Your Rank:</strong> {profile.rank !== null ? profile.rank : "N/A"}</p>
        </div>

        {/* Right: Leaderboard */}
        <div style={{ background: "#fff8e1", borderRadius: 10, padding: 16 }}>
          <h3>Leaderboard</h3>
          <ul>
            {(profile.leaderboard || []).map((member, index) => (
              <li key={index}>
                {member.name} - {member.total_savings && member.total_savings > 0
                  ? `Ksh ${member.total_savings.toLocaleString()}`
                  : 'No contribution yet'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Bar Chart below the grid */}
      {profile.leaderboard && profile.leaderboard.length > 0 && (
        <div style={{ background: "#f3f7fa", borderRadius: 10, padding: 16, marginBottom: 32 }}>
          <h3>Group Savings Chart</h3>
          <div style={{ width: "100%", maxWidth: 700, height: 300, margin: "0 auto" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={profile.leaderboard}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_savings" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Savings History below the chart */}
      <div style={{ background: "#f9fbe7", borderRadius: 10, padding: 16 }}>
        <h3>Your Savings History</h3>
        <ul>
          {(!profile.savingsHistory || profile.savingsHistory.length === 0) && <li>No savings history available yet</li>}
          {(profile.savingsHistory || []).map(saving => (
            <li key={saving.id}>
              Ksh {saving.amount} - {new Date(saving.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 900px) {
            .my-profile-grid {
              grid-template-columns: 1fr !important;
              grid-template-areas:
                "left"
                "middle"
                "right";
            }
          }
        `}
      </style>
    </div>
  );
}

export default MyProfile;
