import React from 'react';

const LockerGraphic = ({ isOpen, isFree, hasPackage, lockerId }) => {
    return (
        <div className="py-8 pointer-events-none select-none">
            <div className="locker-container">
                <div className="locker-body">
                    {hasPackage && <div className="package-inside"></div>}
                    <div className="absolute bottom-4 text-[10px] text-slate-500 font-mono">
                        {lockerId}
                    </div>
                </div>
                <div className={`locker-door ${isOpen ? 'is-open' : ''}`}>
                    <div className={`locker-indicator ${isFree ? 'is-free' : ''}`}></div>
                    <div className="locker-handle"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-slate-500 font-bold text-lg opacity-20">{lockerId}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockerGraphic;
