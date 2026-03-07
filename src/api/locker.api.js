import { getSystemStatus, forceOpenLocker, addLocker } from '../mock/mockBackend';

export const lockerApi = {
    getStatus: async () => {
        try {
            const response = await getSystemStatus();
            return response;
        } catch (error) {
            throw error;
        }
    },

    forceOpen: async (lockerId, reason) => {
        try {
            await forceOpenLocker(lockerId, reason);
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    createLocker: async (lockerId) => {
        try {
            await addLocker(lockerId);
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
};
