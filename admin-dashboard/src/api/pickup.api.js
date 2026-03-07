import { verifyPickup } from '../mock/mockBackend';

export const pickupApi = {
    verify: async (apartmentId, otp) => {
        try {
            const response = await verifyPickup(apartmentId, otp);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
