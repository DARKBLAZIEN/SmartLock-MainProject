import React, { useContext } from 'react';
import { Bell, Search, UserCircle, Activity, ChevronRight } from 'lucide-react';
import { SearchContext } from '../contexts/SearchContext';
import { lockerApi } from '../api/locker.api';
import { Link } from 'react-router-dom';
import { useTimezone } from '../contexts/TimezoneContext';
import { useSettings } from '../contexts/SettingsContext';

const Header = ({ title }) => {
    const { searchQuery, setSearchQuery } = useContext(SearchContext);
    const { formatInTimezone } = useTimezone();
    const { t, translateDescription } = useSettings();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [recentEvents, setRecentEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRecentEvents = async () => {
        if (!isNotificationsOpen) {
            setLoading(true);
            try {
                const data = await lockerApi.getEvents();
                setRecentEvents(data.slice(0, 10)); // Show last 10
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        }
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const getIconStyle = (type) => {
        switch (type) {
            case 'DELIVERY': return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
            case 'PICKUP': return { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' };
            case 'ADMIN_OVERRIDE': return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' };
            default: return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' };
        }
    };

    return (
        <header
            className="h-16 backdrop-blur-md border-b px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)'
            }}
        >
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                    <input
                        type="text"
                        placeholder={t('Search...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all w-64"
                        style={{
                            backgroundColor: 'var(--color-bg-surface2)',
                            color: 'var(--color-text-primary)',
                            border: 'none'
                        }}
                    />
                </div>

                {/* Actions */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={fetchRecentEvents}
                        className="relative p-2 transition-all rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{ color: 'var(--color-text-subtle)' }}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" style={{ border: '2px solid var(--color-bg-surface)' }}></span>
                    </button>

                    {isNotificationsOpen && (
                        <div
                            className="absolute top-full right-0 mt-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                            style={{
                                backgroundColor: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
                                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('Recent Activity')}</h3>
                                <Link
                                    to="/events"
                                    onClick={() => setIsNotificationsOpen(false)}
                                    className="text-xs font-semibold hover:underline flex items-center gap-1"
                                    style={{ color: 'var(--color-accent)' }}
                                >
                                    {t('View All')} <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 text-center text-xs" style={{ color: 'var(--color-text-subtle)' }}>{t('Loading...')}</div>
                                ) : recentEvents.length === 0 ? (
                                    <div className="p-8 text-center text-xs" style={{ color: 'var(--color-text-subtle)' }}>{t('No recent activity')}</div>
                                ) : (
                                   <div className="divide-y divide-gray-200">
                                        {recentEvents.map((event) => (
                                            <div
                                                key={event._id}
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 items-start"
                                            >
                                                <div
                                                    className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                                                    style={getIconStyle(event.type)}
                                                >
                                                    <Activity className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-xs font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                                                        {translateDescription(event.description)}
                                                    </p>
                                                    <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                                                        {formatInTimezone(event.timestamp, true)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-gray-50/50 dark:bg-gray-800/20 text-center border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                                    {t('Showing last 10 system events')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-6" style={{ borderLeft: '1px solid var(--color-border)' }}>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('Admin User')}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{t('Super Admin')}</p>
                    </div>
                    <div className="h-9 w-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm text-indigo-600" style={{ border: '2px solid var(--color-border)' }}>
                        <UserCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
