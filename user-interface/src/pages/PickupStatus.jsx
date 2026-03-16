import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_STATUS } from '../context/FlowContext';
import { lockerApi } from '../api/locker.api';
import Card from '../components/Card';
import LockerGraphic from '../components/LockerGraphic';
import Loader from '../components/Loader';
import Button from '../components/Button';

const PickupStatus = () => {
    const navigate = useNavigate();
    const { flowState } = useFlow();
    const [step, setStep] = useState('OPENING'); // OPENING, OPEN, COMPLETED
    const [countdown, setCountdown] = useState(5);

    const [statusMessage, setStatusMessage] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Redirect if no active flow
        if (flowState.status !== FLOW_STATUS.SUCCESS || !flowState.lockerId) {
            navigate('/');
            return;
        }

        // Simulate locker opening
        const openTimer = setTimeout(() => {
            setStep('OPEN');
        }, 1500);

        return () => clearTimeout(openTimer);
    }, [flowState, navigate]);

    const handleCloseDoor = async () => {
        console.log("Attempting to close locker:", flowState.lockerId);
        setIsClosing(true);
        setStatusMessage('Syncing with backend...');
        try {
            const result = await lockerApi.close(flowState.lockerId);
            console.log("Locker closed successfully:", result);
            setStep('CLOSED');
            setTimeout(() => {
                setStep('COMPLETED');
            }, 1500);
        } catch (error) {
            console.error("Failed to close locker:", error);
            setStatusMessage('Error: ' + error.message);
            setIsClosing(false);
        }
    };

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            <div 
                className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`, backgroundSize: '40px 40px' }}
            />
            
            <div className="w-full max-w-md mx-4 z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 relative shadow-2xl">
                    <div className="text-center">
                        {step === 'OPENING' && (
                            <div className="animate-content">
                                <LockerGraphic isOpen={false} isFree={false} hasPackage={true} lockerId={flowState.lockerId} />
                                <Loader text="Authenticating Lock..." />
                            </div>
                        )}

                        {step === 'OPEN' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={true} isFree={true} hasPackage={true} lockerId={flowState.lockerId} />
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Access Granted</h3>
                                    <p className="text-slate-400 mt-2">Locker unit {flowState.lockerId} is now open.</p>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        onClick={handleCloseDoor} 
                                        disabled={isClosing}
                                        variant="warning"
                                        className="w-full py-4 rounded-2xl shadow-lg shadow-orange-900/20"
                                    >
                                        {isClosing ? 'Syncing...' : 'Locker Closed'}
                                    </Button>
                                    {statusMessage && <p className="mt-4 text-sm text-emerald-400 font-medium">{statusMessage}</p>}
                                </div>
                            </div>
                        )}

                        {step === 'CLOSED' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={false} isFree={true} hasPackage={false} lockerId={flowState.lockerId} />
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Locker Secured</h3>
                                    <p className="text-slate-400 mt-2">Completing your session...</p>
                                </div>
                            </div>
                        )}

                        {step === 'COMPLETED' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={false} isFree={true} hasPackage={false} lockerId={flowState.lockerId} />
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Operation Complete</h3>
                                    <p className="text-slate-400 mt-2">Package collection verified. Thank you.</p>
                                </div>
                                <p className="text-slate-500 text-sm italic">System resetting in {countdown}s...</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                    Return to Home
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickupStatus;
