import React, { useEffect, useState } from 'react';
import { Package, Smartphone, AlertOctagon, TrendingUp } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import { lockerApi } from '../api/locker.api';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { useSettings } from '../contexts/SettingsContext';

const Dashboard = () => {
    const { t } = useSettings();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);
    const [weeklyActivities, setWeeklyActivities] = useState([0, 0, 0, 0, 0, 0, 0]);
    const { searchQuery } = React.useContext(SearchContext);
    const { formatInTimezone } = useTimezone();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real activities
                const activityData = await lockerApi.getEvents();
                
                // For stats, we can calculate some from the locker status
                const lockers = await lockerApi.getStatus();
                const occupiedCount = lockers.filter(l => !l.isFree).length;
                const totalCount = lockers.length;
                
                // --- Period Comparison Logic ---
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

                const currentMonthEvents = activityData.filter(a => new Date(a.timestamp) > thirtyDaysAgo);
                const lastMonthEvents = activityData.filter(a => {
                    const d = new Date(a.timestamp);
                    return d > sixtyDaysAgo && d <= thirtyDaysAgo;
                });

                const calcTrend = (curr, prev) => {
                    if (prev === 0) return curr * 100;
                    return Math.round(((curr - prev) / prev) * 100);
                };

                // Current Stats
                const currDeliveries = currentMonthEvents.filter(a => a.type === 'DELIVERY').length;
                const currPickups = currentMonthEvents.filter(a => a.type === 'PICKUP').length;
                const currRevenue = currPickups * 5.50;
                const currEfficiency = totalCount > 0 ? Math.round(((totalCount - occupiedCount) / totalCount) * 100) : 100;
                const currIssues = currentMonthEvents.filter(a => a.type === 'SYSTEM_ALERT').length;

                const lastDeliveries = lastMonthEvents.filter(a => a.type === 'DELIVERY').length;
                const lastPickups = lastMonthEvents.filter(a => a.type === 'PICKUP').length;
                const lastRevenue = lastPickups * 5.50;
                const lastIssues = lastMonthEvents.filter(a => a.type === 'SYSTEM_ALERT').length;

                // Estimate Last Month Efficiency (State exactly 30 days ago)
                // We calculate net change in occupancy over the last 30 days
                const netChangeLast30Days = currDeliveries - currPickups;
                const occupancy30DaysAgo = Math.max(0, occupiedCount - netChangeLast30Days);
                const efficiency30DaysAgo = totalCount > 0 ? Math.round(((totalCount - occupancy30DaysAgo) / totalCount) * 100) : 100;

                setStats({
                    todaysDeliveries: currDeliveries,
                    revenue: activityData.filter(a => a.type === 'PICKUP').length * 5.50, // Total Revenue
                    weeklyEfficiency: currEfficiency,
                    activeIssues: currIssues,
                    trends: {
                        deliveries: calcTrend(currDeliveries, lastDeliveries),
                        revenue: calcTrend(currRevenue, lastRevenue),
                        efficiency: calcTrend(currEfficiency, efficiency30DaysAgo), 
                        issues: calcTrend(currIssues, lastIssues)
                    }
                });

                setActivities(activityData.map(item => ({
                    id: item._id,
                    type: item.type,
                    description: item.description,
                    timestamp: item.timestamp
                })));

                // Calculate Weekly Activities for Graph
                const last7Days = Array(7).fill(0);
                
                activityData.forEach(event => {
                    const eventDate = new Date(event.timestamp);
                    const diffTime = Math.abs(now - eventDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 7) {
                        const actualDayIndex = (now.getDay() - diffDays + 7) % 7;
                        last7Days[actualDayIndex] += 1;
                    }
                });
                
                const maxActivity = Math.max(...last7Days, 5); 
                setWeeklyActivities(last7Days.map(count => (count / maxActivity) * 100));

            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <AdminLayout title={t('Overview')}><Loader text={t('Loading Dashboard...')} /></AdminLayout>;

    const filteredActivities = activities.filter(activity => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        const timeStr = formatInTimezone(activity.timestamp, false).toLowerCase();
        const dateStr = formatInTimezone(activity.timestamp).split(' ')[0].toLowerCase();

        return (
            activity.type?.toLowerCase().includes(query) ||
            activity.description?.toLowerCase().includes(query) ||
            (activity.lockerId && activity.lockerId.toLowerCase().includes(query)) ||
            timeStr.includes(query) ||
            dateStr.includes(query)
        );
    });

    return (
        <AdminLayout title={t('Overview')}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Package}
                    label={t('Total Deliveries')}
                    value={stats.todaysDeliveries}
                    trend={stats.trends?.deliveries || 0}
                    color="blue"
                />
                <StatCard
                    icon={Smartphone}
                    label={t('Revenue')}
                    value={`$${stats.revenue?.toFixed(2)}`}
                    trend={stats.trends?.revenue || 0}
                    color="green"
                />
                <StatCard
                    icon={TrendingUp}
                    label={t('Efficiency')}
                    value={`${stats.weeklyEfficiency}%`}
                    trend={stats.trends?.efficiency || 0}
                    color="purple"
                />
                <StatCard
                    icon={AlertOctagon}
                    label={t('Issues')}
                    value={stats.activeIssues}
                    trend={stats.trends?.issues || 0}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('Occupancy Trends')}</h3>
                        <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 outline-none">
                            <option>{t('This Week')}</option>
                            <option>{t('Last Week')}</option>
                        </select>
                    </div>

                    {/* Real-time Activity Visualization */}
                    <div className="h-64 flex items-end justify-between px-2 gap-2">
                        {weeklyActivities.map((height, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                <div
                                    className="relative w-full rounded-t-lg overflow-hidden h-full"
                                    style={{ backgroundColor: 'var(--color-bg-surface2)' }}
                                >
                                    <div
                                        style={{ height: `${height}%`, backgroundColor: 'var(--color-accent)' }}
                                        className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                                    ></div>
                                    {/* Tooltip */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded -mt-12 backdrop-blur-md">
                                            {height > 0 ? `${Math.round(height/10)} ${t('Events')}` : t('No Activity')}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-1">
                    <ActivityFeed activities={filteredActivities} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
