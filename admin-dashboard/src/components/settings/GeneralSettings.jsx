import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { useTimezone } from '../../contexts/TimezoneContext';

const GeneralSettings = ({ onSave }) => {
    const { timezone, setTimezone } = useTimezone();
    const [settings, setSettings] = useState({
        systemName: 'SmartLock Pro',
        orgName: 'Acme Corporation',
        timezone: timezone,
        language: 'English (US)'
    });

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setSettings(prev => ({ ...prev, timezone }));
    }, [timezone]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimezone(settings.timezone);
        onSave(settings);
        setIsDirty(false);
    };

    return (
        <Card title="General Settings">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="System Name"
                    name="systemName"
                    value={settings.systemName}
                    onChange={handleChange}
                />
                <Input
                    label="Organization / Building Name"
                    name="orgName"
                    value={settings.orgName}
                    onChange={handleChange}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                    <select
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    >
                        <option value="UTC+0:00">UTC+0:00</option>
                        <option value="UTC+1:00">UTC+1:00</option>
                        <option value="UTC+5:30">UTC+5:30</option>
                        <option value="UTC-8:00">UTC-8:00</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                    >
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
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

export default GeneralSettings;
