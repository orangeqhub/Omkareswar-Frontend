/**
 * Single source of truth for "Post Property" access rules, shared by the
 * Navbar SELL button and the Hero CTA so the two entry points can never
 * diverge. Any approved Buyer/Seller/Mediator may reach the property-type
 * selection screen; every other case gets routed somewhere explanatory
 * instead of a silent redirect.
 */

import { isAccountActive } from './auth';
const POST_PROPERTY_ROLES = ['buyer', 'seller', 'mediator'];

export function resolvePostPropertyAction(user) {
  if (!user) {
    return { type: 'route', to: '/login', messageKey: 'nav.postPropertyLoginRequired', toastType: 'info' };
  }
  if (!isAccountActive(user)) {
    return { type: 'route', to: '/application-status', messageKey: 'nav.postPropertyPendingApproval', toastType: 'info' };
  }
  if (POST_PROPERTY_ROLES.includes(user.role)) {
    return { type: 'route', to: '/post-property' };
  }
  return { type: 'blocked', messageKey: 'nav.postPropertyBlocked', toastType: 'error' };
}