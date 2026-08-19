import apiClient from './apiClient';

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

async function getForm(formType) {
  const response = await apiClient.get(`/registration-forms/${formType}`);
  return unwrap(response);
}

async function listForms() {
  const response = await apiClient.get('/admin/registration-forms');
  return unwrap(response);
}

async function updateFormMeta(formType, patch) {
  const response = await apiClient.patch(`/admin/registration-forms/${formType}`, patch);
  return unwrap(response);
}

async function createField(formType, payload) {
  const response = await apiClient.post(`/admin/registration-forms/${formType}/fields`, payload);
  return unwrap(response);
}

async function updateField(formType, fieldId, payload) {
  const response = await apiClient.patch(`/admin/registration-forms/${formType}/fields/${fieldId}`, payload);
  return unwrap(response);
}

async function deleteField(formType, fieldId) {
  const response = await apiClient.delete(`/admin/registration-forms/${formType}/fields/${fieldId}`);
  return unwrap(response);
}

async function reorderFields(formType, order) {
  const response = await apiClient.patch(`/admin/registration-forms/${formType}/fields/reorder`, { order });
  return unwrap(response);
}

export const registrationFormService = {
  getForm,
  listForms,
  updateFormMeta,
  createField,
  updateField,
  deleteField,
  reorderFields,
};
