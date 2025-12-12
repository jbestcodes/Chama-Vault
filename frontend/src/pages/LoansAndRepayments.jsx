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
  
  // Loan repayment timing rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [ratingData, setRatingData] = useState({ 
    timing_rating: '', 
    rating_notes: '', 
    expected_due_date: '' 
  });
  const [loanAnalytics, setLoanAnalytics] = useState(null);
  const [repayments, setRepayments] = useState([]);

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
        
        // If admin, also fetch repayments and analytics
        if (userRole === "admin") {
          await fetchRepayments(token);
          await fetchLoanAnalytics(token);
        }
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

  // Fetch repayments for admin view
  const fetchRepayments = async (token) => {
    try {
      const response = await axios.get(`${apiUrl}/api/repayments/group`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepayments(response.data);
    } catch (error) {
      console.error('Failed to fetch repayments:', error);
    }
  };

  // Fetch loan timing analytics
  const fetchLoanAnalytics = async (token) => {
    try {
      const memberData = JSON.parse(localStorage.getItem('member'));
      const groupId = memberData?.group_id;
      
      if (groupId) {
        const response = await axios.get(`${apiUrl}/api/repayments/timing-analytics/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoanAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch loan analytics:', error);
    }
  };

  // Rate loan repayment timing
  const rateLoanRepayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/repayments/rate-timing/${selectedRepayment._id}`, 
        ratingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowRatingModal(false);
      setSelectedRepayment(null);
      setRatingData({ timing_rating: '', rating_notes: '', expected_due_date: '' });
      
      // Refresh data
      await fetchRepayments(token);
      await fetchLoanAnalytics(token);
    } catch (error) {
      console.error('Failed to rate loan repayment:', error);
      alert('Failed to rate loan repayment');
    }
  };

  // Open rating modal
  const openRepaymentRatingModal = (repayment) => {
    setSelectedRepayment(repayment);
    setRatingData({ 
      timing_rating: repayment.timing_rating || '', 
      rating_notes: repayment.rating_notes || '',
      expected_due_date: repayment.expected_due_date ? 
        new Date(repayment.expected_due_date).toISOString().split('T')[0] : ''
    });
    setShowRatingModal(true);
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

      {/* Loan Repayment Analytics (Admin Only) */}
      {role === "admin" && loanAnalytics && (
        <div style={{ 
          marginTop: '30px',
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>💰 Loan Repayment Timing Analytics</h3>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {loanAnalytics.total_rated} of {loanAnalytics.total_repayments} repayments rated
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#e8f5e8', borderRadius: '10px', border: '1px solid #4caf50' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                {loanAnalytics.ratings.early.count}
              </div>
              <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: '500' }}>
                Early ({loanAnalytics.ratings.early.percentage.toFixed(1)}%)
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '10px', border: '1px solid #ffc107' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {loanAnalytics.ratings.on_time.count}
              </div>
              <div style={{ color: '#ffc107', fontSize: '12px', fontWeight: '500' }}>
                On Time ({loanAnalytics.ratings.on_time.percentage.toFixed(1)}%)
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8d7da', borderRadius: '10px', border: '1px solid #dc3545' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {loanAnalytics.ratings.late.count}
              </div>
              <div style={{ color: '#dc3545', fontSize: '12px', fontWeight: '500' }}>
                Late ({loanAnalytics.ratings.late.percentage.toFixed(1)}%)
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#e9ecef', borderRadius: '10px', border: '1px solid #6c757d' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
                {loanAnalytics.average_days_late.toFixed(1)}
              </div>
              <div style={{ color: '#6c757d', fontSize: '12px', fontWeight: '500' }}>
                Avg Days Late
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Loan Repayments (Admin Only) */}
      {role === "admin" && repayments.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📊 Recent Loan Repayments</h3>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {repayments.slice(0, 10).map((repayment, index) => {
              const getRatingColor = (rating) => {
                switch(rating) {
                  case 'early': return '#4caf50';
                  case 'on_time': return '#ffc107';
                  case 'late': return '#dc3545';
                  default: return '#6c757d';
                }
              };
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px',
                  marginBottom: '10px',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: '1px solid #e1e5e9'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                      KSh {repayment.amount?.toLocaleString()} Repayment
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Paid: {new Date(repayment.paid_date).toLocaleDateString()}
                      {repayment.expected_due_date && ` • Due: ${new Date(repayment.expected_due_date).toLocaleDateString()}`}
                      {repayment.days_late > 0 && ` • ${repayment.days_late} days late`}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {repayment.timing_rating && repayment.timing_rating !== 'not_rated' ? (
                      <span style={{
                        background: getRatingColor(repayment.timing_rating),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {repayment.timing_rating.replace('_', ' ')}
                      </span>
                    ) : (
                      <span style={{
                        background: '#e9ecef',
                        color: '#6c757d',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        Not Rated
                      </span>
                    )}
                    
                    <button
                      onClick={() => openRepaymentRatingModal(repayment)}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {repayment.timing_rating && repayment.timing_rating !== 'not_rated' ? 'Edit Rating' : 'Rate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating Modal for Loan Repayments */}
      {showRatingModal && selectedRepayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Rate Loan Repayment Timing</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                Repayment: KSh {selectedRepayment.amount?.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Paid: {new Date(selectedRepayment.paid_date).toLocaleDateString()}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Expected Due Date
              </label>
              <input
                type="date"
                value={ratingData.expected_due_date}
                onChange={(e) => setRatingData({...ratingData, expected_due_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Timing Rating
              </label>
              <select
                value={ratingData.timing_rating}
                onChange={(e) => setRatingData({...ratingData, timing_rating: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px'
                }}
              >
                <option value="">Select Rating</option>
                <option value="early">Early</option>
                <option value="on_time">On Time</option>
                <option value="late">Late</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Notes (Optional)
              </label>
              <textarea
                value={ratingData.rating_notes}
                onChange={(e) => setRatingData({...ratingData, rating_notes: e.target.value})}
                placeholder="Add any notes about this repayment..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRatingModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #e1e5e9',
                  background: 'white',
                  color: '#333',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={rateLoanRepayment}
                disabled={!ratingData.timing_rating}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: ratingData.timing_rating ? '#667eea' : '#ccc',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: ratingData.timing_rating ? 'pointer' : 'not-allowed'
                }}
              >
                Save Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoansAndRepayments;