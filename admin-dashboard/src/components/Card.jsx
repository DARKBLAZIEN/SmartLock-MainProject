import React from 'react';

const Card = ({ children, title, className = '' }) => {
    return (
        <div
            className={`rounded-2xl px-4 py-5 sm:p-6 transition-colors duration-200 ${className}`}
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
        >
            {title && (
                <h3 className="text-lg leading-6 font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

export default Card;
