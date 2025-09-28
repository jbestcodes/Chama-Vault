import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  // Find the logged-in member's name (case-insensitive match)
  const myName = profile.full_name?.toLowerCase();

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>My Profile</h2>

      {/* Quick Actions Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        borderRadius: 12, 
        padding: 20, 
        marginBottom: 32,
        color: "white"
      }}>
        <h3 style={{ margin: "0 0 16px 0", color: "white" }}>🚀 Quick Actions</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16 
        }}>
          <Link 
            to="/withdrawal-request" 
            style={{ 
              textDecoration: "none",
              background: "rgba(255,255,255,0.2)",
              padding: "16px 20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "18px" }}>💰</span>
            Withdrawal Request
          </Link>

          <Link 
            to="/ai-dashboard" 
            style={{ 
              textDecoration: "none",
              background: "rgba(255,255,255,0.2)",
              padding: "16px 20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "18px" }}>🤖</span>
            AI Assistant
          </Link>

          <Link 
            to="/loans" 
            style={{ 
              textDecoration: "none",
              background: "rgba(255,255,255,0.2)",
              padding: "16px 20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "18px" }}>🏦</span>
            My Loans
          </Link>

          <Link 
            to="/dashboard" 
            style={{ 
              textDecoration: "none",
              background: "rgba(255,255,255,0.2)",
              padding: "16px 20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontWeight: "500"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "18px" }}>📊</span>
            Dashboard
          </Link>
        </div>
      </div>

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
          <h4 style={{ margin: "0 0 16px 0", color: "#1976d2" }}>👤 Personal Info</h4>
          {editMode ? (
            <form onSubmit={handleUpdateProfile} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Full Name: </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "500" }}>Phone: </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  type="submit"
                  style={{
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditMode(false)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p style={{ margin: "8px 0" }}><strong>Full Name:</strong> {profile.full_name}</p>
              <p style={{ margin: "8px 0" }}><strong>Phone:</strong> {profile.phone}</p>
              <button 
                onClick={() => setEditMode(true)}
                style={{
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginTop: "8px"
                }}
              >
                ✏️ Edit Profile
              </button>
            </>
          )}
          {success && <p style={{ color: 'green', fontSize: '14px', marginTop: '8px' }}>{success}</p>}
        </div>

        {/* Middle: Group, Savings, Rank */}
        <div style={{ background: "#e8f5e9", borderRadius: 10, padding: 16 }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#388e3c" }}>💎 Savings Summary</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ margin: 0 }}><strong>Group:</strong> {profile.group_name || "N/A"}</p>
            <p style={{ margin: 0, fontSize: "18px", color: "#2e7d32" }}>
              <strong>💰 Total Savings:</strong> Ksh {profile.total_savings}
            </p>
            <p style={{ margin: 0 }}>
              <strong>🏆 Your Rank:</strong> 
              <span style={{ 
                background: "#4caf50", 
                color: "white", 
                padding: "2px 8px", 
                borderRadius: "12px", 
                fontSize: "12px", 
                marginLeft: "8px" 
              }}>
                #{profile.rank !== null ? profile.rank : "N/A"}
              </span>
            </p>
            <div style={{ marginTop: "8px", padding: "8px", background: "rgba(255,255,255,0.7)", borderRadius: "6px" }}>
              <strong>🏢 Group Total:</strong> {profile.group_total_savings !== "Hidden" ? (
                <span style={{ color: "#2e7d32", fontWeight: "bold" }}> Ksh {profile.group_total_savings}</span>
              ) : (
                <span style={{ color: "#888" }}> Hidden</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div style={{ background: "#fff8e1", borderRadius: 10, padding: 16 }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#f57c00" }}>🏆 Group Leaderboard</h4>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {(!profile.leaderboard || profile.leaderboard.length === 0) ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>No leaderboard data available</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {profile.leaderboard.map((member, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "8px 12px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      ...(member.name?.toLowerCase() === myName
                        ? { 
                            background: "linear-gradient(135deg, #ff9800, #f57c00)", 
                            color: "white",
                            fontWeight: "bold",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                          }
                        : { background: "rgba(255,193,7,0.1)" })
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ 
                        marginRight: "8px", 
                        fontWeight: "bold",
                        minWidth: "20px"
                      }}>
                        {index + 1}.
                      </span>
                      {member.name}
                      {member.name?.toLowerCase() === myName && (
                        <span style={{ marginLeft: "6px", fontSize: "12px" }}>(You)</span>
                      )}
                    </span>
                    <span style={{ fontWeight: "bold" }}>
                      {member.total_savings && member.total_savings > 0
                        ? `Ksh ${member.total_savings.toLocaleString()}`
                        : 'No contribution'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart below the grid */}
      {profile.leaderboard && profile.leaderboard.length > 0 && (
        <div style={{ background: "#f3f7fa", borderRadius: 10, padding: 16, marginBottom: 32 }}>
          <h3 style={{ color: "#1976d2" }}>📊 Group Savings Chart</h3>
          <div style={{ width: "100%", maxWidth: 700, height: 300, margin: "0 auto" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profile.leaderboard}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_savings">
                  {profile.leaderboard.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        entry.name?.toLowerCase() === myName
                          ? "#ff9800" // Highlight color for logged-in member
                          : "#1976d2"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Savings History below the chart */}
      <div style={{ background: "#f9fbe7", borderRadius: 10, padding: 16 }}>
        <h3 style={{ color: "#689f38" }}>📈 Your Savings History</h3>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {(!profile.savingsHistory || profile.savingsHistory.length === 0) ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>No savings history available yet</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {profile.savingsHistory.map(saving => (
                <li 
                  key={saving.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    marginBottom: "6px",
                    background: "rgba(139,195,74,0.1)",
                    borderRadius: "6px",
                    borderLeft: "4px solid #8bc34a"
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#689f38" }}>
                    Ksh {saving.amount}
                  </span>
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {new Date(saving.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
