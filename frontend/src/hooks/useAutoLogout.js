import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Auto-logout hook - logs user out after inactivity
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 */
const useAutoLogout = (timeoutMinutes = 30) => {
    const navigate = useNavigate();
    const timeoutId = useRef(null);
    const warningTimeoutId = useRef(null);
    const TIMEOUT_MS = timeoutMinutes * 60 * 1000; // Convert to milliseconds
    const WARNING_MS = (timeoutMinutes - 2) * 60 * 1000; // Warn 2 minutes before

    const logout = useCallback(() => {
        // Clear all timeouts
        if (timeoutId.current) clearTimeout(timeoutId.current);
        if (warningTimeoutId.current) clearTimeout(warningTimeoutId.current);

        // Clear all user data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('full_name');
        localStorage.removeItem('memberId');
        localStorage.removeItem('member');
        localStorage.removeItem('group_id');
        localStorage.removeItem('group_name');
        localStorage.removeItem('aiTrialInfo');

        // Show logout message
        console.log('🔒 Auto-logout: Session expired due to inactivity');
        
        // Redirect to login
        navigate('/login', { 
            state: { message: 'Your session has expired due to inactivity. Please log in again.' }
        });
    }, [navigate]);

    const showWarning = useCallback(() => {
        console.log('⚠️ Warning: You will be logged out in 1 minute due to inactivity');
        // You can add a toast/notification here if you want
    }, []);

    const resetTimer = useCallback(() => {
        // Clear existing timers
        if (timeoutId.current) clearTimeout(timeoutId.current);
        if (warningTimeoutId.current) clearTimeout(warningTimeoutId.current);

        // Only set timer if user is logged in
        const token = localStorage.getItem('token');
        if (!token) return;

        // Set warning timer (1 minute before logout)
        warningTimeoutId.current = setTimeout(showWarning, WARNING_MS);

        // Set logout timer
        timeoutId.current = setTimeout(logout, TIMEOUT_MS);
    }, [logout, showWarning, TIMEOUT_MS, WARNING_MS]);

    useEffect(() => {
        // Only activate if user is logged in
        const token = localStorage.getItem('token');
        if (!token) return;

        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Set initial timer
        resetTimer();

        // Add event listeners for user activity
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Cleanup on unmount
        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
            if (warningTimeoutId.current) clearTimeout(warningTimeoutId.current);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);

    return { logout, resetTimer };
};

export default useAutoLogout;
