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

function log(action, details, actor) {
  // Audit logs are created automatically by the backend database service on any action.
  console.log(`[Audit Logged Client-Side]: ${action} - ${details} (by ${actor || 'system'})`);
  return { success: true };
}

async function getLogs() {
  const response = await apiClient.get('/admin/audit-logs');
  return unwrapList(response);
}

export const auditLogService = { log, getLogs };
