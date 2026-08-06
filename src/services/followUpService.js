import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export function isOverdue(followUp, now = new Date()) {
  if (followUp.status === 'completed' || followUp.status === 'cancelled') return false;
  const due = new Date(`${followUp.dueDate.slice(0, 10)}T${followUp.dueTime || '23:59'}:00`);
  return due < now;
}

async function getAssignedFollowUps(_viewer) {
  const response = await apiClient.get('/employee/follow-ups');
  return unwrapList(response);
}

async function getAllFollowUps() {
  const response = await apiClient.get('/admin/follow-ups');
  return unwrapList(response);
}

async function createFollowUp(_viewer, data) {
  const response = await apiClient.post('/follow-ups', data);
  return unwrap(response);
}

async function start(_viewer, id) {
  const response = await apiClient.post(`/follow-ups/${id}/start`);
  return unwrap(response);
}

async function reschedule(_viewer, id, dueDate, dueTime, note) {
  const response = await apiClient.patch(`/follow-ups/${id}/reschedule`, {
    dueDate,
    dueTime,
    note,
  });
  return unwrap(response);
}

async function complete(_viewer, id, completionNote) {
  const response = await apiClient.post(`/follow-ups/${id}/complete`, {
    completionNote,
  });
  return unwrap(response);
}

async function cancel(_viewer, id, note) {
  const response = await apiClient.post(`/follow-ups/${id}/cancel`, {
    note,
  });
  return unwrap(response);
}

async function addNote(_viewer, id, note) {
  const response = await apiClient.post(`/follow-ups/${id}/add-note`, {
    note,
  });
  return unwrap(response);
}

async function assign(_viewer, id, assignedEmployeeId, _assignedBy, extra = {}) {
  const response = await apiClient.patch(`/admin/follow-ups/${id}/assign`, {
    assignedEmployeeId,
    assignmentNote: extra.assignmentNote || null,
  });
  return unwrap(response);
}

export const followUpService = {
  getAssignedFollowUps,
  getAllFollowUps,
  createFollowUp,
  start,
  reschedule,
  complete,
  cancel,
  addNote,
  assign,
  isOverdue,
};
