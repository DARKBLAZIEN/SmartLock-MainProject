import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const Error = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto w-full">
            <Card>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        We encountered an unexpected error. Please return to the home screen and try again.
                    </p>

                    <Button
                        variant="primary"
                        onClick={() => navigate('/')}
                    >
                        Return Home
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Error;
