import React from 'react';

const Card = ({ children, title, className = '' }) => {
    return (
        <div className={`bg-white shadow rounded-lg px-4 py-5 sm:p-6 ${className}`}>
            {title && (
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

export default Card;
