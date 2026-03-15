const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const lockerApi = {
    getStatus: async () => {
        try {
            const response = await fetch(`${API_URL}/apartment/lockers`);
            if (!response.ok) throw new Error('Failed to fetch lockers');
            return await response.json();
        } catch (error) {
            console.error('Locker API Error:', error);
            throw error;
        }
    },

    close: async (lockerId) => {
        try {
            const response = await fetch(`${API_URL}/apartment/locker/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lockerId })
            });
            if (!response.ok) throw new Error('Failed to close locker');
            return await response.json();
        } catch (error) {
            console.error('Close Locker API Error:', error);
            throw error;
        }
    },
    open: async (lockerId) => {
        try {
            const response = await fetch(`${API_URL}/apartment/locker/open`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lockerId })
            });
            if (!response.ok) throw new Error('Failed to open locker');
            return await response.json();
        } catch (error) {
            console.error('Open Locker API Error:', error);
            throw error;
        }
    },

    reset: async (lockerId) => {
        try {
            const response = await fetch(`${API_URL}/apartment/locker/reset`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lockerId })
            });
            if (!response.ok) throw new Error('Failed to reset locker');
            return await response.json();
        } catch (error) {
            console.error('Reset Locker API Error:', error);
            throw error;
        }
    },

    getEvents: async () => {
        try {
            const response = await fetch(`${API_URL}/apartment/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Get Events API Error:', error);
            throw error;
        }
    },

    forceOpen: async (lockerId, reason) => {
        // In a real system, this would call an admin endpoint
        console.log(`Force opening locker ${lockerId} for: ${reason}`);
        return { success: true };
    },

    createLocker: async (lockerId) => {
        try {
            const response = await fetch(`${API_URL}/apartment/locker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lockerId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create locker');
            return { success: true };
        } catch (error) {
            console.error('Create Locker API Error:', error);
            throw error;
        }
    }
};
