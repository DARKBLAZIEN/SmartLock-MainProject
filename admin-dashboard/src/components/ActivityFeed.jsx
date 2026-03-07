import React from 'react';
import { Package, User, AlertTriangle, ShieldCheck } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'DELIVERY': return <Package className="h-4 w-4" />;
            case 'PICKUP': return <User className="h-4 w-4" />;
            case 'ADMIN_OVERRIDE': return <AlertTriangle className="h-4 w-4" />;
            default: return <ShieldCheck className="h-4 w-4" />;
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'DELIVERY': return 'bg-blue-100 text-blue-600';
            case 'PICKUP': return 'bg-green-100 text-green-600';
            case 'ADMIN_OVERRIDE': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id} className="relative pl-8 pb-2 last:pb-0">
                        {/* Timeline Line */}
                        {index !== 4 && (
                            <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100"></div>
                        )}

                        {/* Icon Bubble */}
                        <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${getColors(activity.type)}`}>
                            {getIcon(activity.type)}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 line-clamp-1">{activity.description}</span>
                            <span className="text-xs text-gray-400 mt-1">
                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
