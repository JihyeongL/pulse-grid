import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AddServerPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        monitorType: 'PING',
        ipAddress: '',
        port: '',
        healthCheckUrl: '',
        checkIntervalMinutes: 5,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/me');
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user profile', err);
            }
        };
        fetchUser();
    }, []);

    const isLimitReached = user && user.serverCount >= user.maxServerLimit;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            let nextState = {
                ...prev,
                [name]: name === 'port' || name === 'checkIntervalMinutes' ? parseInt(value) || value : value
            };

            // Auto port population logic
            if (name === 'monitorType') {
                if (value === 'PING') nextState.port = '';
                else if (value === 'HTTP') nextState.port = 80;
                else if (value === 'SSH') nextState.port = 22;
                else if (value === 'REDFISH') nextState.port = 443;
            }
            // Smart auto-HTTPS routing if they check Http mode
            if (name === 'healthCheckUrl' && prev.monitorType === 'HTTP') {
                if (value.startsWith('https://')) {
                    nextState.port = 443;
                } else if (value.startsWith('http://') && nextState.port === 443) {
                    nextState.port = 80;
                }
            }
            return nextState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/servers', formData);
            navigate('/servers');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add server. Ensure you have not reached the limits.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Add New Server</h1>

            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-100 dark:border-gray-700 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {isLimitReached && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700 font-medium">
                                        Server limit reached ({user.serverCount} / {user.maxServerLimit}).
                                        Please remove an existing server before adding a new one.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Production DB"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monitor Type</label>
                            <div className="mt-1">
                                <select
                                    name="monitorType"
                                    value={formData.monitorType}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="PING">PING</option>
                                    <option value="HTTP">HTTP</option>
                                    <option value="SSH">SSH</option>
                                    <option value="REDFISH">REDFISH</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check Interval (Minutes)</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="checkIntervalMinutes"
                                    min="5"
                                    required
                                    value={formData.checkIntervalMinutes}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {formData.monitorType === 'HTTP' ? (
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Health Check URL</label>
                                <div className="mt-1">
                                    <input
                                        type="url"
                                        name="healthCheckUrl"
                                        required
                                        value={formData.healthCheckUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/health"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className={formData.monitorType === 'HTTP' ? "hidden" : "sm:col-span-1"}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IP Address / Hostname</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="ipAddress"
                                    required={formData.monitorType !== 'HTTP'}
                                    value={formData.ipAddress}
                                    onChange={handleChange}
                                    placeholder="192.168.1.1"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div className={formData.monitorType === 'HTTP' ? "hidden" : "sm:col-span-1"}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Port {formData.monitorType === 'PING' && <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional for ICMP)</span>}</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    name="port"
                                    required={formData.monitorType !== 'HTTP' && formData.monitorType !== 'PING'}
                                    value={formData.port}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 border outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/servers')}
                            className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isLimitReached}
                            className="inline-flex justify-center flex-shrink-0 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Server'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
