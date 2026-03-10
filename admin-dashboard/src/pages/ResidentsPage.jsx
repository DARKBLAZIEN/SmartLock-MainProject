import React, { useEffect, useState } from 'react';
import { Mail, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getResidents } from '../mock/mockBackend';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';

// Inline style helpers using CSS variables
const surface = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
};
const surface2 = { backgroundColor: 'var(--color-bg-surface2)' };
const inputStyle = {
    backgroundColor: 'var(--color-bg-surface2)',
    border: '1px solid var(--color-border-md)',
    color: 'var(--color-text-primary)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    width: '100%',
    outline: 'none',
};

const ResidentsPage = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [formData, setFormData] = useState({ nameOfOwner: '', email: '', apartmentId: '' });
    const { searchQuery } = React.useContext(SearchContext);

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

    useEffect(() => { fetchResidents(); }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.action-menu-container')) {
                setActiveMenu(null);
            }
        };
        if (activeMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editId
            ? `http://localhost:5000/api/apartment/${editId}`
            : 'http://localhost:5000/api/apartment/register';
        const method = editId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameOfOwner: formData.nameOfOwner,
                    gmail: formData.email,
                    apartmentId: formData.apartmentId
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setEditId(null);
                setFormData({ nameOfOwner: '', email: '', apartmentId: '' });
                fetchResidents();
            } else {
                alert(editId ? 'Update Failed' : 'Registration Failed');
            }
        } catch (error) {
            alert('Error saving resident');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resident?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/apartment/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchResidents();
                setActiveMenu(null);
            } else {
                alert('Delete failed');
            }
        } catch (error) {
            alert('Error deleting resident');
        }
    };

    const openEditModal = (resident) => {
        setFormData({
            nameOfOwner: resident.nameOfOwner,
            email: resident.gmail,
            apartmentId: resident.apartmentId
        });
        setEditId(resident._id);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const openAddModal = () => {
        setFormData({ nameOfOwner: '', email: '', apartmentId: '' });
        setEditId(null);
        setIsModalOpen(true);
    };

    const filteredResidents = residents.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            user.nameOfOwner?.toLowerCase().includes(query) ||
            user.gmail?.toLowerCase().includes(query) ||
            user.apartmentId?.toString().toLowerCase().includes(query)
        );
    });

    if (loading) return <AdminLayout title="Residents"><Loader /></AdminLayout>;

    return (
        <AdminLayout title="Resident Directory">
            <div className="flex justify-end mb-4">
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                    + Add Resident
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="p-6 rounded-2xl w-96 shadow-2xl transition-colors duration-200"
                        style={surface}
                    >
                        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                            {editId ? 'Edit Resident' : 'Add New Resident'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                placeholder="Full Name"
                                style={inputStyle}
                                value={formData.nameOfOwner}
                                onChange={e => setFormData({ ...formData, nameOfOwner: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Email"
                                type="email"
                                style={inputStyle}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Apartment ID (e.g. 101)"
                                style={inputStyle}
                                value={formData.apartmentId}
                                onChange={e => setFormData({ ...formData, apartmentId: e.target.value })}
                                required
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditId(null);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-surface2)' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    {editId ? 'Update Resident' : 'Save Resident'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden transition-colors duration-200" style={surface}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-surface2)', borderBottom: '1px solid var(--color-border)' }}>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>User</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Apartment</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredResidents.map((user, idx) => (
                            <tr
                                key={user._id}
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: 'var(--color-accent)' }}
                                        >
                                            {user.nameOfOwner?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user.nameOfOwner}</p>
                                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                                                <Mail className="h-3 w-3" /> {user.gmail}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className="font-mono text-xs px-2.5 py-1 rounded-lg"
                                        style={{ backgroundColor: 'var(--color-bg-surface2)', color: 'var(--color-text-muted)' }}
                                    >
                                        {user.apartmentId}
                                    </span>
                                </td>
                                <td className="px-6 py-4 relative action-menu-container">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                                        style={{ color: 'var(--color-text-subtle)' }}
                                        className="hover:opacity-80 transition-opacity p-1"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </button>

                                    {activeMenu === user._id && (
                                        <div
                                            className="absolute right-10 top-2 z-10 w-32 rounded-xl shadow-xl border overflow-hidden"
                                            style={{ backgroundColor: 'var(--color-bg-surface2)', borderColor: 'var(--color-border)' }}
                                        >
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-white/5 transition-colors"
                                                style={{ color: 'var(--color-text-primary)' }}
                                            >
                                                <Edit className="h-3 w-3" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-red-500/10 transition-colors"
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 className="h-3 w-3" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredResidents.length === 0 && (
                    <div className="p-12 text-center" style={{ color: 'var(--color-text-subtle)' }}>
                        No residents found.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ResidentsPage;
