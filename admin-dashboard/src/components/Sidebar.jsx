import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, Activity, Settings, LogOut } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Sidebar = () => {
    const { settings, updateSettings, t } = useSettings();

    const navItems = [
        { icon: LayoutDashboard, label: t('Overview'), path: '/' },
        { icon: Box, label: t('Lockers'), path: '/lockers' },
        { icon: Users, label: t('Residents'), path: '/residents' },
        { icon: Activity, label: t('Events'), path: '/events' },
        { icon: Settings, label: t('Settings'), path: '/settings' },
    ];

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
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                    style={{
                        background: settings.customLogo ? 'var(--color-bg-surface)' : 'linear-gradient(135deg, var(--color-accent), var(--color-accent))',
                        boxShadow: '0 10px 15px -3px var(--color-accent-light)',
                        border: settings.customLogo ? '1px solid var(--color-border)' : 'none'
                    }}
                >
                    {settings.customLogo ? (
                        <img src={settings.customLogo} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                        <Box className="h-6 w-6" style={{ color: 'var(--color-accent-contrast)' }} />
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold truncate max-w-[150px]" title={settings.systemName} style={{ color: 'var(--color-text-primary)' }}>
                        {settings.systemName}
                    </h1>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>{t('Admin Panel')}</p>
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
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-sm">{t('Logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
