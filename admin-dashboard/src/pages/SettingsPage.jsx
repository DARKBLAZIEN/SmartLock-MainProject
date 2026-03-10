import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import GeneralSettings from '../components/settings/GeneralSettings';
import LockerConfiguration from '../components/settings/LockerConfiguration';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import HardwareSettings from '../components/settings/HardwareSettings';
import UserManagementSettings from '../components/settings/UserManagementSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'locker', label: 'Locker Config' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'users', label: 'User Mgmt' },
    { id: 'appearance', label: 'Appearance' },
];

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings onSave={() => showToast('General settings saved!')} />;
            case 'locker': return <LockerConfiguration onSave={() => showToast('Locker configuration saved!')} />;
            case 'security': return <SecuritySettings onSave={() => showToast('Security settings saved!')} />;
            case 'notifications': return <NotificationSettings onSave={() => showToast('Notification settings saved!')} />;
            case 'hardware': return <HardwareSettings onSave={() => showToast('Hardware settings saved!')} />;
            case 'users': return <UserManagementSettings onSave={() => showToast('User management settings saved!')} />;
            case 'appearance': return <AppearanceSettings onSave={() => showToast('Appearance settings saved!')} />;
            default: return null;
        }
    };

    return (
        <AdminLayout title="Settings">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Tab Navigation Sidebar */}
                <div className="w-full md:w-56 flex-shrink-0">
                    <div
                        className="rounded-2xl overflow-hidden p-2 transition-colors duration-200"
                        style={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)'
                        }}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium mb-1 last:mb-0"
                                style={{
                                    backgroundColor: activeTab === tab.id ? 'var(--color-accent-light)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                }}
                                onMouseEnter={e => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface2)';
                                        e.currentTarget.style.color = 'var(--color-text-primary)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-text-muted)';
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-w-0">
                    {renderTabContent()}
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div
                    className="fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 transition-all"
                    style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </AdminLayout>
    );
};

export default SettingsPage;
