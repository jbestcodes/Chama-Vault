import React, { useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

function ContactUs() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    group_name: "",
    message: "",
    reason: "Reporting a bug", // default value
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      await axios.post(`${apiUrl}/api/contact`, form);
      setStatus("Message sent successfully!");
      setForm({ full_name: "", phone: "", group_name: "", message: "", reason: "Reporting a bug" });
    } catch (err) {
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#f5f5f5", borderRadius: 8 }}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          name="group_name"
          placeholder="Group Name"
          value={form.group_name}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <select
          name="reason"
          value={form.reason}
          onChange={handleChange}
          required
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        >
          <option value="Reporting a bug">Reporting a bug</option>
          <option value="Suggesting a new feature">Suggesting a new feature</option>
          <option value="Rating the app">Rating the app</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>
          Send Message
        </button>
      </form>
      {status && <div style={{ marginTop: 16, color: status.includes("success") ? "green" : "red" }}>{status}</div>}
    </div>
  );
}

export default ContactUs;