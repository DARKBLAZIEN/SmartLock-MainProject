import React, { useEffect, useState } from 'react';
import { Mail, MoreVertical, Shield } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getResidents } from '../mock/mockBackend';
import Loader from '../components/Loader';

const ResidentsPage = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ nameOfOwner: '', email: '', apartmentId: '' });

    const fetchResidents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/apartment');
            const data = await res.json();
            setResidents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/apartment/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameOfOwner: formData.nameOfOwner,
                    gmail: formData.email,
                    apartmentId: formData.apartmentId
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ nameOfOwner: '', email: '', apartmentId: '' });
                fetchResidents();
            } else {
                alert('Output Failed');
            }
        } catch (error) {
            alert('Error adding resident');
        }
    };

    if (loading) return <AdminLayout title="Residents"><Loader /></AdminLayout>;

    return (
        <AdminLayout title="Resident Directory">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Add Resident
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Resident</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Name"
                                className="w-full p-2 border rounded"
                                value={formData.nameOfOwner}
                                onChange={e => setFormData({ ...formData, nameOfOwner: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Email"
                                type="email"
                                className="w-full p-2 border rounded"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Apartment ID (e.g. 101)"
                                className="w-full p-2 border rounded"
                                value={formData.apartmentId}
                                onChange={e => setFormData({ ...formData, apartmentId: e.target.value })}
                                required
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500">Cancel</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Apartment</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {residents.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {user.nameOfOwner?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.nameOfOwner}</p>
                                            <p className="text-gray-400 text-xs flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {user.gmail}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                        {user.apartmentId}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
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
