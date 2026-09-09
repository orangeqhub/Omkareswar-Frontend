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

async function createLead(payload) {
  const response = await apiClient.post('/landing-leads', payload);
  return unwrap(response);
}

async function getLeads({ page = 1, pageSize = 50 } = {}) {
  const response = await apiClient.get('/admin/landing-leads', { params: { page, pageSize } });
  return response?.data?.data ?? response?.data;
}

export const landingLeadService = { createLead, getLeads };