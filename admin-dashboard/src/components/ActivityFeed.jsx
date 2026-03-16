import React from 'react';
import { Package, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTimezone } from '../contexts/TimezoneContext';
import { useSettings } from '../contexts/SettingsContext';

const ActivityFeed = ({ activities }) => {
    const { formatInTimezone } = useTimezone();
    const { t, translateDescription } = useSettings();
    const getIcon = (type) => {
        switch (type) {
            case 'DELIVERY': return <Package className="h-4 w-4" />;
            case 'PICKUP': return <User className="h-4 w-4" />;
            case 'ADMIN_OVERRIDE': return <AlertTriangle className="h-4 w-4" />;
            default: return <ShieldCheck className="h-4 w-4" />;
        }
    };

    const getIconStyle = (type) => {
        switch (type) {
            case 'DELIVERY': return { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
            case 'PICKUP': return { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' };
            case 'ADMIN_OVERRIDE': return { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' };
            default: return { backgroundColor: 'rgba(100,116,139,0.12)', color: '#64748b' };
        }
    };

    return (
        <div
            className="rounded-2xl p-6 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
            }}
        >
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>{t('Recent Activity')}</h3>
            <div className="space-y-6">
                {activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="relative pl-8 pb-2 last:pb-0">
                        {/* Timeline Line */}
                        {index !== Math.min(activities.length - 1, 4) && (
                            <div
                                className="absolute left-[11px] top-8 bottom-0 w-[2px]"
                                style={{ backgroundColor: 'var(--color-border)' }}
                            />
                        )}

                        {/* Icon Bubble */}
                        <div
                            className="absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center"
                            style={getIconStyle(activity.type)}
                        >
                            {getIcon(activity.type)}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
                                {translateDescription(activity.description)}
                            </span>
                            <span className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>
                                {formatInTimezone(activity.timestamp, false)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
