import { startDelivery } from '../mock/mockBackend';

export const deliveryApi = {
    start: async (apartmentId) => {
        try {
            const response = await startDelivery(apartmentId);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
