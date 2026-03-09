import apiClient from './apiClient';

export const pickupApi = {
    verify: async (apartmentId, otp) => {
        try {
            const response = await apiClient.post('/apartment/pickup', { apartmentId, passcode: otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
