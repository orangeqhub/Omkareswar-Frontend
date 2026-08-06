import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

async function getSettings() {
  const response = await apiClient.get('/admin/settings');
  return unwrap(response);
}

async function updateSettings(patch) {
  const response = await apiClient.patch('/admin/settings', patch);
  return unwrap(response);
}

export const settingsService = { getSettings, updateSettings };
