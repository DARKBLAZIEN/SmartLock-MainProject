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
            case 'general': return <GeneralSettings onSave={() => showToast('General settings saved successfully!')} />;
            case 'locker': return <LockerConfiguration onSave={() => showToast('Locker configuration saved successfully!')} />;
            case 'security': return <SecuritySettings onSave={() => showToast('Security settings saved successfully!')} />;
            case 'notifications': return <NotificationSettings onSave={() => showToast('Notification settings saved successfully!')} />;
            case 'hardware': return <HardwareSettings onSave={() => showToast('Hardware settings saved successfully!')} />;
            case 'users': return <UserManagementSettings onSave={() => showToast('User management settings saved successfully!')} />;
            case 'appearance': return <AppearanceSettings onSave={() => showToast('Appearance settings saved successfully!')} />;
            default: return null;
        }
    };

    return (
        <AdminLayout title="Settings">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Tab Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium mb-1 last:mb-0 ${
                                    activeTab === tab.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
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

            {/* Simple Toast */}
            {toast.show && (
                <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </AdminLayout>
    );
};

export default SettingsPage;
