import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useFlow } from '../context/FlowContext';

const Home = () => {
    const navigate = useNavigate();
    const { resetFlow } = useFlow();

    useEffect(() => {
        // Reset flow state when returning home
        resetFlow();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="max-w-md mx-auto w-full">
            <Card title="Welcome to SmartLock">
                <p className="mb-6 text-gray-600">
                    Select an option below to proceed with your package.
                </p>

                <div className="space-y-4">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/delivery')}
                    >
                        Deliver Package
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => navigate('/pickup')}
                    >
                        Collect Package
                    </Button>
                </div>
            </Card>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Smart Locker System v1.0</p>
            </div>
        </div>
    );
};

export default Home;
