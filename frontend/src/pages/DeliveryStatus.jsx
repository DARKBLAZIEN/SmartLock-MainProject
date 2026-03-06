import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_STATUS } from '../context/FlowContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Button from '../components/Button';

const DeliveryStatus = () => {
    const navigate = useNavigate();
    const { flowState } = useFlow();
    const [step, setStep] = useState('OPENING'); // OPENING, PLACING, CLOSED, COMPLETED
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Redirect if no active flow
        if (flowState.status !== FLOW_STATUS.SUCCESS || !flowState.lockerId) {
            navigate('/');
            return;
        }

        // Simulate locker opening sequence
        const openTimer = setTimeout(() => {
            setStep('PLACING');
        }, 2000);

        const placeTimer = setTimeout(() => {
            setStep('CLOSED');
        }, 5000); // Give user time to "place" package

        const completeTimer = setTimeout(() => {
            setStep('COMPLETED');
        }, 7000);

        return () => {
            clearTimeout(openTimer);
            clearTimeout(placeTimer);
            clearTimeout(completeTimer);
        };
    }, [flowState, navigate]);

    useEffect(() => {
        if (step === 'COMPLETED') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, navigate]);

    return (
        <div className="max-w-md mx-auto w-full">
            <Card title="Delivery Status">
                <div className="text-center py-6">
                    {step === 'OPENING' && (
                        <>
                            <Loader text="Opening Locker..." />
                            <p className="mt-2 text-gray-600">Please wait for the locker to open.</p>
                        </>
                    )}

                    {step === 'PLACING' && (
                        <div className="space-y-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{flowState.lockerId} is Open</h3>
                            <p className="text-gray-600">Please place the package inside and close the door.</p>
                        </div>
                    )}

                    {step === 'CLOSED' && (
                        <>
                            <Loader text="Verifying Door Lock..." />
                        </>
                    )}

                    {step === 'COMPLETED' && (
                        <div className="space-y-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Delivery Successful!</h3>
                            <div className="bg-gray-50 p-4 rounded-md text-left text-sm space-y-2">
                                <p><span className="font-semibold">Locker:</span> {flowState.lockerId}</p>
                                <p><span className="font-semibold">Apartment:</span> {flowState.apartmentId}</p>
                                <p><span className="font-semibold">OTP:</span> Generated & Sent</p>
                            </div>
                            <p className="text-gray-500 text-sm">Redirecting to home in {countdown}s...</p>

                            <Button onClick={() => navigate('/')}>
                                Return Home Now
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DeliveryStatus;
