import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import Toggle from '../Toggle';

const UserManagementSettings = ({ onSave }) => {
    const [settings, setSettings] = useState({
        allowSelfReg: true,
        maxLockers: 2,
        inactivityTimeout: 90
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
        <Card title="User Management Settings">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Toggle
                    label="Allow Resident Self Registration"
                    description="Residents can create their own accounts via the user app"
                    enabled={settings.allowSelfReg}
                    setEnabled={(val) => handleToggle('allowSelfReg', val)}
                />

                <Input
                    label="Maximum Lockers per Resident"
                    type="number"
                    name="maxLockers"
                    value={settings.maxLockers}
                    onChange={handleChange}
                    min="1"
                />

                <Input
                    label="Resident Inactivity Timeout (days)"
                    type="number"
                    name="inactivityTimeout"
                    value={settings.inactivityTimeout}
                    onChange={handleChange}
                    min="1"
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

export default UserManagementSettings;
