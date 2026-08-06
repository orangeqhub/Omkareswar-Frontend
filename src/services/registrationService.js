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

async function register(role, data) {
  const response = await apiClient.post('/registrations', {
    role,
    ...data,
  });
  return unwrap(response);
}

async function getApplicationStatus(mobile) {
  const response = await apiClient.get('/registrations/status', {
    params: { mobile },
  });
  return unwrap(response);
}

async function listPending() {
  const response = await apiClient.get('/admin/registrations');
  return unwrapList(response);
}

async function assignEmployee(userId, employeeId, _assignedBy) {
  const response = await apiClient.patch(`/admin/registrations/${userId}/assign`, {
    employeeId,
  });
  return unwrap(response);
}

async function approve(userId) {
  const response = await apiClient.patch(`/admin/registrations/${userId}/approve`);
  return unwrap(response);
}

async function reject(userId, reason) {
  const response = await apiClient.patch(`/admin/registrations/${userId}/reject`, {
    reason,
  });
  return unwrap(response);
}

export const registrationService = {
  register,
  getApplicationStatus,
  listPending,
  approve,
  reject,
  assignEmployee,
};
