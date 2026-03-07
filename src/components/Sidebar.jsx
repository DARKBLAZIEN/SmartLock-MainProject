import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, Activity, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Box, label: 'Lockers', path: '/lockers' },
        { icon: Users, label: 'Residents', path: '/residents' },
        { icon: Activity, label: 'Events', path: '/events' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col h-screen sticky top-0 transition-all duration-300">
            <div className="p-6 flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box className="text-white h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        SmartLock
                    </h1>
                    <p className="text-xs text-gray-400 font-medium">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                        {/* Active Indicator */}
                        <div className="ml-auto w-1 h-1 rounded-full bg-blue-600 opacity-0 group-[.active]:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
