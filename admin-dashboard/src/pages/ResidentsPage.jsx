import React, { useEffect, useState } from 'react';
import { Mail, MoreVertical, Edit, Trash2, X, ArrowLeft, UserPlus, ArrowRight, User, Hash, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getResidents } from '../mock/mockBackend';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';
import { useSettings } from '../contexts/SettingsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const [formData, setFormData] = useState({ nameOfOwner: '', email: '', apartmentId: '', otp: '' });
    const [originalData, setOriginalData] = useState(null);
    const [regStep, setRegStep] = useState('info'); // 'info' or 'otp'
    const [submitting, setSubmitting] = useState(false);
    const { searchQuery } = React.useContext(SearchContext);
    const { t } = useSettings();

    const fetchResidents = async () => {
        try {
            const res = await fetch(`${API_URL}/apartment`);
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
        if (e) e.preventDefault();
        
        // If editing
        if (editId) {
            const isEmailChanged = formData.email !== originalData.email;

            // If email changed, we need OTP
            if (isEmailChanged) {
                setSubmitting(true);
                try {
                    const res = await fetch(`${API_URL}/apartment/register-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ gmail: formData.email })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        setRegStep('otp');
                    } else {
                        alert(data.message || 'Failed to send OTP');
                    }
                } catch (error) {
                    alert('Error sending OTP');
                } finally {
                    setSubmitting(false);
                }
                return;
            }

            // If email NOT changed, direct update
            setSubmitting(true);
            try {
                const res = await fetch(`${API_URL}/apartment/${editId}`, {
                    method: 'PUT',
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
                    setFormData({ nameOfOwner: '', email: '', apartmentId: '', otp: '' });
                    fetchResidents();
                    alert('Resident updated successfully!');
                } else {
                    const data = await res.json();
                    alert(data.message || 'Update Failed');
                }
            } catch (error) {
                alert('Error updating resident');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        // If adding new, trigger OTP
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/apartment/register-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gmail: formData.email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRegStep('otp');
            } else {
                alert(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            alert('Error sending OTP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editId 
                ? `${API_URL}/apartment/${editId}` 
                : `${API_URL}/apartment/register`;
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nameOfOwner: formData.nameOfOwner,
                    gmail: formData.email,
                    apartmentId: formData.apartmentId,
                    otp: formData.otp
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsModalOpen(false);
                setEditId(null);
                setRegStep('info');
                setFormData({ nameOfOwner: '', email: '', apartmentId: '', otp: '' });
                fetchResidents();
                alert(editId ? 'Resident updated successfully!' : 'Resident added successfully!');
            } else {
                alert(data.message || 'Verification Failed');
            }
        } catch (error) {
            alert('Error verifying OTP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/apartment/register-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gmail: formData.email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('OTP resent successfully!');
            } else {
                alert(data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            alert('Error resending OTP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resident?')) return;
        try {
            const res = await fetch(`${API_URL}/apartment/${id}`, { method: 'DELETE' });
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
        const data = {
            nameOfOwner: resident.nameOfOwner,
            email: resident.gmail,
            apartmentId: resident.apartmentId,
            otp: ''
        };
        setFormData(data);
        setOriginalData(data);
        setEditId(resident._id);
        setRegStep('info');
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const openAddModal = () => {
        setFormData({ nameOfOwner: '', email: '', apartmentId: '', otp: '' });
        setOriginalData(null);
        setEditId(null);
        setRegStep('info');
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

    if (loading) return <AdminLayout title={t('Residents')}><Loader /></AdminLayout>;

    return (
        <AdminLayout title={t('Resident Directory')}>
            <div className="flex justify-end mb-4">
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
                >
                    + {t('Add Resident')}
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="p-6 rounded-2xl w-96 shadow-2xl transition-colors duration-200 relative"
                        style={surface}
                    >
                        {regStep === 'otp' && (
                            <button 
                                onClick={() => setRegStep('info')}
                                className="absolute left-6 top-7 text-slate-500 hover:text-blue-400 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h2 className={`text-xl font-bold mb-4 ${regStep === 'otp' ? 'text-center' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                            {editId ? t('Edit') : (regStep === 'info' ? t('Add Resident') : t('Verify Email'))}
                        </h2>
                        
                        {regStep === 'info' ? (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    placeholder={t('Full Name')}
                                    style={inputStyle}
                                    value={formData.nameOfOwner}
                                    onChange={e => setFormData({ ...formData, nameOfOwner: e.target.value })}
                                    required
                                    disabled={submitting}
                                />
                                <input
                                    placeholder={t('Email')}
                                    type="email"
                                    style={inputStyle}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={submitting}
                                />
                                <input
                                    placeholder={t('Apartment ID')}
                                    style={inputStyle}
                                    value={formData.apartmentId}
                                    onChange={e => setFormData({ ...formData, apartmentId: e.target.value })}
                                    required
                                    disabled={submitting}
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
                                        disabled={submitting}
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
                                        disabled={submitting}
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {editId 
                                            ? (formData.email !== originalData.email ? t('Verify Gmail') : t('Update Resident')) 
                                            : t('Verify & Continue')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <p className="text-xs text-center mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                    Enter the 6-digit code sent to<br/>
                                    <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{formData.email}</span>
                                </p>
                                <input
                                    placeholder={t('6-Digit OTP')}
                                    style={{...inputStyle, textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.1rem'}}
                                    value={formData.otp}
                                    onChange={e => setFormData({ ...formData, otp: e.target.value })}
                                    maxLength={6}
                                    required
                                    disabled={submitting}
                                />
                                <div className="space-y-2">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={submitting}
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {editId ? t('Update Registration') : t('Complete Registration')}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="w-full py-2 text-xs font-medium hover:underline disabled:opacity-50"
                                        style={{ color: 'var(--color-accent)' }}
                                        disabled={submitting}
                                    >
                                        {t("Didn't get a code? Resend")}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden transition-colors duration-200" style={surface}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-bg-surface2)', borderBottom: '1px solid var(--color-border)' }}>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>{t('User')}</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>{t('Apartment')}</th>
                            <th className="px-6 py-4 text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>{t('Actions')}</th>
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
                                            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
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
                                                <Edit className="h-3 w-3" /> {t('Edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-red-500/10 transition-colors"
                                                style={{ color: '#ef4444' }}
                                            >
                                                <Trash2 className="h-3 w-3" /> {t('Delete')}
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
                        {t('No residents found.')}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ResidentsPage;
