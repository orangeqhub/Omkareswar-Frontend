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

async function getForBuyer(_buyerId) {
  const response = await apiClient.get('/me/visits');
  return unwrapList(response);
}

async function getForSeller(_sellerId) {
  const response = await apiClient.get('/seller/visits');
  return unwrapList(response);
}

async function getAllVisits(viewer, _scopeMode) {
  let endpoint = '/admin/visits';
  if (viewer?.role === 'employee') {
    endpoint = '/employee/visits';
  } else if (viewer?.role === 'mediator') {
    endpoint = '/mediator/visits';
  }
  const response = await apiClient.get(endpoint);
  return unwrapList(response);
}

async function getAssignedVisits(viewer) {
  return getAllVisits(viewer);
}

async function schedule(data) {
  const response = await apiClient.post('/visits', data);
  return unwrap(response);
}

async function updateStatus(id, status) {
  let endpoint = `/visits/${id}/outcome`;
  const response = await apiClient.post(endpoint, { outcome: status });
  return unwrap(response);
}

async function confirmVisit(_viewer, id) {
  const response = await apiClient.post(`/visits/${id}/confirm`);
  return unwrap(response);
}

async function reschedule(_viewer, id, scheduledFor, note) {
  const response = await apiClient.patch(`/visits/${id}/reschedule`, {
    scheduledFor,
    note,
  });
  return unwrap(response);
}

async function markCompleted(_viewer, id) {
  const response = await apiClient.post(`/visits/${id}/complete`);
  return unwrap(response);
}

async function markCancelled(_viewer, id, note) {
  const response = await apiClient.post(`/visits/${id}/cancel`, { note });
  return unwrap(response);
}

async function markNoShow(_viewer, id, note) {
  const response = await apiClient.post(`/visits/${id}/no-show`, { note });
  return unwrap(response);
}

async function addVisitNote(_viewer, id, note) {
  const response = await apiClient.post(`/visits/${id}/add-note`, { note });
  return unwrap(response);
}

async function recordOutcome(_viewer, id, outcome) {
  const response = await apiClient.post(`/visits/${id}/outcome`, { outcome });
  return unwrap(response);
}

async function assignRecord(id, data = {}) {
  const response = await apiClient.patch(`/admin/visits/${id}/assign`, data);
  return unwrap(response);
}

async function approveVisit(id) {
  const response = await apiClient.post(`/admin/visits/${id}/approve`);
  return unwrap(response);
}

async function rejectVisit(id, note) {
  const response = await apiClient.post(`/admin/visits/${id}/reject`, { note });
  return unwrap(response);
}

export const visitService = {
  getForBuyer,
  getForSeller,
  getAllVisits,
  getAssignedVisits,
  schedule,
  updateStatus,
  confirmVisit,
  reschedule,
  markCompleted,
  markCancelled,
  markNoShow,
  addVisitNote,
  recordOutcome,
  assignRecord,
  approveVisit,
  rejectVisit,
};
