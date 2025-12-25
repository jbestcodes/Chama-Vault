import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const NotificationSchedule = () => {
    const [schedule, setSchedule] = useState({ day: 'any', time: '09:00', method: 'sms' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiUrl}/api/members/notification-schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.notificationSchedule) {
                setSchedule(res.data.notificationSchedule);
            }
        } catch (err) {
            console.error('Error fetching notification schedule:', err);
            setError('Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    const saveSchedule = async (newSchedule) => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${apiUrl}/api/members/notification-schedule`, { notificationSchedule: newSchedule }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedule(res.data.notificationSchedule || newSchedule);
            setSuccess('Schedule saved');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError(err.response?.data?.error || 'Failed to save schedule');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="bg-white p-4 rounded">Loading schedule...</div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">🔔 Notification Schedule</h3>

            {error && <div className="mb-3 text-red-600">{error}</div>}
            {success && <div className="mb-3 text-green-600">✅ {success}</div>}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Day</label>
                    <select value={schedule.day} onChange={(e) => setSchedule({ ...schedule, day: e.target.value })} className="mt-1 p-2 border rounded w-full">
                        <option value="any">Any day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                    <input type="time" value={schedule.time} onChange={(e) => setSchedule({ ...schedule, time: e.target.value })} className="mt-1 p-2 border rounded w-full" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Method</label>
                    <div className="mt-1 space-x-3">
                        <label><input type="radio" name="method" checked={schedule.method === 'sms'} onChange={() => setSchedule({ ...schedule, method: 'sms' })} /> SMS</label>
                        <label className="ml-3"><input type="radio" name="method" checked={schedule.method === 'email'} onChange={() => setSchedule({ ...schedule, method: 'email' })} /> Email</label>
                        <label className="ml-3"><input type="radio" name="method" checked={schedule.method === 'both'} onChange={() => setSchedule({ ...schedule, method: 'both' })} /> Both</label>
                    </div>
                </div>

                <div>
                    <button disabled={saving} onClick={() => saveSchedule(schedule)} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {saving ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSchedule;
