import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { RefreshCw, Radio } from 'lucide-react';

const HardwareSettings = ({ onSave }) => {
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
        alert('Testing connection to ' + settings.deviceIp + '...');
    };

    const restartDevice = () => {
        // Mock restart
        if (confirm('Are you sure you want to restart the hardware controller?')) {
            alert('Restart command sent.');
        }
    };

    return (
        <Card title="Hardware Settings">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl mb-4 border border-green-100">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Radio className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-green-900">Device Status: {settings.status}</p>
                        <p className="text-xs text-green-700">Last heartbeat: 2 minutes ago</p>
                    </div>
                </div>

                <Input
                    label="Device Name"
                    name="deviceName"
                    value={settings.deviceName}
                    onChange={handleChange}
                />
                <Input
                    label="Device IP Address"
                    name="deviceIp"
                    value={settings.deviceIp}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={testConnection}>
                        Test Connection
                    </Button>
                    <Button type="button" variant="outline" onClick={restartDevice} className="text-red-600 hover:bg-red-50 hover:border-red-200">
                        <RefreshCw className="mr-2 h-4 w-4" /> Restart Device
                    </Button>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
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

export default HardwareSettings;
