const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const pickupApi = {
    verify: async (apartmentId, otp) => {
        try {
            const response = await fetch(`${API_URL}/apartment/pickup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apartmentId, passcode: otp })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Pickup failed');
            return { data };
        } catch (error) {
            console.error('Pickup API Error:', error);
            throw error;
        }
    }
};
