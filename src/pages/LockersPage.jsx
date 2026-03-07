import React, { useEffect, useState } from 'react';
import { RefreshCw, Unlock, RotateCcw, Plus, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getLockers, forceOpenLocker, resetLocker, addLocker } from '../mock/mockBackend';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const LockersPage = () => {
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLockerId, setNewLockerId] = useState('');
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, id: null });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getLockers();
            setLockers(data);
            setLoading(false);
        };
        fetch();
    }, [refreshKey]);

    // Action Handlers
    const initiateAction = (type, id) => {
        setConfirmAction({ isOpen: true, type, id });
    };

    const confirmActionHandler = async () => {
        const { type, id } = confirmAction;
        try {
            if (type === 'open') await forceOpenLocker(id);
            if (type === 'reset') await resetLocker(id);
            setRefreshKey(k => k + 1);
            setConfirmAction({ isOpen: false, type: null, id: null });
        } catch (e) {
            setError('Action failed: ' + e.message);
        }
    };

    const handleAddLocker = async (e) => {
        e.preventDefault();
        if (!newLockerId.trim()) return;

        try {
            await addLocker(newLockerId);
            setRefreshKey(k => k + 1);
            setIsAddModalOpen(false);
            setNewLockerId('');
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <AdminLayout title="Lockers"><Loader /></AdminLayout>;

    return (
        <AdminLayout title="Locker Management">
            {/* Toolbar */}
            <div className="flex justify-end mb-6 gap-3">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Add Unit
                </button>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh Status
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockers.map((locker) => (
                    <div key={locker.id} className="relative group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-lg
                  ${locker.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}
                `}></div>

                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{locker.id}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {locker.status === 'AVAILABLE' ? 'Ready for use' : `Occupied by Apt ${locker.apartmentId}`}
                                </p>
                            </div>
                            <div className={`px-2 py-1 rounded-md text-xs font-bold
                     ${locker.door === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}
                   `}>
                                {locker.door}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => initiateAction('open', locker.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors"
                            >
                                <Unlock className="h-3 w-3" /> Open
                            </button>
                            {locker.status !== 'AVAILABLE' && (
                                <button
                                    onClick={() => initiateAction('reset', locker.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                                >
                                    <RotateCcw className="h-3 w-3" /> Reset
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD LOCKER MODAL */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Install New Locker"
            >
                <form onSubmit={handleAddLocker} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Locker ID</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="e.g. L-124"
                            value={newLockerId}
                            onChange={(e) => setNewLockerId(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">Must be unique across the system.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Install Unit
                        </button>
                    </div>
                </form>
            </Modal>

            {/* CONFIRMATION MODAL */}
            <Modal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                title="Confirm Action"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg flex gap-3">
                        <div className="shrink-0 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-yellow-900">Admin Override Warning</h4>
                            <p className="text-sm text-yellow-800 mt-1">
                                You are about to manually {confirmAction.type === 'open' ? 'force open' : 'reset'} locker <strong>{confirmAction.id}</strong>.
                                This action will be logged in the system audit trail.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmActionHandler}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Confirm Override
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default LockersPage;
