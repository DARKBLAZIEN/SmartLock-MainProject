import React from 'react';

const LockerGrid = ({ lockers, onForceOpen }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lockers.map((locker) => {
                const isOccupied = locker.status === 'OCCUPIED';
                const isOpen = locker.door === 'OPEN';

                let bgColor = 'bg-green-500';
                if (isOccupied) bgColor = 'bg-red-500';
                if (isOpen) bgColor = 'bg-yellow-400';

                return (
                    <div
                        key={locker.id}
                        className="flex flex-col items-center justify-between p-4 rounded-lg shadow-md bg-white border border-gray-200 h-32"
                    >
                        <div className="flex justify-between w-full items-start">
                            <span className="font-bold text-gray-700">{locker.id}</span>
                            <div className={`h-3 w-3 rounded-full ${bgColor}`}></div>
                        </div>

                        <div className="text-center text-xs text-gray-500 mt-1">
                            {isOccupied ? `Apt ${locker.apartmentId}` : 'Empty'}
                        </div>
                        <div className="text-center text-xs font-semibold text-gray-700 mt-1">
                            {isOpen ? 'DOOR OPEN' : 'DOOR CLOSED'}
                        </div>

                        {isOccupied && !isOpen && (
                            <button
                                onClick={() => onForceOpen(locker.id)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Force Open
                            </button>
                        )}

                        {isOpen && (
                            <span className="mt-2 text-xs text-red-500 animate-pulse">
                                Caution
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default LockerGrid;
