import React from 'react';

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
    const iconStyles = {
        blue: { bg: 'var(--color-accent-light)', text: 'var(--color-accent)' },
        green: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e' },
        red: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
        purple: { bg: 'rgba(168,85,247,0.12)', text: '#a855f7' },
        orange: { bg: 'rgba(249,115,22,0.12)', text: '#f97316' },
    };

    const icon = iconStyles[color] || iconStyles.blue;

    return (
        <div
            className="rounded-2xl p-6 transition-all duration-200 hover:shadow-lg"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
            }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    <h3 className="text-3xl font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>{value}</h3>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: icon.bg }}>
                    <Icon className="h-6 w-6" style={{ color: icon.text }} />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="ml-2" style={{ color: 'var(--color-text-subtle)' }}>than the last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
