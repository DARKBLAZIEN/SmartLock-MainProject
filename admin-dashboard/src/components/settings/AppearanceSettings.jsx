import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { Sun, Moon, Upload } from 'lucide-react';

const AppearanceSettings = ({ onSave }) => {
    const [settings, setSettings] = useState({
        theme: 'light',
        primaryColor: '#2563eb',
        logoUrl: '/logo.png'
    });

    const [isDirty, setIsDirty] = useState(false);

    const handleThemeChange = (theme) => {
        setSettings(prev => ({ ...prev, theme }));
        setIsDirty(true);
    };

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

    return (
        <Card title="Appearance Settings">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleThemeChange('light')}
                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === 'light'
                                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                }`}
                        >
                            <Sun className="h-5 w-5" />
                            <span className="font-medium">Light</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleThemeChange('dark')}
                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === 'dark'
                                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                }`}
                        >
                            <Moon className="h-5 w-5" />
                            <span className="font-medium">Dark</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            name="primaryColor"
                            value={settings.primaryColor}
                            onChange={handleChange}
                            className="h-10 w-20 p-1 rounded border border-gray-100 cursor-pointer"
                        />
                        <span className="text-sm font-mono text-gray-500 uppercase">{settings.primaryColor}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Logo</label>
                    <div className="flex items-center gap-6 p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                        <div className="h-16 w-16 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
                            <img src={settings.logoUrl} alt="Logo" className="max-h-12 max-w-[48px] object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/64'} />
                        </div>
                        <div className="flex-1">
                            <Button type="button" variant="outline" className="w-auto flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Change Logo
                            </Button>
                            <p className="mt-2 text-xs text-gray-400">PNG, JPG or SVG. Max 2MB.</p>
                        </div>
                    </div>
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

export default AppearanceSettings;
