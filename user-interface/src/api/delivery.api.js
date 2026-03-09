import apiClient from './apiClient';

export const deliveryApi = {
    start: async (apartmentId) => {
        try {
            const response = await apiClient.post('/apartment/delivery', { apartmentId });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
