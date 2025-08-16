import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

const Register = () => {
    const [full_name, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [group_name, setGroupName] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post(`${apiUrl}/api/auth/register`, { // <-- Use backticks and apiUrl
                full_name,
                phone,
                password,
                group_name,
                role
            });

            setSuccess('Registration successful! Your account is pending admin approval. You will be able to log in once approved.');
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleRegister}>
                <div>
                    <label>Full Name:</label>
                    <input
                        type="text"
                        value={full_name}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Group Name:</label>
                    <input
                        type="text"
                        value={group_name}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="">Select role</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                    </select>
                </div>
                <button type="submit" style={{ marginTop: '20px' }} disabled={!!success}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
