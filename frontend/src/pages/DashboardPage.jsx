import { useState, useEffect } from 'react';
import { ServerIcon, ArrowUpCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
    const [servers, setServers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [serversRes, userRes] = await Promise.all([
                    api.get('/servers'),
                    api.get('/users/me')
                ]);
                setServers(serversRes.data);
                setUser(userRes.data);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    const totalServers = servers.length;
    // If status is UNKNOWN it's not up or down, we just classify it broadly.
    const upServers = servers.filter(s => s.status === 'UP').length;
    const downServers = servers.filter(s => s.status === 'DOWN').length;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">DashboardOverview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                        <ServerIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Servers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user ? `${user.serverCount} / ${user.maxServerLimit}` : totalServers}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                        <ArrowUpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Servers UP</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{upServers}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Servers DOWN</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{downServers}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
