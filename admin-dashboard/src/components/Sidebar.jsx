import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, Users, Activity, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Box, label: 'Lockers', path: '/lockers' },
        { icon: Users, label: 'Residents', path: '/residents' },
        { icon: Activity, label: 'Events', path: '/events' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <aside
            className="w-64 backdrop-blur-xl flex flex-col h-screen sticky top-0 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderRight: '1px solid var(--color-border)'
            }}
        >
            <div className="p-6 flex items-center gap-3">
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent))',
                        boxShadow: '0 10px 15px -3px var(--color-accent-light)'
                    }}
                >
                    <Box className="h-6 w-6" style={{ color: 'var(--color-accent-contrast)' }} />
                </div>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        SmartLock
                    </h1>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'nav-active'
                                : 'nav-default'
                            }`
                        }
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                            color: isActive ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                            boxShadow: isActive ? '0 4px 12px var(--color-accent-light)' : 'none',
                        })}
                        onMouseEnter={e => { if (!e.currentTarget.classList.contains('nav-active')) { e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)'; e.currentTarget.style.color = 'var(--color-text-primary)'; } }}
                        onMouseLeave={e => { if (!e.currentTarget.classList.contains('nav-active')) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; } }}
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

