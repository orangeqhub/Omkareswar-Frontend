import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

async function getCms() {
  const response = await apiClient.get('/cms');
  return unwrap(response);
}

async function updateCms(patch) {
  const response = await apiClient.patch('/admin/cms', patch);
  return unwrap(response);
}

export const cmsService = { getCms, updateCms };
