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

async function getForRecord(_viewer, recordType, recordId) {
  const response = await apiClient.get('/internal-notes', {
    params: { recordType, recordId },
  });
  return unwrapList(response);
}

async function addNote(_viewer, { recordType, recordId, text, visibility = 'employee_admin' }) {
  const response = await apiClient.post('/internal-notes', {
    recordType,
    recordId,
    text,
    visibility,
  });
  return unwrap(response);
}

async function updateNote(_viewer, noteId, text) {
  const response = await apiClient.patch(`/internal-notes/${noteId}`, {
    text,
  });
  return unwrap(response);
}

async function deleteNote(_viewer, noteId) {
  const response = await apiClient.delete(`/internal-notes/${noteId}`);
  return unwrap(response);
}

export const internalNoteService = {
  getForRecord,
  addNote,
  updateNote,
  deleteNote,
};
