import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlow, FLOW_STATUS } from '../context/FlowContext';
import { lockerApi } from '../api/locker.api';
import Card from '../components/Card';
import LockerGraphic from '../components/LockerGraphic';
import Loader from '../components/Loader';
import Button from '../components/Button';

const DeliveryStatus = () => {
    const navigate = useNavigate();
    const { flowState } = useFlow();
    const [step, setStep] = useState('OPENING'); // OPENING, PLACING, CLOSED, COMPLETED
    const [countdown, setCountdown] = useState(5);

    const [statusMessage, setStatusMessage] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Redirect if no active flow
        if (flowState.status !== FLOW_STATUS.SUCCESS || !flowState.lockerId) {
            navigate('/');
            return;
        }

        const lockerId = flowState.lockerId;

        // --- Hardware Integration for L01 ---
        if (lockerId === "L01" || lockerId === "L1") {
            const initiateUnlock = async () => {
                try {
                    console.log(`[Hardware] Triggering physical unlock for ${lockerId}`);
                    // Trigger the physical unlock sequence on the Raspberry Pi
                    const result = await lockerApi.unlockPhysical();
                    
                    if (result.success) {
                        setStep('PLACING');
                        setTimeout(() => {
                            setStep('CLOSED');
                            setTimeout(() => setStep('COMPLETED'), 1000);
                        }, 2000);
                    }
                } catch (error) {
                    console.error("Hardware Unlock failed, falling back to simulation:", error);
                    setTimeout(() => setStep('PLACING'), 1500);
                }
            };
            initiateUnlock();
        } else {
            // Virtual simulation for all other lockers
            const openTimer = setTimeout(() => {
                setStep('PLACING');
            }, 1500);
            return () => clearTimeout(openTimer);
        }
    }, [flowState, navigate]);


    const handleCloseDoor = async () => {
        console.log("Attempting to close locker:", flowState.lockerId);
        setIsClosing(true);
        setStatusMessage('Syncing with backend...');
        try {
            const result = await lockerApi.close(flowState.lockerId);
            console.log("Locker closed successfully:", result);
            setStep('CLOSED');
            
            // Short delay to show "Closed" state before completing
            setTimeout(() => {
                setStep('COMPLETED');
            }, 1000);
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
                style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`, backgroundSize: '40px 40px' }}
            />
            
            <div className="w-full max-w-md mx-4 z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 relative shadow-2xl">
                    <div className="text-center">
                        {step === 'OPENING' && (
                            <div className="animate-content">
                                <LockerGraphic isOpen={false} isFree={true} lockerId={flowState.lockerId} />
                                <Loader text="Activating Mechanical Lock..." />
                                <p className="mt-4 text-slate-400">Please wait for the locker to open.</p>
                            </div>
                        )}

                        {step === 'PLACING' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={true} isFree={false} hasPackage={true} lockerId={flowState.lockerId} />
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Locker {flowState.lockerId} Active</h3>
                                    <p className="text-slate-400 mt-2">Please place the package inside the unit.</p>
                                </div>
                                
                                <div className="pt-4">
                                    <Button 
                                        onClick={handleCloseDoor} 
                                        disabled={isClosing}
                                        variant="warning"
                                        className="w-full py-4 rounded-2xl shadow-lg shadow-orange-900/20"
                                    >
                                        {isClosing ? 'Securing Lock...' : 'Confirm Closure & Lock'}
                                    </Button>
                                    {statusMessage && <p className="mt-4 text-sm text-indigo-400 font-medium">{statusMessage}</p>}
                                </div>
                            </div>
                        )}

                        {step === 'CLOSED' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={false} isFree={false} hasPackage={true} lockerId={flowState.lockerId} />
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Locker Secured</h3>
                                    <p className="text-slate-400 mt-2">Updating central management system...</p>
                                </div>
                            </div>
                        )}

                        {step === 'COMPLETED' && (
                            <div className="space-y-6">
                                <LockerGraphic isOpen={false} isFree={false} hasPackage={true} lockerId={flowState.lockerId} />
                                <h3 className="text-2xl font-bold text-white tracking-tight">Delivery Confirmed</h3>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left text-sm space-y-3">
                                    <p className="flex justify-between"><span className="text-slate-400">Locker Unit:</span> <span className="text-white font-mono">{flowState.lockerId}</span></p>
                                    <p className="flex justify-between"><span className="text-slate-400">Destination:</span> <span className="text-white font-mono">{flowState.apartmentId}</span></p>
                                    <p className="flex justify-between"><span className="text-slate-400">Access OTP:</span> <span className="text-indigo-400 font-bold italic underline">Sent to Resident</span></p>
                                </div>
                                <p className="text-slate-500 text-sm">Session closing in {countdown}s...</p>

                                <button 
                                    onClick={() => navigate('/')}
                                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                >
                                    Finish Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryStatus;
