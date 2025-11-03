import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const apiUrl = import.meta.env.VITE_API_URL; // <-- Add this line

const Register = () => {
    const [full_name, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [group_name, setGroupName] = useState('');
    const [role, setRole] = useState('');
    const [agreed, setAgreed] = useState(false);
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

            // Redirect admin to login page after registration
            if (role === 'admin') {
                setTimeout(() => {
                    navigate('/login');
                }, 1500); // Wait 1.5 seconds before redirecting
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
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
                        <div style={{ marginBottom: 12 }}>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === "admin"}
                                    onChange={() => setRole("admin")}
                                    required
                                />{" "}
                                Admin
                            </label>
                            <label style={{ marginLeft: 16 }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="member"
                                    checked={role === "member"}
                                    onChange={() => setRole("member")}
                                    required
                                />{" "}
                                Member
                            </label>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={() => setAgreed(!agreed)}
                                    required
                                />{" "}
                                I agree to the <Link to="/terms" target="_blank" style={{ color: "#1976d2" }}>Terms & Conditions</Link>
                            </label>
                        </div>
                        <button type="submit" style={{ marginTop: '20px' }} disabled={!!success}>
                            Register
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;
