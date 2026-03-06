import React from 'react';
import { Bell, Search, UserCircle } from 'lucide-react';

const Header = ({ title }) => {
    return (
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

            <div className="flex items-center gap-6">
                {/* Search Mock */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
                    />
                </div>

                {/* Actions */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">Admin User</p>
                        <p className="text-xs text-gray-400">Super Admin</p>
                    </div>
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-indigo-600">
                        <UserCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
