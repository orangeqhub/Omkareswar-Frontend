import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isAccountActive } from '../../utils/auth';
import DashboardLayout from '../layout/DashboardLayout';

export default function PortalAreaGate({
  role,
  dashboardPath,
  LoginComponent,
}) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialised = useAuthStore(
    (state) => state.initialised
  );

  const location = useLocation();

  if (loading || !initialised) {
    return null;
  }

  /*
   * Login session lekapothe relevant portal login page.
   */
  if (!user) {
    return <LoginComponent />;
  }

  /*
   * Admin session tho employee URL open chesina,
   * unauthorized page kakunda employee login page show chestundi.
   *
   * Employee login success ayyaka previous tokens replace avutayi.
   */
  if (user.role !== role) {
    return <LoginComponent />;
  }

  /*
   * Backend seed lo Admin/Employee status `active`.
   * Approved users status `approved` kuda accept chestam.
   */
  if (!isAccountActive(user)) {
    return <LoginComponent />;
  }

  /*
   * /employee open chesthe /employee/dashboard ki redirect.
   * /admin open chesthe /admin/dashboard ki redirect.
   */
  if (location.pathname === `/${role}`) {
    return (
      <Navigate
        to={dashboardPath}
        replace
      />
    );
  }

  return <DashboardLayout role={role} />;
}