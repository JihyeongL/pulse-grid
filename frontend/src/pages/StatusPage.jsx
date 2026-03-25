import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';

export default function StatusPage() {
    const { username } = useParams();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStatus();
    }, [username]);

    const fetchStatus = async () => {
        try {
            // NOTE: Using naked axios because this is public and shouldn't append JWT token
            const res = await axios.get(`/api/status/${username}`);
            setServers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch public status. User might not exist.');
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case 'UP': return 'text-green-600';
            case 'DOWN': return 'text-red-600';
            case 'WARNING': return 'text-yellow-600';
            default: return 'text-gray-500';
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading status...</div>;
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <Activity className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900">{username}'s System Status</h1>
                </div>

                {servers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No visible servers returning public status.
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                        <ul className="divide-y divide-gray-200">
                            {servers.map((server, idx) => (
                                <li key={idx} className="p-6 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">{server.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Last checked: {server.lastCheckTime ? new Date(server.lastCheckTime).toLocaleString() : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex items-center">
                                        <div className="flex items-center">
                                            <span className={`h-3 w-3 rounded-full mr-2 ${server.status === 'UP' ? 'bg-green-500' : server.status === 'DOWN' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                            <span className={`font-semibold ${statusColor(server.status)}`}>
                                                {server.status || 'UNKNOWN'}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
