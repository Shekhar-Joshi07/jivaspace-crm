import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!roles?.length) return children;
  if (!roles.includes(user?.role)) return <Navigate replace state={{ from: location }} to="/dashboard" />;
  return children;
}
