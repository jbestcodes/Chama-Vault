import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


const apiUrl = import.meta.env.VITE_API_URL; 

const Register = () => {
    const [full_name, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [group_name, setGroupName] = useState('');
    const [role, setRole] = useState('');
    const [otp, setOtp] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: registration, 2: phone verification
    const [memberId, setMemberId] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/register`, {
                full_name,
                phone,
                password,
                group_name,
                role
            });

            if (response.data.requiresVerification) {
                setMemberId(response.data.memberId);
                setSuccess(response.data.message);
                setStep(2); // Move to phone verification step
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    const handlePhoneVerification = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${apiUrl}/api/sms-auth/verify-phone`, {
                memberId,
                otp
            });

            setSuccess(response.data.message);
            
            // Redirect to login after successful verification
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.error || 'Phone verification failed. Please try again.');
        }
    };

    const resendVerification = async () => {
        setError('');
        try {
            await axios.post(`${apiUrl}/api/sms-auth/resend-verification`, {
                memberId
            });
            setSuccess('New verification code sent to your phone');
        } catch (error) {
            setError('Failed to resend verification code. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    {step === 1 ? 'Create Your Account' : 'Verify Your Phone'}
                </h2>

                {/* Error/Success Messages */}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                {success && <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</p>}

                {step === 1 ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name:</label>
                            <input
                                type="text"
                                value={full_name}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Julie Achon"
                            />
                        </div>
                        
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number:</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 0712345678 or +254712345678"
                            />
                        </div>
                        
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Must be at least 6 characters"
                                minLength="6"
                            />
                        </div>
                        
                        {/* Group Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name:</label>
                            <input
                                type="text"
                                value={group_name}
                                onChange={(e) => setGroupName(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Smart Savers Chama"
                            />
                        </div>
                        
                        {/* Role Selection */}
                        <div className="flex justify-start space-x-6 pt-2">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={role === "admin"}
                                    onChange={() => setRole("admin")}
                                    required
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2">Admin</span>
                            </label>
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <input
                                    type="radio"
                                    name="role"
                                    value="member"
                                    checked={role === "member"}
                                    onChange={() => setRole("member")}
                                    required
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2">Member</span>
                            </label>
                        </div>
                        
                        {/* Terms & Conditions */}
                        <div className="pt-2">
                            <label className="flex items-start text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={() => setAgreed(!agreed)}
                                    required
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2">
                                    I agree to the <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 font-medium">Terms & Conditions</Link>
                                </span>
                            </label>
                        </div>
                        
                        {/* Register Button */}
                        <button 
                            type="submit" 
                            disabled={!agreed}
                            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 
                                ${!agreed 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50'
                                }`}
                        >
                            📱 Register & Send Verification Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePhoneVerification} className="space-y-4">
                        <div className="text-center mb-6">
                            <p className="text-gray-600">
                                We sent a 6-digit verification code to:
                            </p>
                            <p className="font-semibold text-lg text-blue-600">{phone}</p>
                        </div>
                        
                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code:</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                className="w-full p-3 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 tracking-widest"
                                placeholder="000000"
                            />
                        </div>
                        
                        {/* Verify Button */}
                        <button 
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
                        >
                            ✅ Verify Phone Number
                        </button>
                        
                        {/* Resend & Back buttons */}
                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                ← Back to Registration
                            </button>
                            <button
                                type="button"
                                onClick={resendVerification}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                📱 Resend Code
                            </button>
                        </div>
                    </form>
                )}
                
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
