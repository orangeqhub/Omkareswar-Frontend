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

async function getAssignedVerifications(_viewer) {
  const response = await apiClient.get('/employee/user-verification');
  return unwrapList(response);
}

async function getById(_viewer, userId) {
  const response = await apiClient.get(`/employee/user-verification/${userId}`);
  return unwrap(response);
}

async function startReview(_viewer, userId) {
  const response = await apiClient.post(`/employee/user-verification/${userId}/start-review`);
  return unwrap(response);
}

async function addCorrectionRequest(_viewer, userId, { reason, fields }) {
  if (!reason || !reason.trim()) throw new Error('verification.error.reasonRequired');
  const response = await apiClient.post(`/employee/user-verification/${userId}/correction-request`, {
    reason,
    fields,
  });
  return unwrap(response);
}

async function recommendApproval(_viewer, userId, note) {
  const response = await apiClient.post(`/employee/user-verification/${userId}/recommend-approval`, {
    note,
  });
  return unwrap(response);
}

async function recommendRejection(_viewer, userId, reason) {
  if (!reason || !reason.trim()) throw new Error('verification.error.reasonRequired');
  const response = await apiClient.post(`/employee/user-verification/${userId}/recommend-rejection`, {
    reason,
  });
  return unwrap(response);
}

async function markComplete(_viewer, userId) {
  const response = await apiClient.post(`/employee/user-verification/${userId}/complete`);
  return unwrap(response);
}

export const verificationService = {
  getAssignedVerifications,
  getById,
  startReview,
  addCorrectionRequest,
  recommendApproval,
  recommendRejection,
  markComplete,
};
