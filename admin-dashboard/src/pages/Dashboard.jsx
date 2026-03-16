import React, { useEffect, useState } from 'react';
import { Package, Smartphone, AlertOctagon, TrendingUp } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import { lockerApi } from '../api/locker.api';
import Loader from '../components/Loader';
import { SearchContext } from '../contexts/SearchContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTimezone } from '../contexts/TimezoneContext';

const Dashboard = () => {
    const { t, settings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);
    const [rawWeeklyActivities, setRawWeeklyActivities] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [weeklyActivities, setWeeklyActivities] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [timeframe, setTimeframe] = useState('This Week');
    const { searchQuery } = React.useContext(SearchContext);
    const { formatInTimezone } = useTimezone();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real activities - increase limit to 1000 to cover previous months
                const activityData = await lockerApi.getEvents(1000);
                
                // For stats, we can calculate some from the locker status
                const lockers = await lockerApi.getStatus();
                const occupiedCount = lockers.filter(l => !l.isFree).length;
                const totalCount = lockers.length;
                
                // --- Period Comparison Logic (Calendar Months) ---
                const now = new Date();
                
                // Start of Current Month
                const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                // Start of Last Month
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                
                // End of Last Month (just before start of current)
                const endOfLastMonth = new Date(startOfCurrentMonth.getTime() - 1);

                const currentMonthEvents = activityData.filter(a => {
                    const d = new Date(a.timestamp);
                    return d >= startOfCurrentMonth;
                });

                const lastMonthEvents = activityData.filter(a => {
                    const d = new Date(a.timestamp);
                    return d >= startOfLastMonth && d <= endOfLastMonth;
                });

                const calcTrend = (curr, prev) => {
                    if (prev === 0) return curr > 0 ? 100 : (curr === 0 ? 0 : -100);
                    return Math.round(((curr - prev) / prev) * 100);
                };

                const revenuePerPickup = settings.revenuePerPickup || 5.50;

                // Current Stats (This Calendar Month)
                const currDeliveries = currentMonthEvents.filter(a => a.type === 'DELIVERY').length;
                const currPickups = currentMonthEvents.filter(a => a.type === 'PICKUP').length;
                const currRevenue = currPickups * revenuePerPickup;
                const currEfficiency = totalCount > 0 ? Math.round(((totalCount - occupiedCount) / totalCount) * 100) : 100;
                const currIssues = currentMonthEvents.filter(a => a.type === 'SYSTEM_ALERT').length;

                // Last Period Stats (Previous Calendar Month)
                const lastDeliveries = lastMonthEvents.filter(a => a.type === 'DELIVERY').length;
                const lastPickups = lastMonthEvents.filter(a => a.type === 'PICKUP').length;
                const lastRevenue = lastPickups * revenuePerPickup;
                const lastIssues = lastMonthEvents.filter(a => a.type === 'SYSTEM_ALERT').length;

                // Estimate Last Month Efficiency
                const netChangeThisMonth = currDeliveries - currPickups;
                const occupiedCountStartOfMonth = Math.max(0, occupiedCount - netChangeThisMonth);
                const efficiencyStartOfMonth = totalCount > 0 ? Math.round(((totalCount - occupiedCountStartOfMonth) / totalCount) * 100) : 100;

                console.log('--- Dashboard Comparison Debug ---');
                console.log('Current Month (from):', startOfCurrentMonth.toISOString());
                console.log('Last Month (range):', startOfLastMonth.toISOString(), 'to', endOfLastMonth.toISOString());
                console.log('Events in CurMonth:', currentMonthEvents.length, '| Deliveries:', currDeliveries);
                console.log('Events in LastMonth:', lastMonthEvents.length, '| Deliveries:', lastDeliveries);
                console.log('---------------------------------');

                setStats({
                    todaysDeliveries: currDeliveries,
                    revenue: currRevenue,
                    weeklyEfficiency: currEfficiency,
                    activeIssues: currIssues,
                    trends: {
                        deliveries: calcTrend(currDeliveries, lastDeliveries),
                        revenue: calcTrend(currRevenue, lastRevenue),
                        efficiency: calcTrend(currEfficiency, efficiencyStartOfMonth), 
                        issues: calcTrend(currIssues, lastIssues)
                    }
                });

                setActivities(activityData.map(item => ({
                    id: item._id,
                    type: item.type,
                    description: item.description,
                    timestamp: item.timestamp
                })));

                // Calculate Weekly Activities for Graph (Calendar Weeks)
                const counts = Array(7).fill(0);
                
                // Get Sunday of current week
                const currentSun = new Date(now);
                currentSun.setDate(now.getDate() - now.getDay());
                currentSun.setHours(0, 0, 0, 0);

                // Get Sunday of last week
                const lastSun = new Date(currentSun);
                lastSun.setDate(currentSun.getDate() - 7);
                
                // Get Saturday of last week
                const lastSat = new Date(lastSun);
                lastSat.setDate(lastSun.getDate() + 6);
                lastSat.setHours(23, 59, 59, 999);

                activityData.forEach(event => {
                    const eventDate = new Date(event.timestamp);
                    
                    if (timeframe === 'This Week') {
                        // From Sunday till now
                        if (eventDate >= currentSun && eventDate <= now) {
                            counts[eventDate.getDay()] += 1;
                        }
                    } else {
                        // Last Week (Sun to Sat)
                        if (eventDate >= lastSun && eventDate <= lastSat) {
                            counts[eventDate.getDay()] += 1;
                        }
                    }
                });
                
                setRawWeeklyActivities(counts);
                const maxActivity = Math.max(...counts, 5); 
                setWeeklyActivities(counts.map(count => (count / maxActivity) * 100));

                // Debug logs
                console.log('--- Dashboard Data Debug ---');
                console.log('Total Events fetched:', activityData.length);
                console.log('Timeframe:', timeframe);
                console.log('Range Sun:', (timeframe === 'This Week' ? currentSun : lastSun).toISOString());
                console.log('Range End:', (timeframe === 'This Week' ? now : lastSat).toISOString());
                console.log('Counts:', counts);
                console.log('---------------------------');

            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                if (loading) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10 seconds for real-time feel
        return () => clearInterval(interval);
    }, [settings.revenuePerPickup, timeframe]);

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
                    inverseTrend={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('Occupancy Trends')}</h3>
                        <select 
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 outline-none cursor-pointer"
                        >
                            <option value="This Week">{t('This Week')}</option>
                            <option value="Last Week">{t('Last Week')}</option>
                        </select>
                    </div>

                    {/* Real-time Activity Visualization */}
                    <div className="h-64 flex items-end justify-between px-2 gap-2">
                        {weeklyActivities.map((height, i) => (
                            <div key={i} className="w-full h-full flex flex-col items-center gap-2 group cursor-pointer">
                                <div
                                    className="relative w-full flex-1 rounded-t-lg overflow-hidden"
                                    style={{ backgroundColor: 'var(--color-bg-surface2)' }}
                                >
                                    <div
                                        style={{ height: `${height}%`, backgroundColor: 'var(--color-accent)' }}
                                        className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                                    ></div>
                                    {/* Tooltip */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded -mt-12 backdrop-blur-md">
                                            {rawWeeklyActivities[i] > 0 ? `${rawWeeklyActivities[i]} ${t('Events')}` : t('No Activity')}
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
