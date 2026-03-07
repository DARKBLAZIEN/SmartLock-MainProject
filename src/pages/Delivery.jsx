import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_MODES, FLOW_STATUS } from '../context/FlowContext';
import { deliveryApi } from '../api/delivery.api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Delivery = () => {
    const navigate = useNavigate();
    const { startFlow, updateFlow } = useFlow();

    const [formData, setFormData] = useState({
        apartmentId: '',
        packageId: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.apartmentId.trim()) {
            newErrors.apartmentId = 'Apartment ID is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        startFlow(FLOW_MODES.DELIVERY);
        updateFlow({
            status: FLOW_STATUS.PROCESSING,
            apartmentId: formData.apartmentId
        });

        try {
            const response = await deliveryApi.start(formData.apartmentId);

            updateFlow({
                status: FLOW_STATUS.SUCCESS,
                lockerId: response.data.lockerId,
                details: response.data
            });

            navigate('/delivery/status');
        } catch (error) {
            updateFlow({
                status: FLOW_STATUS.ERROR,
                error: error.message
            });
            navigate('/error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto w-full">
            <Card title="Deliver Package">
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
                        id="packageId"
                        label="Package ID (Optional)"
                        type="text"
                        placeholder="e.g. PKG-123"
                        value={formData.packageId}
                        onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
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
                            {isSubmitting ? 'Processing...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Delivery;
