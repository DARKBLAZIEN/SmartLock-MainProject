import apiClient from './apiClient';

export const residentApi = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/apartment');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (residentData) => {
        try {
            const response = await apiClient.post('/apartment/register', residentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
