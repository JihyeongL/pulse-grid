import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ServerIcon, PlusCircle, LogOut, ShieldAlert, Settings, Sun, Moon } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleDark = () => setIsDark(!isDark);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Servers', path: '/servers', icon: ServerIcon },
        { name: 'Add Server', path: '/servers/new', icon: PlusCircle },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    if (role === 'ROLE_ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
    }

    return (
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col shadow-sm transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <ServerIcon className="w-6 h-6" />
                    PulseGrid
                </h1>
            </div>

            <div className="flex-1 py-4">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                    onClick={toggleDark}
                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    {isDark ? (
                        <>
                            <Sun className="w-5 h-5 mr-3 text-amber-500" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon className="w-5 h-5 mr-3 text-gray-500" />
                            Dark Mode
                        </>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-500 transition-colors group"
                >
                    <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-500" />
                    Logout
                </button>
            </div>
        </div>
    );
}
