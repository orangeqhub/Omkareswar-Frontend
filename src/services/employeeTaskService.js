import { requirePermission } from '../utils/permissions';
import { EMPLOYEE_PERMISSIONS } from '../config/employeePermissions';
import { verificationService } from './verificationService';
import { propertyModerationService } from './propertyModerationService';
import { enquiryService } from './enquiryService';
import { visitService } from './visitService';
import { followUpService, isOverdue } from './followUpService';
import { notificationService } from './notificationService';

const TERMINAL_VERIFICATION = ['completed'];
const TERMINAL_MODERATION = ['completed'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Safely resolves a scoped list for a viewer who may not hold that
 * module's permission — the dashboard shows partial data rather than
 * throwing when an employee only has some of the permissions. */
async function safeList(promiseFn) {
  try {
    return await promiseFn();
  } catch {
    return [];
  }
}

/**
 * Aggregates the logged-in employee's own assigned work across every
 * module into the dashboard summary — every number here is derived from
 * already-scoped service calls, never from an unfiltered fetch.
 */
async function getDashboardSummary(viewer) {
  requirePermission(viewer, EMPLOYEE_PERMISSIONS.EMPLOYEE_DASHBOARD_VIEW);

  const [verifications, properties, enquiries, visits, followUps, notifications] = await Promise.all([
    safeList(() => verificationService.getAssignedVerifications(viewer)),
    safeList(() => propertyModerationService.getAssignedProperties(viewer)),
    safeList(() => enquiryService.getAssignedEnquiries(viewer)),
    safeList(() => visitService.getAssignedVisits(viewer)),
    safeList(() => followUpService.getAssignedFollowUps(viewer)),
    safeList(() => notificationService.getForUser({ role: viewer.role, userId: viewer.id })),
  ]);

  const now = new Date();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const totalAssigned = verifications.length + properties.length + enquiries.length + followUps.length;

  const pending =
    verifications.filter((v) => v.verificationStatus === 'pending_review').length +
    properties.filter((p) => p.moderationStatus === 'submitted').length;

  const inProgress =
    verifications.filter((v) => v.verificationStatus === 'in_review').length +
    properties.filter((p) => p.moderationStatus === 'in_review').length;

  const completed =
    verifications.filter((v) => TERMINAL_VERIFICATION.includes(v.verificationStatus)).length +
    properties.filter((p) => TERMINAL_MODERATION.includes(p.moderationStatus)).length +
    followUps.filter((f) => f.status === 'completed').length;

  const overdueVerifications = verifications.filter(
    (v) => v.dueDate && new Date(v.dueDate) < now && v.verificationStatus !== 'completed'
  );
  const overdueProperties = properties.filter(
    (p) => p.dueDate && new Date(p.dueDate) < now && p.moderationStatus !== 'completed'
  );
  const overdueFollowUps = followUps.filter((f) => isOverdue(f, now));
  const overdue = overdueVerifications.length + overdueProperties.length + overdueFollowUps.length;

  const todaysFollowUps = followUps.filter((f) => {
    const due = new Date(`${f.dueDate.slice(0, 10)}T${f.dueTime || '00:00'}:00`);
    return due >= todayStart && due <= todayEnd && f.status !== 'completed' && f.status !== 'cancelled';
  });

  const upcomingVisits = visits.filter((v) => new Date(v.scheduledFor) >= now && v.status !== 'cancelled' && v.status !== 'completed');

  // Some assignments (seeded properties, enquiries) never set `assignedAt`,
  // so fall back to `createdAt` for a meaningful "recent assignments" list.
  const recentAssignments = [...verifications, ...properties, ...enquiries, ...followUps, ...visits]
    .map((r) => ({ ...r, assignedAt: r.assignedAt || r.createdAt }))
    .filter((r) => r.assignedAt)
    .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
    .slice(0, 5);

  const upcomingFollowUps = followUps
    .filter((f) => !isOverdue(f, now) && f.status !== 'completed' && f.status !== 'cancelled')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentNotifications = notifications.slice(0, 5);

  return {
    counts: {
      totalAssigned,
      pending,
      inProgress,
      completed,
      overdue,
      assignedEnquiries: enquiries.length,
      todaysFollowUps: todaysFollowUps.length,
      upcomingVisits: upcomingVisits.length,
    },
    sections: {
      todaysTasks: todaysFollowUps,
      overdueTasks: [...overdueVerifications, ...overdueProperties, ...overdueFollowUps],
      recentAssignments,
      upcomingFollowUps,
      upcomingVisits: upcomingVisits.slice(0, 5),
      recentNotifications,
    },
    workCompletion: {
      total: totalAssigned,
      completed,
      rate: totalAssigned ? Math.round((completed / totalAssigned) * 100) : 0,
    },
  };
}

export const employeeTaskService = { getDashboardSummary };
