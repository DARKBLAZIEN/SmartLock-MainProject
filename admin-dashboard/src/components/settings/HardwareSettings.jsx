import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { RefreshCw, Radio, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const HardwareSettings = ({ onSave }) => {
    const { t } = useSettings();
    const [settings, setSettings] = useState({
        deviceName: 'Main Controller Alpha',
        deviceIp: '192.168.1.105',
        status: 'Connected'
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(settings);
        setIsDirty(false);
    };

    const testConnection = () => {
        // Mock connection test
        alert(t('Testing connection to') + ' ' + settings.deviceIp + '...');
    };

    const restartDevice = () => {
        // Mock restart
        if (confirm(t('Are you sure you want to restart the hardware controller?'))) {
            alert(t('Restart command sent.'));
        }
    };

    const simulateAlert = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/apartment/test/alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Hardware sensor malfunction detected in Zone 4" })
            });
            if (res.ok) {
                alert(t('System Alert simulated! Check the Events Log.'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Card title={t('Hardware Settings')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl mb-4 border border-green-100">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Radio className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-green-900">{t('Device Status')}: {t(settings.status)}</p>
                        <p className="text-xs text-green-700">{t('Last heartbeat')}: {t('2 minutes ago')}</p>
                    </div>
                </div>

                <Input
                    label={t('Device Name')}
                    name="deviceName"
                    value={settings.deviceName}
                    onChange={handleChange}
                />
                <Input
                    label={t('Device IP Address')}
                    name="deviceIp"
                    value={settings.deviceIp}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={testConnection}>
                        {t('Test Connection')}
                    </Button>
                    <Button type="button" variant="outline" onClick={restartDevice} className="text-red-600 hover:bg-red-50 hover:border-red-200">
                        <RefreshCw className="mr-2 h-4 w-4" /> {t('Restart Device')}
                    </Button>
                    <Button type="button" variant="outline" onClick={simulateAlert} className="col-span-1 sm:col-span-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                        <AlertTriangle className="mr-2 h-4 w-4" /> {t('Simulate System Alert')}
                    </Button>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
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

export default HardwareSettings;
