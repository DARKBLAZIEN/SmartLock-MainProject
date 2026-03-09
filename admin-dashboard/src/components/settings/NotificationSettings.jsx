import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Toggle from '../Toggle';

const NotificationSettings = ({ onSave }) => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        doorOpenAlerts: true,
        failedAccessAlerts: true
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleToggle = (name, value) => {
        setSettings(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(settings);
        setIsDirty(false);
    };

    return (
        <Card title="Notification Settings">
            <form onSubmit={handleSubmit} className="space-y-2">
                <Toggle
                    label="Email Notifications"
                    description="Receive system updates via email"
                    enabled={settings.emailNotifications}
                    setEnabled={(val) => handleToggle('emailNotifications', val)}
                />
                <Toggle
                    label="SMS Notifications"
                    description="Receive urgent alerts via SMS"
                    enabled={settings.smsNotifications}
                    setEnabled={(val) => handleToggle('smsNotifications', val)}
                />
                <Toggle
                    label="Door Left Open Alerts"
                    description="Notify if a locker door remains open too long"
                    enabled={settings.doorOpenAlerts}
                    setEnabled={(val) => handleToggle('doorOpenAlerts', val)}
                />
                <Toggle
                    label="Failed Access Alerts"
                    description="Notify after suspicious failed entry attempts"
                    enabled={settings.failedAccessAlerts}
                    setEnabled={(val) => handleToggle('failedAccessAlerts', val)}
                />

                <div className="pt-6 mt-4 border-t border-gray-100 flex justify-end">
                    <Button
                        type="submit"
                        disabled={!isDirty}
                        className={`w-auto px-8 ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default NotificationSettings;
