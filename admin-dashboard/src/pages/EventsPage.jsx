import React, { useEffect, useState } from 'react';
import { Filter, Calendar, Clock } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { lockerApi } from '../api/locker.api';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { useSettings } from '../contexts/SettingsContext';

const surface = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
};

const getTypeBadgeStyle = (type) => {
    switch (type) {
        case 'DELIVERY': return { backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' };
        case 'PICKUP': return { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' };
        case 'CLOSE': return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' };
        case 'ADMIN_OVERRIDE': return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' };
        case 'SYSTEM_ALERT': return { backgroundColor: 'rgba(234,179,8,0.12)', color: '#eab308' };
        default: return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' };
    }
};

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery } = React.useContext(SearchContext);
    const { formatInTimezone } = useTimezone();
    const { t, translateDescription } = useSettings();
    const [filterType, setFilterType] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const timeDropdownRef = React.useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDateDropdownOpen(false);
            }
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
                setIsTimeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await lockerApi.getEvents();
                // Map API data to UI format
                const mappedData = data.map(item => ({
                    id: item._id,
                    type: item.type,
                    description: item.description,
                    lockerId: item.lockerId,
                    timestamp: item.timestamp
                }));
                setEvents(mappedData);
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <AdminLayout title={t('Events Log')}><Loader /></AdminLayout>;

    const filteredEvents = events.filter(log => {
        // 1. Type filter logic
        if (filterType !== 'ALL' && log.type !== filterType) {
            return false;
        }

        // 2. Custom Date range logic
        if (startDate || endDate) {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (logDate.getTime() < start.getTime()) return false;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (logDate.getTime() > end.getTime()) return false;
            }
        }

        // 3. Custom Time range logic
        if (startTime || endTime) {
            const logDate = new Date(log.timestamp);
            const logMinutes = logDate.getHours() * 60 + logDate.getMinutes();

            let startMins = 0;
            let endMins = 24 * 60;

            if (startTime) {
                const [startH, startM] = startTime.split(':').map(Number);
                startMins = startH * 60 + startM;
            }
            if (endTime) {
                const [endH, endM] = endTime.split(':').map(Number);
                endMins = endH * 60 + endM;
            }

            if (startTime && endTime && startMins > endMins) {
                // Time range crosses midnight (e.g., 23:00 to 02:00)
                if (logMinutes < startMins && logMinutes > endMins) return false;
            } else {
                // Normal same-day time range
                if (startTime && logMinutes < startMins) return false;
                if (endTime && logMinutes > endMins) return false;
            }
        }

        // 4. Search query logic
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const timeStr = formatInTimezone(log.timestamp, false).toLowerCase();
        const dateStr = formatInTimezone(log.timestamp).split(' ')[0].toLowerCase();

        return (
            log.type.toLowerCase().includes(query) ||
            log.description.toLowerCase().includes(query) ||
            (log.lockerId && log.lockerId.toLowerCase().includes(query)) ||
            timeStr.includes(query) ||
            dateStr.includes(query)
        );
    });

    return (
        <AdminLayout title={t('System Events')}>
            <div className="rounded-2xl overflow-hidden transition-colors duration-200" style={surface}>
                {/* Filter Bar */}
                <div className="p-4 flex gap-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="relative flex items-center">
                        <Filter className="absolute left-3 h-3 w-3 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-8 pr-8 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer outline-none appearance-none"
                            style={{
                                color: 'var(--color-text-primary)',
                                backgroundColor: 'var(--color-bg-surface2)',
                                border: '1px solid var(--color-border-md)'
                            }}
                        >
                            <option value="ALL">{t('All Types')}</option>
                            <option value="DELIVERY">{t('Delivery')}</option>
                            <option value="PICKUP">{t('Pickup')}</option>
                            <option value="CLOSE">{t('Close')}</option>
                            <option value="ADMIN_OVERRIDE">{t('Admin Override')}</option>
                            <option value="SYSTEM_ALERT">{t('System Alert')}</option>
                        </select>
                    </div>

                    <div className="relative flex items-center" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{
                                color: 'var(--color-text-primary)',
                                backgroundColor: isDateDropdownOpen ? 'var(--color-border)' : 'var(--color-bg-surface2)',
                                border: '1px solid var(--color-border-md)'
                            }}
                            onMouseEnter={e => !isDateDropdownOpen && (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                            onMouseLeave={e => !isDateDropdownOpen && (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)')}
                        >
                            <Calendar className="h-3 w-3" /> {t('Date Range')}
                        </button>

                        {isDateDropdownOpen && (
                            <div className="absolute top-full mt-2 left-0 p-3 rounded-xl flex flex-col gap-3 shadow-lg z-50 min-w-max" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('From')}</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-2 py-1 text-xs font-medium rounded-md outline-none"
                                        style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-surface2)',
                                            border: '1px solid var(--color-border-md)'
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('To')}</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="px-2 py-1 text-xs font-medium rounded-md outline-none"
                                        style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-surface2)',
                                            border: '1px solid var(--color-border-md)'
                                        }}
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); setIsDateDropdownOpen(false); }}
                                        className="text-xs py-1.5 w-full text-center rounded-lg hover:underline transition-all"
                                        style={{ color: 'var(--color-text-subtle)', backgroundColor: 'var(--color-bg-surface2)' }}
                                    >
                                        {t('Clear Dates')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center" ref={timeDropdownRef}>
                        <button
                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{
                                color: 'var(--color-text-primary)',
                                backgroundColor: isTimeDropdownOpen ? 'var(--color-border)' : 'var(--color-bg-surface2)',
                                border: '1px solid var(--color-border-md)'
                            }}
                            onMouseEnter={e => !isTimeDropdownOpen && (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                            onMouseLeave={e => !isTimeDropdownOpen && (e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)')}
                        >
                            <Clock className="h-3 w-3" /> {t('Time Range')}
                        </button>

                        {isTimeDropdownOpen && (
                            <div className="absolute top-full mt-2 left-0 p-3 rounded-xl flex flex-col gap-3 shadow-lg z-50 min-w-max" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('From')}</span>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="px-2 py-1 text-xs font-medium rounded-md outline-none"
                                        style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-surface2)',
                                            border: '1px solid var(--color-border-md)'
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 justify-between">
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('To')}</span>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="px-2 py-1 text-xs font-medium rounded-md outline-none"
                                        style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-surface2)',
                                            border: '1px solid var(--color-border-md)'
                                        }}
                                    />
                                </div>
                                {(startTime || endTime) && (
                                    <button
                                        onClick={() => { setStartTime(''); setEndTime(''); setIsTimeDropdownOpen(false); }}
                                        className="text-xs py-1.5 w-full text-center rounded-lg hover:underline transition-all"
                                        style={{ color: 'var(--color-text-subtle)', backgroundColor: 'var(--color-bg-surface2)' }}
                                    >
                                        {t('Clear Times')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-surface2)', borderBottom: '1px solid var(--color-border)' }}>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider w-36" style={{ color: 'var(--color-text-subtle)' }}>{t('Type')}</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>{t('Description')}</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>{t('Lockers')}</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider text-right" style={{ color: 'var(--color-text-subtle)' }}>{t('Time')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredEvents.map((log) => (
                            <tr
                                key={log.id}
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td className="px-6 py-4">
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
                                        style={getTypeBadgeStyle(log.type)}
                                    >
                                        {t((log.type || 'EVENT'))}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {translateDescription(log.description)}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {log.lockerId || '—'}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        {formatInTimezone(log.timestamp).split(' ')[0]}
                                    </span>
                                    <span className="ml-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                        {formatInTimezone(log.timestamp).split(' ')[1]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center" style={{ color: 'var(--color-text-subtle)' }}>
                        {t('No events found.')}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default EventsPage;
