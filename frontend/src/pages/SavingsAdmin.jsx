import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

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
  const [editing, setEditing] = useState({}); // { [week_member]: true }
  const [editValue, setEditValue] = useState("");

  // Fetch only the group-specific matrix (members, weeks, matrix, groupTotal)
  const fetchMatrix = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${apiUrl}/api/savings/matrix`, { // <-- Use backticks and apiUrl
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

  const fetchPendingMembers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${apiUrl}/api/savings/group`, { // <-- Use backticks and apiUrl
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for pending status
      setPendingMembers(res.data.members.filter(m => m.status === "pending"));
    } catch {
      setPendingMembers([]);
    }
  };

  useEffect(() => {
    fetchMatrix();
    fetchPendingMembers();
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
        `${apiUrl}/api/savings/admin/add`, // <-- Use backticks and apiUrl
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

  // Edit handler
  const handleEdit = (week, memberId, currentValue) => {
    setEditing({ [`${week}_${memberId}`]: true });
    setEditValue(currentValue);
  };

  const handleEditSave = async (week, memberId) => {
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/savings/admin/update`, // <-- Use backticks and apiUrl
        { member_id: memberId, week_number: week, amount: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Savings updated successfully.");
      setEditing({});
      setEditValue("");
      await fetchMatrix();
    } catch (err) {
      setError(err.response?.data?.error || "Error updating savings");
    }
  };

  const handleApprove = async (member_id) => {
    setApprovalMsg("");
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${apiUrl}/api/auth/approve-member`, // <-- Use backticks and apiUrl
        { member_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApprovalMsg("Member approved.");
      fetchPendingMembers();
      fetchMatrix();
    } catch {
      setApprovalMsg("Error approving member.");
    }
  };

  const handleDeny = async (member_id) => {
    setApprovalMsg("");
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${apiUrl}/api/auth/deny-member`, // <-- Use backticks and apiUrl
        { member_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApprovalMsg("Member denied.");
      fetchPendingMembers();
      fetchMatrix();
    } catch {
      setApprovalMsg("Error denying member.");
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.full_name}?`)) {
      return;
    }
    setApprovalMsg("");
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${apiUrl}/api/auth/delete-member/${member.id}`, { // <-- Use backticks and apiUrl
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovalMsg("Member deleted.");
      fetchPendingMembers();
      fetchMatrix();
    } catch {
      setApprovalMsg("Error deleting member.");
    }
  };

  return (
    <div style={{ overflowX: "auto", padding: 20 }}>
      <h2>Admin Savings Matrix (Your Group)</h2>
      {/* Loans & Repayments Link - move to top */}
      <div style={{ margin: "16px 0" }}>
        <a
          href="/loans"
          style={{
            display: "inline-block",
            background: "#388e3c",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            marginRight: 10
          }}
        >
          Loans & Repayments
        </a>
      </div>
      {/* Add New Member Form */}
      <div style={{ marginBottom: 24, background: "#e3f2fd", padding: 16, borderRadius: 8 }}>
        <h3>Add New Member</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setMessage("");
            const token = localStorage.getItem("token");
            try {
              await axios.post(
                `${apiUrl}/api/savings/add`, // <-- Use backticks for template literal
                { full_name: e.target.full_name.value, phone: e.target.phone.value },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setMessage("Member added successfully.");
              e.target.reset();
              fetchMatrix();
            } catch (err) {
              setError(err.response?.data?.error || "Error adding member");
            }
          }}
          style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
        >
          <input name="full_name" placeholder="Full Name" required style={{ minWidth: 140 }} />
          <input name="phone" placeholder="Phone Number" required style={{ minWidth: 140 }} />
          <button type="submit" style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "8px 18px", fontWeight: "bold" }}>
            Add Member
          </button>
          {message && <span style={{ color: "green", marginLeft: 10 }}>{message}</span>}
          {error && <span style={{ color: "red", marginLeft: 10 }}>{error}</span>}
        </form>
      </div>
      {/* Member List with Delete Option */}
      <div style={{ marginBottom: 32, background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
        <h3>Group Members</h3>
        <table style={{ borderCollapse: "collapse", minWidth: 400 }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Phone</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => m.id != null).map((member) => (
              <tr key={member.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{member.full_name}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{member.phone}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  <button
                    onClick={() => handleDelete(member)}
                    style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Savings Matrix Table */}
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
              {members.filter(m => m.id != null).map((member) => {
                const cellKey = `${week}_${member.id}`;
                const value = savingsMatrix[Number(week)]?.[Number(member.id)] || 0;
                return (
                  <td key={member.id} style={{ border: "1px solid #ccc", padding: 8 }}>
                    {editing[cellKey] ? (
                      <>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          style={{ width: 60 }}
                        />
                        <button onClick={() => handleEditSave(week, member.id)} style={{ marginLeft: 4 }}>Save</button>
                        <button onClick={() => setEditing({})} style={{ marginLeft: 4 }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {value}
                        <button
                          style={{ marginLeft: 6, fontSize: 12 }}
                          onClick={() => handleEdit(week, member.id, value)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </td>
                );
              })}
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
      {/* Line Graph */}
      <h3 style={{ marginTop: 40 }}>Member Progress (Line Graph)</h3>
      <div style={{ width: "100%", height: 350, overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={weeks.map(week => {
              const row = { week: `Week ${week}` };
              members.forEach(member => {
                row[member.full_name] = Number(savingsMatrix[week]?.[member.id] || 0);
              });
              return row;
            })}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            {members.map(member => (
              <Line
                key={member.id}
                type="monotone"
                dataKey={member.full_name}
                stroke={`#${((member.id * 999999) % 0xffffff).toString(16).padStart(6, "0")}`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Pending Member Approvals */}
      {pendingMembers.length > 0 && (
        <div style={{ marginTop: 40, background: "#fffbe6", padding: 16, borderRadius: 8 }}>
          <h3>Pending Member Approvals</h3>
          <table style={{ borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Name</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Phone</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.map((member) => (
                <tr key={member.id}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{member.full_name}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{member.phone}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    <button onClick={() => handleApprove(member.id)} style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px" }}>Approve</button>
                    <button onClick={() => handleDeny(member.id)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px" }}>Deny</button>
                    <button onClick={() => handleDelete(member)} style={{ background: "#2196f3", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {approvalMsg && <div style={{ color: "green", marginTop: 8 }}>{approvalMsg}</div>}
        </div>
      )}
    </div>
  );
}

export default SavingsAdmin;