import apiClient from './apiClient';

export const lockerApi = {
    getStatus: async () => {
        try {
            const response = await apiClient.get('/apartment/lockers');
            // Map backend 'isFree' to frontend 'status'
            return response.data.map(locker => ({
                id: locker.lockerId,
                status: locker.isFree ? 'AVAILABLE' : 'OCCUPIED',
                door: locker.isFree ? 'CLOSED' : 'CLOSED', // Backend doesn't track door status yet
                apartmentId: locker.apartmentId || null,
                lastUpdated: locker.updatedAt || new Date().toISOString()
            }));
        } catch (error) {
            throw error;
        }
    },

    forceOpen: async (lockerId, reason) => {
        try {
            // Mapping forceOpen to backend reset for now
            await apiClient.put('/apartment/locker/reset', { lockerId });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    createLocker: async (lockerId) => {
        try {
            await apiClient.post('/apartment/locker', { lockerId });
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
};
