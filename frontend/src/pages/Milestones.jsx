import React, { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

function Recommendation() {
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    const fetchRecommendation = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/api/savings/milestone/recommendation`, // <-- Use backticks and apiUrl
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendation(res.data.recommendation);
    };
    fetchRecommendation();
  }, []);

  return (
    <div
      style={{
        margin: "20px 0",
        color: "#2d7b4f",
        fontWeight: "bold",
      }}
    >
      {recommendation}
    </div>
  );
}

function MilestoneProgress({ currentSavings, target }) {
  const percentage = Math.min((currentSavings / target) * 100, 100);
  return (
    <div style={{
      width: '100%',
      height: 18,
      background: '#e0e0e0',
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 12
    }}>
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          background:
            percentage < 50
              ? '#90caf9' // light blue
              : '#81c784', // lighter green
          transition: 'width 0.5s'
        }}
      />
      <span style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        fontWeight: 600,
        fontSize: 13,
        color: '#222'
      }}>
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}

function Milestones() {
  const [milestones, setMilestones] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [milestoneName, setMilestoneName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editMilestoneName, setEditMilestoneName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");

  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${apiUrl}/api/savings/milestone`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMilestones(response.data.milestones);
      setTotalSavings(response.data.total_savings);
    } catch (err) {
      setError("Error fetching milestones");
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (Number(targetAmount) <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiUrl}/api/savings/milestone`, // <-- Use backticks and apiUrl
        {
          milestone_name: milestoneName,
          target_amount: targetAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      setMilestoneName("");
      setTargetAmount("");
      fetchMilestones();
    } catch (err) {
      setError(
        err.response?.data?.error || "Error creating milestone"
      );
    }
  };

  const handleEdit = (milestone) => {
    setEditId(milestone.id);
    setEditMilestoneName(milestone.milestone_name);
    setEditTargetAmount(milestone.target_amount);
    setMessage("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const milestone = milestones.find(m => m.id === editId);
    if (milestone && Number(editTargetAmount) < Number(milestone.amount_saved)) {
      setError("Target cannot be less than amount already saved.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/api/auth/milestone/${editId}`, // <-- Use backticks and apiUrl
        {
          milestone_name: editMilestoneName,
          target_amount: editTargetAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Milestone updated successfully.");
      setEditId(null);
      setEditMilestoneName("");
      setEditTargetAmount("");
      fetchMilestones();
    } catch (err) {
      setError(
        err.response?.data?.error || "Error updating milestone"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditMilestoneName("");
    setEditTargetAmount("");
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${apiUrl}/api/savings/milestone/${id}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Milestone deleted successfully.");
      fetchMilestones();
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting milestone");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2 style={{ padding: "14px 0 18px 0" }}>My Savings Milestones</h2>
      <Recommendation />
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Milestone Name"
          value={milestoneName}
          onChange={(e) => setMilestoneName(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <button type="submit">Add Milestone</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>Your Total Savings: Ksh {totalSavings}</h3>
      <ul>
        {milestones.length === 0 && <li>No milestones yet.</li>}
        {milestones.map((m) =>
          editId === m.id ? (
            <li key={m.id} style={{ marginBottom: 15 }}>
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={editMilestoneName}
                  onChange={(e) => setEditMilestoneName(e.target.value)}
                  required
                  style={{ marginRight: 10 }}
                />
                <input
                  type="number"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  required
                  style={{ marginRight: 10 }}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancelEdit} style={{ marginLeft: 8 }}>
                  Cancel
                </button>
              </form>
            </li>
          ) : (
            <li key={m.id} style={{ marginBottom: 15, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <strong>{m.milestone_name}</strong> <br />
                Target: Ksh {m.target_amount} <br />
                Saved: Ksh {m.amount_saved} <br />
                Remaining: Ksh {m.amount_remaining} <br />
                Progress: {Math.round(m.progress)}%
                <button
                  style={{ marginTop: 8 }}
                  onClick={() => handleEdit(m)}
                >
                  Edit
                </button>
                <button
                  style={{ marginTop: 8, marginLeft: 8, background: "#d32f2f", color: "#fff" }}
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>
              </div>
              <MilestoneProgress currentSavings={m.amount_saved} target={m.target_amount} />
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Milestones;