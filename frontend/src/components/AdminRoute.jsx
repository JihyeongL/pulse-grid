import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
    const role = localStorage.getItem('role');

    if (role !== 'ROLE_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
}
