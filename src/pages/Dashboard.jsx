import React, { useEffect, useState } from 'react';
import { Package, Smartphone, AlertOctagon, TrendingUp } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import { getDashboardStats, getRecentActivity } from '../mock/mockBackend';
import Loader from '../components/Loader';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity()
                ]);
                setStats(statsData);
                setActivities(activityData);
            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <AdminLayout title="Overview"><Loader text="Loading Dashboard..." /></AdminLayout>;

    return (
        <AdminLayout title="Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Package}
                    label="Total Deliveries"
                    value={stats.todaysDeliveries}
                    trend={12}
                    color="blue"
                />
                <StatCard
                    icon={Smartphone}
                    label="Revenue"
                    value={`$${stats.revenue}`}
                    trend={8}
                    color="green"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Efficiency"
                    value={`${stats.weeklyEfficiency}%`}
                    trend={-2}
                    color="purple"
                />
                <StatCard
                    icon={AlertOctagon}
                    label="Issues"
                    value={stats.activeIssues}
                    trend={0}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Occupancy Trends</h3>
                        <select className="text-sm border-gray-200 rounded-lg text-gray-500 bg-gray-50 p-2 outline-none">
                            <option>This Week</option>
                            <option>Last Week</option>
                        </select>
                    </div>

                    {/* Mock Chart Visualization */}
                    <div className="h-64 flex items-end justify-between px-2 gap-2">
                        {[40, 65, 30, 85, 55, 90, 45].map((height, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="relative w-full bg-blue-50 rounded-t-lg overflow-hidden h-full">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-1">
                    <ActivityFeed activities={activities} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
