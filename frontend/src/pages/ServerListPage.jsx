import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Activity } from 'lucide-react';
import api from '../services/api';

export default function ServerListPage() {
    const [servers, setServers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userTimezone = localStorage.getItem('timezone') || 'Asia/Seoul';

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
                setError('Failed to fetch servers');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const statusColor = (status) => {
        switch (status) {
            case 'UP': return 'bg-green-100 text-green-800';
            case 'DOWN': return 'bg-red-100 text-red-800';
            case 'WARNING': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800'; // UNKNOWN
        }
    };

    if (loading) return <div className="text-center py-10">Loading servers...</div>;

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    Servers List
                    {user && (
                        <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
                            {user.serverCount} / {user.maxServerLimit}
                        </span>
                    )}
                </h1>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/servers/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                        Add Server
                    </Link>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-400 dark:border-red-500">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            ) : servers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg py-12 text-center text-gray-500 dark:text-gray-400">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No servers</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new server monitor.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Monitor Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Target
                                </th>
                                <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Checked
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {servers.map((server) => (
                                <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                        {server.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        {server.monitorType}
                                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">({server.checkIntervalMinutes}m)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        {server.monitorType === 'HTTP' ? server.healthCheckUrl : `${server.ipAddress}:${server.port}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(server.status)}`}>
                                            {server.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                        {server.nextCheckTime ? new Date(server.nextCheckTime).toLocaleString('ko-KR', { timeZone: userTimezone }) : 'Never'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
