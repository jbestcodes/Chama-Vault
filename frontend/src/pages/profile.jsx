//src/pages/profile.jsx
import {useEffect, useState} from "react";
import axios from "axios";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [newName, setNewName] = useState("");
    const [messages, setMessages] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/savings/my-profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setUser(res.data);
            setNewName(res.data.full_name);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setMessages("Failed to load profile. Please try again later.");
            }
        };
        fetchProfile(); }, []);
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put("http://localhost:5000/api/savings/my-profile", {
                full_name: newName }, {withCredentials: true});
            setUser(res.data);
            setMessages("Profile updated successfully.");
        } catch (err) {
            console.error("Failed to update profile:", err);
            setMessages("Failed to update profile. Please try again later.");
        }
    };
        if (loading) {
            return <p className='p-4 max-w-md mx-auto'>Loading...</p>;
        }
    
        if (!user) {
            return <p className='p-4 max-w-md mx-auto'>{messages || "No user data found."}</p>;
        }
    
        return (
            <div className='p-4 max-w-md mx-auto'>
                <h2 className='text-2xl font-bold mb-4'>My Profile</h2>
                <div className='mb-4'>
                    <label className='block font-semibold'>Phone:</label>
                    <p>{user.phone}</p>
                </div>
                <div className='mb-4'>
                    <label className='block font-semibold'>Full Name:</label>
                    <input
                        type='text'
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className='border p-2 w-full rounded'
                    />
                </div>
                <button
                    onClick={handleUpdate}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                >
                    Update Name
                </button>
                {messages && <p className='mt-2 text-green-600'>{messages}</p>}
            </div>
        );
    };
    
    export default Profile;
