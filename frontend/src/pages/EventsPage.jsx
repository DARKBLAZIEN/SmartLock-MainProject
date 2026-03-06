import React, { useEffect, useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getRecentActivity } from '../mock/mockBackend';
import Loader from '../components/Loader';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRecentActivity().then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    const getTypeColor = (type) => {
        switch (type) {
            case 'DELIVERY': return 'bg-blue-100 text-blue-700';
            case 'PICKUP': return 'bg-green-100 text-green-700';
            case 'ADMIN_OVERRIDE': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <AdminLayout title="Events Log"><Loader /></AdminLayout>;

    return (
        <AdminLayout title="System Events">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                        <Filter className="h-3 w-3" /> Filter Type
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
                        <Calendar className="h-3 w-3" /> Date Range
                    </button>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4 w-32">Type</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Locker</th>
                            <th className="px-6 py-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {events.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getTypeColor(log.type)}`}>
                                        {log.type.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-medium">
                                    {log.description}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {log.lockerId || '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                    <span className="ml-2 text-xs text-gray-400">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default EventsPage;
