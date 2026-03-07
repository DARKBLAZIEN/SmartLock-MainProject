import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_MODES, FLOW_STATUS } from '../context/FlowContext';
import { pickupApi } from '../api/pickup.api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Pickup = () => {
    const navigate = useNavigate();
    const { startFlow, updateFlow } = useFlow();

    const [formData, setFormData] = useState({
        apartmentId: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    const validate = () => {
        const newErrors = {};
        if (!formData.apartmentId.trim()) {
            newErrors.apartmentId = 'Apartment ID is required';
        }
        if (!formData.otp.trim()) {
            newErrors.otp = 'OTP is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        if (!validate()) return;

        setIsSubmitting(true);
        startFlow(FLOW_MODES.PICKUP);
        updateFlow({
            status: FLOW_STATUS.PROCESSING,
            apartmentId: formData.apartmentId
        });

        try {
            const response = await pickupApi.verify(formData.apartmentId, formData.otp);

            updateFlow({
                status: FLOW_STATUS.SUCCESS,
                lockerId: response.data.lockerId,
                details: response.data
            });

            navigate('/pickup/status');
        } catch (error) {
            // For validation errors (like invalid OTP), we stay on the page and show error
            // For system errors, we might want to go to error page
            setApiError(error.message);
            updateFlow({
                status: FLOW_STATUS.ERROR,
                error: error.message
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto w-full">
            <Card title="Collect Package">
                {apiError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{apiError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="apartmentId"
                        label="Apartment ID"
                        type="text"
                        placeholder="e.g. 101"
                        value={formData.apartmentId}
                        onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
                        error={errors.apartmentId}
                        disabled={isSubmitting}
                    />

                    <Input
                        id="otp"
                        label="One-Time Password (OTP)"
                        type="text"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        error={errors.otp}
                        disabled={isSubmitting}
                    />

                    <div className="mt-6 flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Verifying...' : 'Unlock Locker'}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    Try '1234' as OTP for demo purposes.
                </p>
            </div>
        </div>
    );
};

export default Pickup;
