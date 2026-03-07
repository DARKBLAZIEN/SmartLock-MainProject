import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_STATUS } from '../context/FlowContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Button from '../components/Button';

const PickupStatus = () => {
    const navigate = useNavigate();
    const { flowState } = useFlow();
    const [step, setStep] = useState('OPENING'); // OPENING, OPEN, COMPLETED
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Redirect if no active flow
        if (flowState.status !== FLOW_STATUS.SUCCESS || !flowState.lockerId) {
            navigate('/');
            return;
        }

        // Simulate locker opening
        const openTimer = setTimeout(() => {
            setStep('OPEN');
        }, 2000);

        const completeTimer = setTimeout(() => {
            setStep('COMPLETED');
        }, 6000); // User collecting package time

        return () => {
            clearTimeout(openTimer);
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
            <Card title="Pickup Status">
                <div className="text-center py-6">
                    {step === 'OPENING' && (
                        <>
                            <Loader text="Unlocking Locker..." />
                        </>
                    )}

                    {step === 'OPEN' && (
                        <div className="space-y-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{flowState.lockerId} is Open</h3>
                            <p className="text-gray-600">Please collect your package and close the door.</p>
                        </div>
                    )}

                    {step === 'COMPLETED' && (
                        <div className="space-y-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Pickup Complete!</h3>
                            <p className="text-gray-600">Thank you for using SmartLock.</p>

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

export default PickupStatus;
