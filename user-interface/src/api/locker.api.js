const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const lockerApi = {
    getStatus: async () => {
        try {
            const response = await fetch(`${API_URL}/apartment/lockers`);
            const data = await response.json();
            return data;
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
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to close locker');
            return data;
        } catch (error) {
            console.error('Locker Close API Error:', error);
            throw error;
        }
    }
};
