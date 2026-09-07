import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

let cmsPromise = null;

async function getCms() {
  if (!cmsPromise) {
    cmsPromise = apiClient.get('/cms').then(unwrap).catch((err) => {
      cmsPromise = null;
      throw err;
    });
  }
  return cmsPromise;
}

function invalidateCms() {
  cmsPromise = null;
}

async function updateCms(patch) {
  const response = await apiClient.patch('/admin/cms', patch);
  const data = unwrap(response);
  cmsPromise = Promise.resolve(data);
  return data;
}

export const cmsService = { getCms, updateCms, invalidateCms };
