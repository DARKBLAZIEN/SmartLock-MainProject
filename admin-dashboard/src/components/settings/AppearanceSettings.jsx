import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Button from '../Button';
import { Sun, Moon, Upload, Check } from 'lucide-react';

// Directly apply theme to document — no React context dependency
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}

const AppearanceSettings = ({ onSave }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [justApplied, setJustApplied] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#2563eb');
    const [logoUrl] = useState('/logo.png');

    // Sync with document class on mount
    useEffect(() => {
        const docTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setCurrentTheme(docTheme);
    }, []);

    const handleThemeChange = (newTheme) => {
        if (newTheme === currentTheme) return;
        applyTheme(newTheme);          // apply IMMEDIATELY
        setCurrentTheme(newTheme);
        // Show brief "Applied" flash
        setJustApplied(true);
        setTimeout(() => setJustApplied(false), 1500);
    };

    return (
        <Card title="Appearance Settings">
            <div className="space-y-6">

                {/* ── Theme Selection ── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Theme
                        </label>
                        {justApplied && (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-500 animate-pulse">
                                <Check className="h-3.5 w-3.5" /> Applied
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Light Button */}
                        <button
                            type="button"
                            onClick={() => handleThemeChange('light')}
                            className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200"
                            style={currentTheme === 'light'
                                ? { backgroundColor: '#eff6ff', borderColor: '#2563eb', color: '#2563eb' }
                                : { backgroundColor: 'var(--color-bg-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                            }
                        >
                            {/* Light preview */}
                            <div className="w-full h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col">
                                <div className="h-3 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                    <span className="h-1.5 w-4 rounded-sm bg-gray-200" />
                                </div>
                                <div className="flex flex-1">
                                    <div className="w-6 bg-gray-50 border-r border-gray-200" />
                                    <div className="flex-1 p-1 flex flex-col gap-1">
                                        <div className="h-1.5 w-full rounded-sm bg-gray-100" />
                                        <div className="h-1.5 w-2/3 rounded-sm bg-gray-100" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Sun className="h-4 w-4" />
                                <span className="font-semibold text-sm">Light</span>
                                {currentTheme === 'light' && <Check className="h-3.5 w-3.5" />}
                            </div>
                        </button>

                        {/* Dark Button */}
                        <button
                            type="button"
                            onClick={() => handleThemeChange('dark')}
                            className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200"
                            style={currentTheme === 'dark'
                                ? { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#60a5fa', color: '#60a5fa' }
                                : { backgroundColor: 'var(--color-bg-surface2)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                            }
                        >
                            {/* Dark preview */}
                            <div className="w-full h-16 rounded-xl overflow-hidden border border-gray-700 bg-slate-900 flex flex-col">
                                <div className="h-3 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                    <span className="h-1.5 w-4 rounded-sm bg-slate-700" />
                                </div>
                                <div className="flex flex-1">
                                    <div className="w-6 bg-slate-800 border-r border-slate-700" />
                                    <div className="flex-1 p-1 flex flex-col gap-1">
                                        <div className="h-1.5 w-full rounded-sm bg-slate-700" />
                                        <div className="h-1.5 w-2/3 rounded-sm bg-slate-700" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Moon className="h-4 w-4" />
                                <span className="font-semibold text-sm">Dark</span>
                                {currentTheme === 'dark' && <Check className="h-3.5 w-3.5" />}
                            </div>
                        </button>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                        Theme is applied instantly — no save required.
                    </p>
                </div>

                {/* ── Primary Color ── */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Primary Color</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={e => setPrimaryColor(e.target.value)}
                            className="h-10 w-20 p-1 rounded-lg cursor-pointer"
                            style={{ border: '1px solid var(--color-border)' }}
                        />
                        <span className="text-sm font-mono uppercase" style={{ color: 'var(--color-text-muted)' }}>{primaryColor}</span>
                    </div>
                </div>

                {/* ── Organization Logo ── */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Organization Logo</label>
                    <div
                        className="flex items-center gap-6 p-5 rounded-2xl border-2 border-dashed transition-colors duration-200"
                        style={{ borderColor: 'var(--color-border-md)', backgroundColor: 'var(--color-bg-surface2)' }}
                    >
                        <div
                            className="h-16 w-16 rounded-xl shadow-sm flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
                        >
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="max-h-12 max-w-[48px] object-contain"
                                onError={e => e.target.src = 'https://via.placeholder.com/64'}
                            />
                        </div>
                        <div className="flex-1">
                            <Button type="button" variant="outline" className="w-auto flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Change Logo
                            </Button>
                            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-subtle)' }}>PNG, JPG or SVG. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                {/* ── Save (for color / logo only) ── */}
                <div className="pt-4 flex justify-end" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <Button
                        type="button"
                        onClick={() => onSave({ theme: currentTheme, primaryColor, logoUrl })}
                        className="w-auto px-8"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default AppearanceSettings;
