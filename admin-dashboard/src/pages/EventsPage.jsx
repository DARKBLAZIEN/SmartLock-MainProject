import React, { useEffect, useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getRecentActivity } from '../mock/mockBackend';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';

const surface = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
};

const getTypeBadgeStyle = (type) => {
    switch (type) {
        case 'DELIVERY': return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
        case 'PICKUP': return { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' };
        case 'ADMIN_OVERRIDE': return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' };
        default: return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' };
    }
};

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery } = React.useContext(SearchContext);

    useEffect(() => {
        getRecentActivity().then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <AdminLayout title="Events Log"><Loader /></AdminLayout>;

    const filteredEvents = events.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const dateStr = new Date(log.timestamp).toLocaleDateString().toLowerCase();

        return (
            log.type.toLowerCase().includes(query) ||
            log.description.toLowerCase().includes(query) ||
            (log.lockerId && log.lockerId.toLowerCase().includes(query)) ||
            timeStr.includes(query) ||
            dateStr.includes(query)
        );
    });

    return (
        <AdminLayout title="System Events">
            <div className="rounded-2xl overflow-hidden transition-colors duration-200" style={surface}>
                {/* Filter Bar */}
                <div className="p-4 flex gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        style={{
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-bg-surface2)',
                            border: '1px solid var(--color-border-md)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)'}
                    >
                        <Filter className="h-3 w-3" /> Filter Type
                    </button>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        style={{
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-bg-surface2)',
                            border: '1px solid var(--color-border-md)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-border)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)'}
                    >
                        <Calendar className="h-3 w-3" /> Date Range
                    </button>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-surface2)', borderBottom: '1px solid var(--color-border)' }}>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider w-36" style={{ color: 'var(--color-text-subtle)' }}>Type</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Description</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Locker</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider text-right" style={{ color: 'var(--color-text-subtle)' }}>Time</th>
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
                                        {log.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {log.description}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {log.lockerId || '—'}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className="ml-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEvents.length === 0 && (
                    <div className="p-12 text-center" style={{ color: 'var(--color-text-subtle)' }}>
                        No events found.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default EventsPage;
