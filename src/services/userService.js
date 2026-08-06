import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

async function getUsers(filters = {}) {
  const response = await apiClient.get('/users', {
    params: {
      page: 1,
      pageSize: 100,
      ...filters,
    },
  });
  const data = unwrap(response);
  return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
}

async function getUserById(id) {
  const response = await apiClient.get(`/users/${id}`);
  return unwrap(response);
}

async function updateUser(id, patch) {
  const response = await apiClient.patch(`/users/${id}`, patch);
  return unwrap(response);
}

async function setStatus(id, status) {
  const response = await apiClient.patch(`/users/${id}/status`, { status });
  return unwrap(response);
}

async function createEmployee(_adminViewer, data) {
  const response = await apiClient.post('/admin/employees', data);
  return unwrap(response);
}

async function updatePermissions(_adminViewer, employeeId, permissions) {
  const response = await apiClient.put(`/admin/employees/${employeeId}/permissions`, {
    permissions,
  });
  return unwrap(response);
}

async function setEmployeeStatus(_adminViewer, employeeId, status) {
  const response = await apiClient.patch(`/admin/employees/${employeeId}/status`, {
    status,
  });
  return unwrap(response);
}

async function assignMediator(userId, mediatorId) {
  const response = await apiClient.patch(`/admin/users/${userId}/assign-mediator`, {
    mediatorId,
  });
  return unwrap(response);
}

export const userService = {
  getUsers,
  getUserById,
  updateUser,
  setStatus,
  createEmployee,
  updatePermissions,
  setEmployeeStatus,
  assignMediator,
};