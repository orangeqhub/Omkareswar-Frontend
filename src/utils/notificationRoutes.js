export function resolveNotificationRoute(user, notification) {
  if (!user || !notification) return null;
  const relatedType = notification.relatedType || (notification.type && notification.type.split('.'))[0];
  const id = notification.relatedId;

  if (relatedType === 'property' && id) return `/properties/${id}`;

  const role = user.role;
  const baseMap = {
    admin: '/admin',
    buyer: '/buyer',
    seller: '/seller',
    mediator: '/mediator',
    employee: '/employee',
  };
  const base = baseMap[role];
  if (!base) return null;

  switch (relatedType) {
    case 'enquiry':
      if (role === 'seller') return '/seller/enquiries';
      if (role === 'buyer') return '/buyer/interests';
      if (role === 'mediator') return '/mediator/leads';
      if (role === 'admin' || role === 'employee') return `${base}/enquiries`;
      return null;
    case 'visit':
      if (role === 'seller') return '/seller/visits';
      if (role === 'admin' || role === 'employee' || role === 'buyer' || role === 'mediator') return `${base}/visits`;
      return null;
    case 'followup':
      if (role === 'admin' || role === 'employee' || role === 'mediator') return `${base}/follow-ups`;
      return null;
    case 'registration':
    case 'userVerification':
      return role === 'admin' ? '/admin/registrations' : role === 'employee' ? '/employee/verifications' : null;
    case 'user':
      return role === 'admin' ? '/admin/users' : role === 'employee' ? '/employee/verifications' : null;
    case 'assignment':
      return role === 'admin' ? '/admin/assignments' : role === 'employee' ? '/employee/dashboard' : null;
    default:
      return null;
  }
}