import React, { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

function LoansAndRepayments() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [showOfferFormId, setShowOfferFormId] = useState(null);
  const [offerForm, setOfferForm] = useState({
    amount: "",
    interest_rate: "",
    fees: "",
    due_date: "",
    installment_number: ""
  });
  const [showRepayFormId, setShowRepayFormId] = useState(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMsg, setRepayMsg] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false); // for reload after admin action

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userRole = (localStorage.getItem("role") || "").toLowerCase();
        setRole(userRole);

        let endpoint = "/api/loans/my";
        if (userRole === "admin") {
          endpoint = "/api/loans/group";
        }

        const response = await axios.get(`${apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLoans(response.data);
      } catch (err) {
        setError("Failed to fetch loans.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, [requestMsg, refreshFlag]);

  // Filter loans for admin to show only pending/requested if you want
  const visibleLoans =
    role === "admin"
      ? loans.filter(
          (loan) =>
            loan.status === "requested" ||
            loan.status === "pending" ||
            loan.status === "offered"
        )
      : loans;

  // Member submits a loan request
  const handleLoanRequest = async (e) => {
    e.preventDefault();
    setRequestMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/loans/request`,
        { amount: requestAmount, reason: requestReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg("Loan request sent!");
      setRequestAmount("");
      setRequestReason("");
    } catch (err) {
      setRequestMsg("Failed to send request.");
    }
  };

  // Member accepts or rejects an offered loan
  const handleOfferAction = async (loanId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/loans/offer-action`,
        { loan_id: loanId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg(`Loan ${action}ed.`);
    } catch {
      setRequestMsg("Action failed.");
    }
  };

  // Admin opens the offer form for a loan
  const handleShowOfferForm = (loan) => {
    setShowOfferFormId(loan.id);
    setOfferForm({
      amount: loan.amount || "",
      interest_rate: "",
      fees: "",
      due_date: "",
      installment_number: ""
    });
  };

  // Admin submits the offer form
  const handleOfferSubmit = async (e, loanId) => {
    e.preventDefault();
    setRequestMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/loans/offer`,
        { loan_id: loanId, ...offerForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg("Loan offer sent to member.");
      setShowOfferFormId(null);
      setOfferForm({
        amount: "",
        interest_rate: "",
        fees: "",
        due_date: "",
        installment_number: ""
      });
    } catch {
      setRequestMsg("Failed to send offer.");
    }
  };

  // Member submits a repayment request
  const handleRepaySubmit = async (e, loanId) => {
    e.preventDefault();
    setRepayMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/repayments`,
        {
          loan_id: loanId,
          amount: repayAmount,
          payment_date: new Date().toISOString().slice(0, 10), // today's date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRepayMsg("Repayment request sent for admin approval.");
      setShowRepayFormId(null);
      setRepayAmount("");
      setRequestMsg("Repayment request sent!"); // to trigger reload
    } catch {
      setRepayMsg("Failed to send repayment request.");
    }
  };

  // Admin approves a repayment
  const handleApproveRepayment = async (repaymentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/repayments/approve`,
        { repayment_id: repaymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg("Repayment approved.");
      setRefreshFlag((f) => !f);
    } catch {
      setRequestMsg("Failed to approve repayment.");
    }
  };

  // Admin rejects a repayment
  const handleRejectRepayment = async (repaymentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/api/repayments/reject`,
        { repayment_id: repaymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequestMsg("Repayment rejected.");
      setRefreshFlag((f) => !f);
    } catch {
      setRequestMsg("Failed to reject repayment.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Loans & Repayments</h2>
      {/* Show request loan form for members only */}
      {role !== "admin" && (
        <form
          onSubmit={handleLoanRequest}
          style={{
            marginBottom: 24,
            background: "#f0f4ff",
            padding: 16,
            borderRadius: 8,
          }}
        >
          <h4>Request a Loan</h4>
          <input
            type="number"
            placeholder="Amount"
            value={requestAmount}
            onChange={(e) => setRequestAmount(e.target.value)}
            required
            style={{ marginRight: 10 }}
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={requestReason}
            onChange={(e) => setRequestReason(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button type="submit">Send Request</button>
          {requestMsg && (
            <div style={{ marginTop: 8, color: "#1976d2" }}>{requestMsg}</div>
          )}
        </form>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && visibleLoans.length === 0 && (
        <p>
          {role === "admin"
            ? "No loans found for your group."
            : "You have no pending loans."}
        </p>
      )}
      {!loading && visibleLoans.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 32,
            }}
          >
            <thead>
              <tr style={{ background: "#f0f4ff" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Loan ID</th>
                {role === "admin" && (
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>
                    Member ID
                  </th>
                )}
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Amount</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Interest Rate (%)
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Fees</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Total Due
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Installments
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Installment Amount
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Reason</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Created At
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Due Date
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Last Due Date
                </th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>
                  Repayments
                </th>
                {role !== "admin" && (
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>
                    Action
                  </th>
                )}
                {role === "admin" && (
                  <th style={{ padding: 8, border: "1px solid #ddd" }}>
                    Offer
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleLoans.map((loan) => (
                <tr key={loan.id}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.id}
                  </td>
                  {role === "admin" && (
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      {loan.member_id}
                    </td>
                  )}
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    Ksh {loan.amount}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.interest_rate}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    Ksh {loan.fees}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    Ksh {loan.total_due}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.installment_number}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.installment_amount
                      ? `Ksh ${loan.installment_amount}`
                      : "-"}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.status}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.reason}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.created_at
                      ? new Date(loan.created_at).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.due_date
                      ? new Date(loan.due_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.last_due_date
                      ? new Date(loan.last_due_date).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {loan.repayments && loan.repayments.length > 0 ? (
                      <details>
                        <summary style={{ cursor: "pointer" }}>
                          {loan.repayments.length} Repayment
                          {loan.repayments.length > 1 ? "s" : ""}
                        </summary>
                        <ul style={{ paddingLeft: 16 }}>
                          {loan.repayments.map((rep, idx) => (
                            <li key={rep.id || idx}>
                              Ksh {rep.amount} on{" "}
                              {rep.paid_date
                                ? new Date(rep.paid_date).toLocaleDateString()
                                : ""}
                              {" "}({rep.status})
                              {rep.status === "approved" && rep.confirmed_at && (
                                <> (confirmed {new Date(rep.confirmed_at).toLocaleDateString()})</>
                              )}
                              {/* Admin approval/reject buttons for pending repayments */}
                              {role === "admin" && rep.status === "pending" && (
                                <>
                                  <button
                                    style={{
                                      marginLeft: 8,
                                      background: "#388e3c",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 4,
                                      padding: "2px 8px",
                                    }}
                                    onClick={() =>
                                      handleApproveRepayment(rep.id)
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button
                                    style={{
                                      marginLeft: 4,
                                      background: "#d32f2f",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: 4,
                                      padding: "2px 8px",
                                    }}
                                    onClick={() =>
                                      handleRejectRepayment(rep.id)
                                    }
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span style={{ color: "#888" }}>None</span>
                    )}
                  </td>
                  {role !== "admin" && (
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      {loan.status === "offered" && (
                        <>
                          <button
                            onClick={() => handleOfferAction(loan.id, "accept")}
                            style={{
                              marginRight: 8,
                              background: "#388e3c",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 10px",
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOfferAction(loan.id, "reject")}
                            style={{
                              background: "#d32f2f",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 10px",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {/* Repay Loan button for active loans */}
                      {loan.status === "active" && (
                        <>
                          <button
                            style={{
                              marginTop: 8,
                              background: "#1976d2",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "4px 10px",
                              display: "block",
                            }}
                            onClick={() =>
                              setShowRepayFormId(
                                showRepayFormId === loan.id ? null : loan.id
                              )
                            }
                          >
                            Repay Loan
                          </button>
                          {/* Repayment form */}
                          {showRepayFormId === loan.id && (
                            <form
                              onSubmit={(e) => handleRepaySubmit(e, loan.id)}
                              style={{
                                marginTop: 8,
                                background: "#f9f9f9",
                                padding: 10,
                                borderRadius: 6,
                              }}
                            >
                              <input
                                type="number"
                                placeholder="Repayment Amount"
                                value={repayAmount}
                                min={1}
                                max={loan.total_due}
                                onChange={(e) => setRepayAmount(e.target.value)}
                                required
                                style={{ marginRight: 10 }}
                              />
                              <button type="submit">Send Repayment</button>
                              <button
                                type="button"
                                style={{
                                  marginLeft: 8,
                                  background: "#ccc",
                                  color: "#333",
                                  border: "none",
                                  borderRadius: 4,
                                  padding: "4px 10px",
                                }}
                                onClick={() => setShowRepayFormId(null)}
                              >
                                Cancel
                              </button>
                              {repayMsg && (
                                <div style={{ marginTop: 8, color: "#1976d2" }}>
                                  {repayMsg}
                                </div>
                              )}
                            </form>
                          )}
                        </>
                      )}
                    </td>
                  )}
                  {role === "admin" && (
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      {showOfferFormId === loan.id ? (
                        <form
                          onSubmit={(e) => handleOfferSubmit(e, loan.id)}
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <input
                            type="number"
                            placeholder="Amount"
                            value={offerForm.amount}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                amount: e.target.value,
                              })
                            }
                            required
                            style={{ marginBottom: 8 }}
                          />
                          <input
                            type="number"
                            placeholder="Interest Rate (%)"
                            value={offerForm.interest_rate}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                interest_rate: e.target.value,
                              })
                            }
                            required
                            style={{ marginBottom: 8 }}
                          />
                          <input
                            type="number"
                            placeholder="Fees"
                            value={offerForm.fees}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                fees: e.target.value,
                              })
                            }
                            required
                            style={{ marginBottom: 8 }}
                          />
                          <input
                            type="date"
                            placeholder="Due Date"
                            value={offerForm.due_date}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                due_date: e.target.value,
                              })
                            }
                            required
                            style={{ marginBottom: 8 }}
                          />
                          <input
                            type="number"
                            placeholder="Installments"
                            value={offerForm.installment_number}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                installment_number: e.target.value,
                              })
                            }
                            required
                            style={{ marginBottom: 8 }}
                          />
                          <button
                            type="submit"
                            style={{
                              background: "#1976d2",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              padding: "8px 16px",
                            }}
                          >
                            Send Offer
                          </button>
                          <button
                            onClick={() => setShowOfferFormId(null)}
                            style={{
                              marginTop: 8,
                              background: "#ccc",
                              color: "#333",
                              border: "none",
                              borderRadius: 4,
                              padding: "8px 16px",
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => handleShowOfferForm(loan)}
                          style={{
                            background: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 10px",
                          }}
                        >
                          Offer Loan
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LoansAndRepayments;