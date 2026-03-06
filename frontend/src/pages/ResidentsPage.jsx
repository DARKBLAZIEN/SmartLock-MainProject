import React, { useEffect, useState } from 'react';
import { Mail, MoreVertical, Shield } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getResidents } from '../mock/mockBackend';
import Loader from '../components/Loader';

const ResidentsPage = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getResidents().then(data => {
            setResidents(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <AdminLayout title="Residents"><Loader /></AdminLayout>;

    return (
        <AdminLayout title="Resident Directory">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Apartment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Access</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {residents.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-gray-400 text-xs lex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {user.apartment}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Shield className="h-3 w-3" /> {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(user.lastAccess).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default ResidentsPage;
