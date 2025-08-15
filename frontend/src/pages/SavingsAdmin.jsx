import React, { useEffect, useState } from "react";
import axios from "axios";

function SavingsAdmin() {
  const [members, setMembers] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [savingsMatrix, setSavingsMatrix] = useState({});
  const [groupTotal, setGroupTotal] = useState(0);
  const [amount, setAmount] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [memberId, setMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingMembers, setPendingMembers] = useState([]);
  const [approvalMsg, setApprovalMsg] = useState("");

  // Fetch only the group-specific matrix (members, weeks, matrix, groupTotal)
  const fetchMatrix = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/savings/matrix", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeks(res.data.weeks);
      setMembers(res.data.members);
      setSavingsMatrix(res.data.matrix);
      setGroupTotal(res.data.groupTotal);
    } catch (err) {
      setError("Failed to load group savings data.");
    }
  };

  useEffect(() => {
    fetchMatrix();
    // eslint-disable-next-line
  }, []);

  // Correct way to sum member totals
  const getMemberTotal = (memberId) => {
    return weeks.reduce((sum, week) => {
      return sum + Number(savingsMatrix[week]?.[memberId] || 0);
    }, 0);
  };

  // Helper to get week total
  const getWeekTotal = (week) => {
    return members.reduce((sum, member) => {
      return sum + Number(savingsMatrix[week]?.[member.id] || 0);
    }, 0);
  };

  // Add savings handler
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/savings/admin/add",
        { member_id: memberId, week_number: weekNumber, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Savings added successfully.");
      setAmount("");
      setWeekNumber("");
      setMemberId("");
      await fetchMatrix();
    } catch (err) {
      setError(err.response?.data?.error || "Error adding savings");
    }
  };

  return (
    <div style={{ overflowX: "auto", padding: 20 }}>
      <h2>Admin Savings Matrix (Your Group)</h2>
      {/* Add/Edit/Update Savings Form at the Top */}
      <form onSubmit={handleAdd} style={{ marginBottom: 24, background: "#f5f5f5", padding: 16, borderRadius: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <select
          id="memberId"
          name="memberId"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
          style={{ minWidth: 140 }}
        >
          <option value="">Select Member</option>
          {members.filter(m => m.id != null).map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
        <input
          id="amount"
          name="amount"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ minWidth: 100 }}
        />
        <input
          id="weekNumber"
          name="weekNumber"
          type="number"
          placeholder="Week Number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          required
          style={{ minWidth: 120 }}
        />
        <button type="submit" style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 18px", fontWeight: "bold" }}>
          Add Savings
        </button>
        {message && <span style={{ color: "green", marginLeft: 10 }}>{message}</span>}
        {error && <span style={{ color: "red", marginLeft: 10 }}>{error}</span>}
      </form>
      {/* Savings Matrix Table */}
      <table style={{ borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Week</th>
            {members.filter(m => m.id != null).map((member) => (
              <th key={member.id} style={{ border: "1px solid #ccc", padding: 8 }}>
                {member.full_name}
                <br />
                <span style={{ fontSize: "0.9em", color: "#555" }}>{member.phone}</span>
              </th>
            ))}
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Week Total</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{week}</td>
              {members.filter(m => m.id != null).map((member) => (
                <td
                  key={member.id}
                  style={{ border: "1px solid #ccc", padding: 8 }}
                >
                  {savingsMatrix[Number(week)]?.[Number(member.id)] || 0}
                </td>
              ))}
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  fontWeight: "bold",
                }}
              >
                {getWeekTotal(week)}
              </td>
            </tr>
          ))}
          <tr style={{ background: "#f5f5f5", fontWeight: "bold" }}>
            <td>Member Total</td>
            {members.filter(m => m.id != null).map((member) => (
              <td key={member.id}>{getMemberTotal(member.id)}</td>
            ))}
            <td>{groupTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SavingsAdmin;