const ACTIVE_ACCOUNT_STATUSES = [
  'approved',
  'active',
];

export function isAccountActive(userOrStatus) {
  const status =
    typeof userOrStatus === 'string'
      ? userOrStatus
      : userOrStatus?.status;

  return ACTIVE_ACCOUNT_STATUSES.includes(status);
}

export function getRoleDashboardPath(role) {
  const dashboardPaths = {
    admin: '/admin/dashboard',
    employee: '/employee/dashboard',
    buyer: '/buyer/dashboard',
    seller: '/seller/dashboard',
    mediator: '/mediator/dashboard',
  };

  return dashboardPaths[role] || '/';
}