import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

    const variants = {
        primary: "text-white",
        secondary: "nav-active", // using the active style from index.css or similar
        outline: "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };

    const getVariantStyle = (v) => {
        if (v === 'primary') return { 
            backgroundColor: 'var(--color-accent)', 
            color: 'var(--color-accent-contrast)',
            boxShadow: '0 4px 6px -1px var(--color-accent-light)' 
        };
        if (v === 'secondary') return { backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' };
        return {};
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            style={{ ...getVariantStyle(variant), ...props.style }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
