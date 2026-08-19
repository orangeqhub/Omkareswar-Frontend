import { registrationService } from './registrationService';
import { propertyService } from './propertyService';
import { enquiryService } from './enquiryService';
import { visitService } from './visitService';
import { followUpService } from './followUpService';
import { userService } from './userService';

/**
 * Single entry point admin pages use to assign/reassign any record type to
 * an employee. Each underlying service still performs its own write + audit
 * log entry (registrationService.assignEmployee, propertyService.assignRecord,
 * etc.) — this just gives admin UI one consistent API instead of importing
 * five different services and remembering five different method names, and
 * enforces that only an admin may call it. Also enforces that a target
 * employee must exist and be active ('approved') before any assignment is
 * written — an inactive employee can never be assigned or reassigned a
 * record, regardless of which admin screen the call comes from.
 */
async function assign(viewer, recordType, recordId, assignedEmployeeId, extra = {}) {
  if (!viewer || viewer.role !== 'admin') {
    return Promise.reject(new Error('permission.error.wrongRole'));
  }
  if (assignedEmployeeId) {
    const employee = await userService.getUserById(assignedEmployeeId);
    if (!employee || employee.role !== 'employee' || (employee.status !== 'active' && employee.status !== 'approved')) {
      return Promise.reject(new Error('assignment.error.inactiveEmployee'));
    }
  }
  switch (recordType) {
    case 'userVerification':
      return registrationService.assignEmployee(recordId, assignedEmployeeId, viewer.id);
    case 'user':
      return userService.assignEmployee(recordId, assignedEmployeeId, extra.reason);
    case 'property':
      return propertyService.assignRecord(recordId, { assignedEmployeeId, assignedBy: viewer.id });
    case 'enquiry':
      return enquiryService.assignRecord(recordId, { assignedEmployeeId, assignedBy: viewer.id });
    case 'visit':
      return visitService.assignRecord(recordId, {
        assignedEmployeeId,
        assignedBy: viewer.id,
        assignmentNote: extra.assignmentNote,
        assignmentDueAt: extra.assignmentDueAt,
      });
    case 'followUp':
      return followUpService.assign(viewer, recordId, assignedEmployeeId, viewer.id, extra);
    default:
      return Promise.reject(new Error('assignment.error.unknownType'));
  }
}

export const assignmentService = { assign };
