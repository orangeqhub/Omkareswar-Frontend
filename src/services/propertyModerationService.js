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

async function getAssignedProperties(_viewer) {
  const response = await apiClient.get('/employee/property-moderation');
  return unwrapList(response);
}

async function getById(_viewer, propertyId) {
  const response = await apiClient.get(`/employee/property-moderation/${propertyId}`);
  return unwrap(response);
}

async function startReview(_viewer, propertyId) {
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/start`);
  return unwrap(response);
}

async function addModerationNote(_viewer, propertyId, note) {
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/add-note`, {
    note,
  });
  return unwrap(response);
}

async function requestChanges(_viewer, propertyId, { reason, fields, slots }) {
  if (!reason || !reason.trim()) throw new Error('moderation.error.reasonRequired');
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/request-changes`, {
    reason,
    fields,
    slots,
  });
  return unwrap(response);
}

async function recommendApproval(_viewer, propertyId, note) {
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/recommend-approval`, {
    note,
  });
  return unwrap(response);
}

async function recommendRejection(_viewer, propertyId, reason) {
  if (!reason || !reason.trim()) throw new Error('moderation.error.reasonRequired');
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/recommend-rejection`, {
    reason,
  });
  return unwrap(response);
}

async function markComplete(_viewer, propertyId) {
  const response = await apiClient.post(`/employee/property-moderation/${propertyId}/complete`);
  return unwrap(response);
}

export const propertyModerationService = {
  getAssignedProperties,
  getById,
  startReview,
  addModerationNote,
  requestChanges,
  recommendApproval,
  recommendRejection,
  markComplete,
};
