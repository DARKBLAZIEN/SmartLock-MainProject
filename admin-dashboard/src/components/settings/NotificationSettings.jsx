import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Toggle from '../Toggle';
import { useSettings } from '../../contexts/SettingsContext';

const NotificationSettings = ({ onSave }) => {
    const { t } = useSettings();
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
        <Card title={t('Notification Settings')}>
            <form onSubmit={handleSubmit} className="space-y-2">
                <Toggle
                    label={t('Email Notifications')}
                    description={t('Receive system updates via email')}
                    enabled={settings.emailNotifications}
                    setEnabled={(val) => handleToggle('emailNotifications', val)}
                />
                <Toggle
                    label={t('SMS Notifications')}
                    description={t('Receive urgent alerts via SMS')}
                    enabled={settings.smsNotifications}
                    setEnabled={(val) => handleToggle('smsNotifications', val)}
                />
                <Toggle
                    label={t('Door Left Open Alerts')}
                    description={t('Notify if a locker door remains open too long')}
                    enabled={settings.doorOpenAlerts}
                    setEnabled={(val) => handleToggle('doorOpenAlerts', val)}
                />
                <Toggle
                    label={t('Failed Access Alerts')}
                    description={t('Notify after suspicious failed entry attempts')}
                    enabled={settings.failedAccessAlerts}
                    setEnabled={(val) => handleToggle('failedAccessAlerts', val)}
                />

                <div className="pt-6 mt-4 border-t border-gray-100 flex justify-end">
                    <Button
                        type="submit"
                        disabled={!isDirty}
                        className={`w-auto px-8 ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {t('Save Changes')}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default NotificationSettings;
