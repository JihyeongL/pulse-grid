import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServerListPage from './pages/ServerListPage';
import AddServerPage from './pages/AddServerPage';
import StatusPage from './pages/StatusPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/status/:username" element={<StatusPage />} />

        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/servers" element={<ServerListPage />} />
          <Route path="/servers/new" element={<AddServerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
