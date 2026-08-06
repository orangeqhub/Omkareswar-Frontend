import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAccountActive } from '../../utils/auth';

export default function ProtectedRoute({
  roles,
  children,
}) {
  const {
    user,
    loading,
    initialised,
  } = useAuthStore();

  const location = useLocation();

  if (loading || !initialised) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
        }}
        replace
      />
    );
  }

  if (!isAccountActive(user)) {
    return (
      <Navigate
        to="/application-status"
        replace
      />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}