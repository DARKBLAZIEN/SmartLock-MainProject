import React, { createContext, useState, useContext } from 'react';

const FlowContext = createContext();

export const FLOW_MODES = {
    DELIVERY: 'DELIVERY',
    PICKUP: 'PICKUP',
    IDLE: 'IDLE'
};

export const FLOW_STATUS = {
    IDLE: 'IDLE',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
};

export const FlowProvider = ({ children }) => {
    const [flowState, setFlowState] = useState({
        mode: FLOW_MODES.IDLE,
        apartmentId: '',
        lockerId: '',
        status: FLOW_STATUS.IDLE,
        error: null,
        details: null // extra data like deliveryId or message
    });

    const startFlow = (mode) => {
        setFlowState({
            mode,
            apartmentId: '',
            lockerId: '',
            status: FLOW_STATUS.IDLE,
            error: null,
            details: null
        });
    };

    const updateFlow = (updates) => {
        setFlowState((prev) => ({
            ...prev,
            ...updates
        }));
    };

    const resetFlow = () => {
        setFlowState({
            mode: FLOW_MODES.IDLE,
            apartmentId: '',
            lockerId: '',
            status: FLOW_STATUS.IDLE,
            error: null,
            details: null
        });
    };

    return (
        <FlowContext.Provider value={{ flowState, startFlow, updateFlow, resetFlow }}>
            {children}
        </FlowContext.Provider>
    );
};

export const useFlow = () => {
    const context = useContext(FlowContext);
    if (!context) {
        throw new Error('useFlow must be used within a FlowProvider');
    }
    return context;
};
