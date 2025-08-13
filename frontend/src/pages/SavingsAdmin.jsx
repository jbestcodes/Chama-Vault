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

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Fetch members
    axios
      .get("http://localhost:5000/api/savings/members", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMembers(res.data.members));

    // Fetch savings matrix
    axios
      .get("http://localhost:5000/api/savings/matrix", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setWeeks(res.data.weeks);
        setSavingsMatrix(res.data.matrix);
        setGroupTotal(res.data.groupTotal);
      });
  }, []);

  // Correct way to sum member totals
  const getMemberTotal = (memberId) => {
    return weeks.reduce((sum, week) => {
      return sum + (savingsMatrix[week]?.[memberId] || 0);
    }, 0);
  };

  // Helper to get week total
  const getWeekTotal = (week) => {
    return members.reduce((sum, member) => {
      return sum + (savingsMatrix[week]?.[member.id] || 0);
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
        { member_id, week_number, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Savings added successfully.");
      setAmount("");
      setWeekNumber("");
      setMemberId("");
      // Refresh matrix
      const res = await axios.get("http://localhost:5000/api/savings/matrix", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeks(res.data.weeks);
      setSavingsMatrix(res.data.matrix);
      setGroupTotal(res.data.groupTotal);
    } catch (err) {
      setError(err.response?.data?.error || "Error adding savings");
    }
  };

  return (
    <div style={{ overflowX: "auto", padding: 20 }}>
      <h2>Admin Savings Matrix</h2>
      <table style={{ borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Week</th>
            {members.filter(m => m.id != null).map((member) => (
              <th key={member.id} style={{ border: "1px solid #ccc", padding: 8 }}>
                {member.full_name}
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
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <select
          id="memberId"
          name="memberId"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          required
          style={{ marginRight: 10 }}
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
          style={{ marginRight: 10 }}
        />
        <input
          id="weekNumber"
          name="weekNumber"
          type="number"
          placeholder="Week Number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <button type="submit">Add Savings</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default SavingsAdmin;