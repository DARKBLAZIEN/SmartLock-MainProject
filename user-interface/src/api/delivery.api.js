const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const deliveryApi = {
    start: async (apartmentId) => {
        try {
            const response = await fetch(`${API_URL}/apartment/delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apartmentId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Delivery failed');
            return { data };
        } catch (error) {
            console.error('Delivery API Error:', error);
            throw error;
        }
    }
};
