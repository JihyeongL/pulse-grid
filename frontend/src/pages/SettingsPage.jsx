import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertTriangle, UserX, KeyRound, Globe, CreditCard, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Preferences State
    const [currentTimezone, setCurrentTimezone] = useState('');
    const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
    const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [preferencesLoading, setPreferencesLoading] = useState(false);

    // Subscription State
    const [currentPlan, setCurrentPlan] = useState('FREE');
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [timezones] = useState(() => {
        try {
            return Intl.supportedValuesOf('timeZone');
        } catch (e) {
            return ['Asia/Seoul', 'UTC', 'America/New_York']; // Ultimate fallback
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            if (res.data) {
                if (res.data.timezone) {
                    setCurrentTimezone(res.data.timezone);
                    localStorage.setItem('timezone', res.data.timezone);
                }
                if (res.data.emailAlertsEnabled !== undefined) setEmailAlertsEnabled(res.data.emailAlertsEnabled);
                if (res.data.slackWebhookUrl) setSlackWebhookUrl(res.data.slackWebhookUrl);
                if (res.data.discordWebhookUrl) setDiscordWebhookUrl(res.data.discordWebhookUrl);
                if (res.data.telegramChatId) setTelegramChatId(res.data.telegramChatId);
                if (res.data.plan) setCurrentPlan(res.data.plan);
            }
        } catch (err) {
            console.error('Failed to load user profile', err);
        }
    };

    const savePreferences = async (updates) => {
        setPreferencesLoading(true);
        try {
            await api.put('/users/me/preferences', updates);
            if (updates.timezone) {
                localStorage.setItem('timezone', updates.timezone);
                setCurrentTimezone(updates.timezone);
            }
            if (updates.emailAlertsEnabled !== undefined) setEmailAlertsEnabled(updates.emailAlertsEnabled);
            if (updates.slackWebhookUrl !== undefined) setSlackWebhookUrl(updates.slackWebhookUrl);
            if (updates.discordWebhookUrl !== undefined) setDiscordWebhookUrl(updates.discordWebhookUrl);
            if (updates.telegramChatId !== undefined) setTelegramChatId(updates.telegramChatId);
        } catch (err) {
            alert('Failed to save preferences.');
        } finally {
            setPreferencesLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "WARNING: This action cannot be undone!\n\nAre you absolutely sure you want to permanently delete your account and ALL your monitored servers?"
        );

        if (!confirmDelete) return;

        setLoading(true);
        try {
            await api.delete('/users/me');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        } catch (err) {
            alert('Failed to delete account. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setPasswordLoading(true);
        try {
            await api.put('/users/me/password', { oldPassword, newPassword });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setPaymentLoading(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            const res = await api.post('/payments/simulate-success');
            alert(res.data.message);
            setCurrentPlan(res.data.newPlan);
            // After upgrade, we should also refresh the profile if needed for other parts of the app
        } catch (err) {
            alert('Payment simulation failed.');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-2 mb-8">
                <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>

            {/* General Preferences Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        General Preferences
                    </h3>
                </div>
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-xl">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Display Timezone
                        </label>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            All server checks and timestamps will be displayed in this timezone.
                        </p>
                        <div className="flex items-center gap-3">
                            <select
                                value={currentTimezone}
                                onChange={(e) => savePreferences({ timezone: e.target.value })}
                                disabled={preferencesLoading}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                            >
                                {timezones.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                            {preferencesLoading && <span className="text-sm text-gray-500 dark:text-gray-400">Saving...</span>}
                        </div>
                    </div>
                </div>

                {/* Notifications Panel embedded within General Preferences for now */}
                <div className="px-6 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="max-w-xl">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Notification Settings</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Alerts</label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive an email when a server goes down.</p>
                                </div>
                                <button
                                    onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                                    disabled={preferencesLoading}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailAlertsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slack Webhook URL</label>
                                <input
                                    type="url"
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={slackWebhookUrl}
                                    onChange={e => setSlackWebhookUrl(e.target.value)}
                                    disabled={preferencesLoading}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discord Webhook URL</label>
                                <input
                                    type="url"
                                    placeholder="https://discord.com/api/webhooks/..."
                                    value={discordWebhookUrl}
                                    onChange={e => setDiscordWebhookUrl(e.target.value)}
                                    disabled={preferencesLoading}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telegram Chat ID</label>
                                <input
                                    type="text"
                                    placeholder="-1001234567890"
                                    value={telegramChatId}
                                    onChange={e => setTelegramChatId(e.target.value)}
                                    disabled={preferencesLoading}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="pt-3 flex justify-end">
                                <button
                                    onClick={() => savePreferences({ emailAlertsEnabled, slackWebhookUrl, discordWebhookUrl, telegramChatId })}
                                    disabled={preferencesLoading}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 transition-colors"
                                >
                                    {preferencesLoading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Change Password
                    </h3>
                </div>

                <div className="px-6 py-6">
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                        {passwordMessage.text && (
                            <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="pt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 transition-colors"
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Subscription & Billing Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Subscription & Billing
                    </h3>
                </div>
                <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan:</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${currentPlan === 'PRO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                    {currentPlan}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentPlan === 'FREE'
                                    ? 'Up to 3 servers. Upgrade for more capacity.'
                                    : 'You have PRO access. Up to 10 servers allowed.'}
                            </p>
                        </div>
                        {currentPlan === 'FREE' && (
                            <button
                                onClick={handleUpgrade}
                                disabled={paymentLoading}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                                {paymentLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Upgrade to PRO
                                    </>
                                )}
                            </button>
                        )}
                        {currentPlan === 'PRO' && (
                            <div className="flex items-center text-green-600 dark:text-green-400 font-medium text-sm">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Active
                            </div>
                        )}
                    </div>

                    {currentPlan === 'FREE' && (
                        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Why upgrade to PRO?</h4>
                            <ul className="text-xs text-indigo-800 dark:text-indigo-400 space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> Monitor up to 10 servers (instead of 3)
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> Priority health checking frequency
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> Advanced notification channels
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-red-100 dark:border-red-900/50">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10">
                    <h3 className="text-lg font-medium leading-6 text-red-800 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-red-600 dark:text-red-400/80">
                        Irreversible actions related to your account.
                    </p>
                </div>

                <div className="px-6 py-6">
                    <div className="w-full">
                        <div className="max-w-xl">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white">Delete Account</h4>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Permanently delete your personal account and all of your server monitoring data.
                            </p>
                            <div className="mt-1 flex justify-end">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-50 transition-colors"
                                >
                                    <UserX className="w-4 h-4 mr-2" />
                                    {loading ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
