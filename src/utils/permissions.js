import { isAccountActive } from './auth';

export const PERMISSIONS = {
  VIEW_UNASSIGNED_RECORDS: 'VIEW_UNASSIGNED_RECORDS',
};

/**
 * User ki particular permission undo ledo check chestundi.
 */
export function hasPermission(user, permission) {
  if (!user || !permission) {
    return false;
  }

  return Boolean(
    Array.isArray(user.permissions) &&
      user.permissions.includes(permission)
  );
}

/**
 * Property owner contact (contactName/contactPhone) ni only admin, manager
 * and employee roles choodagalaru. Regular users (sellers, buyers,
 * mediators) and the public hide unnaru.
 */
export function canViewPropertyContact(user) {
  return Boolean(user && ['admin', 'manager', 'employee'].includes(user.role));
}

/**
 * Employee/Admin protected operations mundu ee function call chestaru.
 *
 * Admin:
 * - Specific employee permissions avasaram ledu.
 * - All operations access cheyyagaladu.
 *
 * Employee:
 * - Active/approved account undali.
 * - Required permission undali.
 *
 * Seller/Buyer/Mediator:
 * - Employee operations access cheyyaleru.
 */
export function requirePermission(user, permission) {
  if (!user || !isAccountActive(user)) {
    throw new Error(
      'permission.error.notAuthenticated'
    );
  }

  /*
   * Admin ki all permissions automatically available.
   */
  if (user.role === 'admin') {
    return true;
  }

  /*
   * Employee workflow ni employee/admin matrame access cheyyali.
   */
  if (user.role !== 'employee' && user.role !== 'manager') {
    throw new Error(
      'permission.error.wrongRole'
    );
  }

  /*
   * Permission argument provide chesinappudu,
   * employee/manager ki aa permission compulsory.
   */
  if (
    permission &&
    !hasPermission(user, permission)
  ) {
    throw new Error(
      'permission.error.missingPermission'
    );
  }

  return true;
}