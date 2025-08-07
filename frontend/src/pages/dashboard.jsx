
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [members, setMembers] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [mySavings, setMySavings] = useState(0);
  const [rank, setRank] = useState(null);
  const [amount, setAmount] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/savings"); // Replace with actual backend URL
        const data = res.data;

        setMembers(data);
        setTotalSavings(data.reduce((sum, m) => sum + m.savings, 0));

        const currentUser = data.find(m => m._id === user._id);
        if (currentUser) {
          setMySavings(currentUser.savings);
          const sorted = [...data].sort((a, b) => b.savings - a.savings);
          const position = sorted.findIndex(m => m._id === user._id) + 1;
          setRank(position);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !amount) return;

    try {
      await axios.put(`http://localhost:5000/api/savings/${selectedMemberId}`, {
        amount: Number(amount),
      });
      alert("Savings updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Chama Vault</h2>
        <ul className="space-y-3">
          <li><a href="/dashboard" className="hover:text-blue-600">Dashboard</a></li>
          <li><a href="/profile" className="hover:text-blue-600">Profile</a></li>
          <li>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="text-red-500 hover:underline"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h1>

        {/* Admin View */}
        {isAdmin ? (
          <div>
            <h2 className="text-xl font-bold mt-4 mb-2">Admin Dashboard</h2>
            <p>Total Savings: <strong>Ksh {totalSavings.toLocaleString()}</strong></p>

            <h3 className="mt-6 mb-2 font-semibold">Member List</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Savings (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{m.name}</td>
                    <td className="p-2">{m.savings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="mt-6 mb-2 font-semibold">Update Member Savings</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="border p-2 w-full"
              >
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border p-2 w-full"
              />

              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
                Update Savings
              </button>
            </form>
          </div>
        ) : (
          // Member View
          <div>
            <h2 className="text-xl font-bold mt-4 mb-2">Member Dashboard</h2>
            <p>Your Savings: <strong>Ksh {mySavings.toLocaleString()}</strong></p>
            <p>Your Rank: <strong>{rank}{rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}</strong> out of {members.length}</p>

            <h3 className="mt-6 mb-2 font-semibold">Leaderboard</h3>
            <ol className="list-decimal pl-5">
              {[...members]
                .sort((a, b) => b.savings - a.savings)
                .map((m, i) => (
                  <li key={i}>
                    {m._id === user._id ? (
                      <strong>You</strong>
                    ) : (
                      m.name
                        ? m.name[0] + ".***"
                        : "***"
                    )}: Ksh {m.savings.toLocaleString()}
                  </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;