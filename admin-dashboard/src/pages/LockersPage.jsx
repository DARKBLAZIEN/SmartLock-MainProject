import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, Unlock, RotateCcw, Plus, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { io } from 'socket.io-client';
import AdminLayout from '../components/AdminLayout';
import LockerGraphic from '../components/LockerGraphic';
import { lockerApi } from '../api/locker.api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { SearchContext } from '../contexts/SearchContext';
import { useSettings } from '../contexts/SettingsContext';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const LockersPage = () => {
    const { t } = useSettings();
    const [lockers, setLockers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [connected, setConnected] = useState(false);
    const [toast, setToast] = useState(null);
    const socketRef = useRef(null);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLockerId, setNewLockerId] = useState('');
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, id: null });
    const [error, setError] = useState(null);
    const { searchQuery } = React.useContext(SearchContext);

    // ─── Socket.IO live simulation ───────────────────────────────────────────
    useEffect(() => {
        const socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('openLocker', ({ lockerId }) => {
            setLockers(prev => prev.map(l =>
                l.id === lockerId ? { ...l, door: 'OPEN' } : l
            ));
            showToast(`🔓 Locker ${lockerId} opened`);
        });

        socket.on('closeLocker', ({ lockerId }) => {
            setLockers(prev => prev.map(l =>
                l.id === lockerId ? { ...l, door: 'CLOSED' } : l
            ));
            showToast(`🔒 Locker ${lockerId} closed`);
        });

        return () => socket.disconnect();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const fetchCheck = async () => {
            try {
                const lockerData = await lockerApi.getStatus();
                
                setLockers(lockerData.map(l => ({
                    id: l.lockerId,
                    status: l.isFree ? 'AVAILABLE' : 'OCCUPIED',
                    door: l.isOpen ? 'OPEN' : 'CLOSED'
                })));
            } catch (e) {
                console.error(e);
                setError('Failed to load data');
            }
            setLoading(false);
        };
        fetchCheck();
    }, [refreshKey]);

    // Action Handlers
    const initiateAction = (type, id) => {
        setConfirmAction({ isOpen: true, type, id });
    };

    const confirmActionHandler = async () => {
        const { type, id } = confirmAction;
        setConfirmAction({ isOpen: false, type: null, id: null });

        try {
            if (type === 'open') {
                console.log(`[Override] Opening ${id}`);
                await lockerApi.open(id);
                // Socket event will update the door state live
                setRefreshKey(k => k + 1);
            } else if (type === 'reset') {
                // Optimistic UI update for reset
                setLockers(prev => prev.map(l => l.id === id ? { ...l, door: 'CLOSED', status: 'AVAILABLE' } : l));
                console.log(`[Override] Resetting ${id}`);
                await lockerApi.reset(id);
                setRefreshKey(k => k + 1);
            }
        } catch (e) {
            console.error('Action error:', e);
            setError('Action failed: ' + e.message);
        }
    };

    const handleFastClose = async (id) => {
        try {
            await lockerApi.close(id);
            setRefreshKey(k => k + 1);
        } catch (e) {
            setError('Quick close failed: ' + e.message);
        }
    };

    const handleAddLocker = async (e) => {
        e.preventDefault();
        if (!newLockerId.trim()) return;

        try {
            await lockerApi.createLocker(newLockerId);
            setRefreshKey(k => k + 1);
            setIsAddModalOpen(false);
            setNewLockerId('');
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <AdminLayout title={t('Lockers')}><Loader /></AdminLayout>;

    return (
        <AdminLayout title={t('Locker Management')}>
            {/* Live Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
                    background: 'var(--color-accent)', color: 'var(--color-accent-contrast)',
                    padding: '10px 18px', borderRadius: '10px', fontWeight: 600,
                    fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    animation: 'fadeInUp 0.3s ease'
                }}>
                    {toast}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                {/* Live indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    connected
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                    {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span>{connected ? 'Simulation Live' : 'Disconnected'}</span>
                    {connected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
                    >
                        <Plus className="h-4 w-4" /> {t('Add Unit')}
                    </button>
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" /> {t('Refresh Status')}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockers.filter(locker => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    const displayStatus = locker.status === 'AVAILABLE' ? 'ready for use' : 'occupied';
                    return locker.id.toLowerCase().includes(query) || locker.status.toLowerCase().includes(query) || displayStatus.includes(query);
                }).map((locker) => (
                    <div key={locker.id} className="relative group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                        <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-lg
                  ${locker.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}
                `}></div>

                        <div className="flex justify-between items-start mt-2">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{locker.id}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {locker.status === 'AVAILABLE' ? t('Ready for use') : t('Occupied')}
                                </p>
                            </div>
                        </div>

                        <LockerGraphic 
                            isOpen={locker.door === 'OPEN'} 
                            isFree={locker.status === 'AVAILABLE'} 
                            hasPackage={locker.status === 'OCCUPIED'} 
                            lockerId={locker.id} 
                            onClick={() => {
                                if (locker.door === 'OPEN') {
                                    handleFastClose(locker.id);
                                }
                            }}
                        />

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                            <button
                                onClick={() => initiateAction('open', locker.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
                                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
                            >
                                <Unlock className="h-3 w-3" /> {t('Open')}
                            </button>
                            {locker.status !== 'AVAILABLE' && (
                                <button
                                    onClick={() => initiateAction('reset', locker.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                                >
                                    <RotateCcw className="h-3 w-3" /> {t('Reset')}
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
                title={t('Install New Locker')}
            >
                <form onSubmit={handleAddLocker} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Locker ID')}</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                            placeholder="e.g. L-124"
                            value={newLockerId}
                            onChange={(e) => setNewLockerId(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('Must be unique across the system.')}</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-contrast)' }}
                        >
                            {t('Install New Locker')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* CONFIRMATION MODAL */}
            <Modal
                isOpen={confirmAction.isOpen}
                onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                title={t('Confirm Action')}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-3">
                        <div className="shrink-0 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                             <h4 className="text-sm font-bold text-yellow-900">{t('Admin Override Warning')}</h4>
                            <p className="text-sm text-yellow-800 mt-1">
                                 {t('You are about to manually')} {confirmAction.type === 'open' ? t('force open') : t('reset')} {t('locker')} <strong>{confirmAction.id}</strong>.
                                 {t('This action will be logged in the system audit trail.')}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setConfirmAction({ ...confirmAction, isOpen: false })}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            onClick={confirmActionHandler}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            {t('Confirm Override')}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default LockersPage;
