import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import Toggle from '../Toggle';

const LockerConfiguration = ({ onSave }) => {
    const [settings, setSettings] = useState({
        autoLockDelay: 30,
        unlockDuration: 10,
        doorOpenTimeout: 60,
        enableAutoLock: true
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setSettings(prev => ({ ...prev, [name]: newValue }));
        setIsDirty(true);
    };

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
        <Card title="Locker Configuration">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Auto Lock Delay (seconds)"
                    type="number"
                    name="autoLockDelay"
                    value={settings.autoLockDelay}
                    onChange={handleChange}
                    min="1"
                />
                <Input
                    label="Unlock Duration (seconds)"
                    type="number"
                    name="unlockDuration"
                    value={settings.unlockDuration}
                    onChange={handleChange}
                    min="1"
                />
                <Input
                    label="Door Open Timeout (seconds)"
                    type="number"
                    name="doorOpenTimeout"
                    value={settings.doorOpenTimeout}
                    onChange={handleChange}
                    min="1"
                />

                <Toggle
                    label="Enable Auto-lock"
                    description="Automatically lock the door after the delay period"
                    enabled={settings.enableAutoLock}
                    setEnabled={(val) => handleToggle('enableAutoLock', val)}
                />

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

export default LockerConfiguration;
