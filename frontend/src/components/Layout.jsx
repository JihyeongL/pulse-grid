import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
