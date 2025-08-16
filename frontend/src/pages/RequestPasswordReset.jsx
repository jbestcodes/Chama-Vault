import { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

function RequestPasswordReset() {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${apiUrl}/api/auth/request-password-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Password reset link has been sent to your phone');
            } else {
                setError(data.error || data.message || 'Failed to send password reset link');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
            console.error('Error requesting password reset:', err);
        }
    };

    return (
        <div>
            <h2>Request Password Reset</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='Enter your phone number'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <button type='submit'>Request Password Reset</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default RequestPasswordReset;