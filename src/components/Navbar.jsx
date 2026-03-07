import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-2xl text-blue-600">SmartLock Admin</span>
                        </Link>
                    </div>
                    <div className="flex space-x-4 items-center">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Operations</Link>
                        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Dashboard</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
