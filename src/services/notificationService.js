import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.items)) {
    return data.items;
  }
  return [];
}

async function getForUser() {
  const response = await apiClient.get('/notifications/me');
  return unwrapList(response);
}

function create(data) {
  // Notifications are created server-side dynamically.
  // We return a mock structure here just in case any client-side caller expects a return.
  return {
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...data,
  };
}

async function markRead(id) {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return unwrap(response);
}

export const notificationService = { getForUser, create, markRead };
