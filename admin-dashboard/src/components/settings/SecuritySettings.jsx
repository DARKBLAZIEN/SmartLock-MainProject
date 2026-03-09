import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import Toggle from '../Toggle';

const SecuritySettings = ({ onSave }) => {
    const [settings, setSettings] = useState({
        otpExpiry: 5,
        maxFailedAttempts: 3,
        sessionTimeout: 30,
        enable2FA: false
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
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
        <Card title="Security Settings">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="OTP Expiry Time (minutes)"
                    type="number"
                    name="otpExpiry"
                    value={settings.otpExpiry}
                    onChange={handleChange}
                    min="1"
                />
                <Input
                    label="Maximum Failed Attempts"
                    type="number"
                    name="maxFailedAttempts"
                    value={settings.maxFailedAttempts}
                    onChange={handleChange}
                    min="1"
                />
                <Input
                    label="Session Timeout (minutes)"
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    min="1"
                />

                <Toggle
                    label="Enable Two Factor Authentication"
                    description="Require an extra code for administrative logins"
                    enabled={settings.enable2FA}
                    setEnabled={(val) => handleToggle('enable2FA', val)}
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

export default SecuritySettings;
