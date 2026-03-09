import apiClient from './apiClient';

export const activityApi = {
    getRecent: async () => {
        try {
            // Backend doesn't have a specific recent activity log endpoint that returns everything.
            // We can fetch delivery logs as a proxy or add a new endpoint.
            // For now, let's fetch delivery logs.
            const response = await apiClient.get('/apartment/lockers'); // This is not ideal, but let's see.
            // Actually, let's see if there is a better way.
            return []; // Placeholder for now
        } catch (error) {
            throw error;
        }
    },

    getStats: async () => {
        try {
            const response = await apiClient.get('/apartment/lockers');
            const lockers = response.data;
            return {
                totalLockers: lockers.length,
                available: lockers.filter(l => l.isFree).length,
                activeIssues: 0,
                todaysDeliveries: 0,
                weeklyEfficiency: 0,
                revenue: 0,
            };
        } catch (error) {
            throw error;
        }
    }
};
