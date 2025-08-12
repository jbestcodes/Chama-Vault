import React, { useEffect, useState } from "react";
import axios from "axios";

function Recommendation() {
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    const fetchRecommendation = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/savings/milestone/recommendation",
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
        "http://localhost:5000/api/savings/milestone",
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
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/savings/milestone",
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
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/auth/milestone/${editId}`,
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

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>My Savings Milestones</h2>
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
            <li key={m.id} style={{ marginBottom: 15 }}>
              <strong>{m.milestone_name}</strong> <br />
              Target: Ksh {m.target_amount} <br />
              Saved: Ksh {m.amount_saved} <br />
              Remaining: Ksh {m.amount_remaining} <br />
              Progress: {Math.round(m.progress)}%
              <div
                style={{
                  background: "#eee",
                  height: 10,
                  width: "100%",
                  marginTop: 5,
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#4caf50",
                    width: `${Math.round(m.progress)}%`,
                    height: "100%",
                  }}
                ></div>
              </div>
              <button
                style={{ marginTop: 8 }}
                onClick={() => handleEdit(m)}
              >
                Edit
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Milestones;