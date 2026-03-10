import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

    const variants = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        secondary: "text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
        outline: "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
