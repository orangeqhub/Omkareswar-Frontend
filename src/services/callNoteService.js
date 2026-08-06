import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

async function getForEnquiry(enquiryId) {
  const response = await apiClient.get(`/enquiries/${enquiryId}/call-notes`);
  return unwrapList(response);
}

async function addCallNote(_viewer, data) {
  const { enquiryId, ...body } = data;
  const response = await apiClient.post(`/enquiries/${enquiryId}/call-notes`, body);
  return unwrap(response);
}

export const callNoteService = {
  getForEnquiry,
  addCallNote,
};
