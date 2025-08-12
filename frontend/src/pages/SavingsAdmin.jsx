import React, { useEffect, useState } from "react";
import axios from "axios";

function SavingsAdmin() {
  const [members, setMembers] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [savingsMatrix, setSavingsMatrix] = useState({});
  const [groupTotal, setGroupTotal] = useState(0);

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

  return (
    <div style={{ overflowX: "auto", padding: 20 }}>
      <h2>Admin Savings Matrix</h2>
      <table style={{ borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Week</th>
            {members.map((member) => (
              <th
                key={member.id}
                style={{ border: "1px solid #ccc", padding: 8 }}
              >
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
              {members.map((member) => (
                <td
                  key={member.id}
                  style={{ border: "1px solid #ccc", padding: 8 }}
                >
                  {savingsMatrix[week]?.[member.id] || 0}
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
            {members.map((member) => (
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