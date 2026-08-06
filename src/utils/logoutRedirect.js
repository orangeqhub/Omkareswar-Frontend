/**
 * Where logout should land depending on which portal the session belonged
 * to — Admin and Employee return to their own portal's login page, everyone
 * else (Buyer/Seller/Mediator, or no session at all) returns to the public
 * /login page. Shared by the public Navbar and the DashboardLayout header
 * so both logout buttons behave identically.
 */
export function getLogoutRedirectPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'employee') return '/employee';
  return '/login';
}
