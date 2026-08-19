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

function normaliseChannel(channel) {
  const allowedChannels = ['whatsapp', 'call', 'contact', 'interest', 'email'];
  return allowedChannels.includes(channel) ? channel : 'contact';
}

function buildMessage(data) {
  const details = [
    data.enquiryType ? `Enquiry type: ${data.enquiryType}` : null,
    data.preferredLocation ? `Preferred location: ${data.preferredLocation}` : null,
    data.propertyCategory ? `Property category: ${data.propertyCategory}` : null,
    data.budgetRange ? `Budget range: ${data.budgetRange}` : null,
    data.buyerEmail || data.email ? `Email: ${data.buyerEmail || data.email}` : null,
    data.message || null,
  ].filter(Boolean);

  return details.join('\n');
}

async function create(data) {
  const response = await apiClient.post('/enquiries', {
    propertyId: data.propertyId || null,
    sellerId: data.sellerId || null,
    buyerId: data.buyerId || null,
    buyerName: data.buyerName || data.fullName || data.name,
    buyerPhone: data.buyerPhone || data.mobile || data.phone,
    message: buildMessage(data),
    channel: normaliseChannel(data.channel || data.contactMethod || 'contact'),
  });

  return unwrap(response);
}

async function getAllEnquiries() {
  const response = await apiClient.get('/admin/enquiries', {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
  return unwrapList(response);
}

async function getForSeller(sellerId) {
  const response = await apiClient.get(`/sellers/${sellerId}/enquiries`, {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
  return unwrapList(response);
}

async function getForBuyer(phone) {
  const response = await apiClient.get('/buyers/enquiries', {
    params: {
      phone,
      page: 1,
      pageSize: 100,
    },
  });
  return unwrapList(response);
}

async function getAssignedEnquiries() {
  const response = await apiClient.get('/employee/enquiries', {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
  return unwrapList(response);
}

async function getById(_viewer, id) {
  const response = await apiClient.get(`/enquiries/${id}`);
  return unwrap(response);
}

async function updateStatus(id, status) {
  const response = await apiClient.patch(`/enquiries/${id}/status`, { status });
  return unwrap(response);
}

async function updateContactStatus(_viewer, id, status) {
  return updateStatus(id, status);
}

async function setPriority(_viewer, id, priority) {
  const response = await apiClient.patch(`/enquiries/${id}/priority`, { priority });
  return unwrap(response);
}

async function setNextFollowUp(_viewer, id, nextFollowUpAt) {
  const response = await apiClient.patch(`/enquiries/${id}/next-follow-up`, { nextFollowUpAt });
  return unwrap(response);
}

async function markComplete(_viewer, id) {
  const response = await apiClient.patch(`/enquiries/${id}/complete`);
  return unwrap(response);
}

async function markStatus(id, status) {
  const response = await apiClient.patch(`/employee/enquiries/${id}/mark-status`, { status });
  return unwrap(response);
}

async function assignRecord(id, { assignedEmployeeId, assignedMediatorId } = {}) {
  let result = null;

  if (assignedEmployeeId !== undefined) {
    const response = await apiClient.patch(`/admin/enquiries/${id}/assign-employee`, {
      employeeId: assignedEmployeeId || null,
    });
    result = unwrap(response);
  }

  if (assignedMediatorId !== undefined) {
    const response = await apiClient.patch(`/admin/enquiries/${id}/assign-mediator`, {
      mediatorId: assignedMediatorId || null,
    });
    result = unwrap(response);
  }

  return result;
}

async function approveStatus(id) {
  const response = await apiClient.post(`/admin/enquiries/${id}/approve-status`);
  return unwrap(response);
}

async function rejectStatus(id) {
  const response = await apiClient.post(`/admin/enquiries/${id}/reject-status`);
  return unwrap(response);
}

export const enquiryService = {
  create,
  getAllEnquiries,
  getForSeller,
  getForBuyer,
  getAssignedEnquiries,
  getById,
  updateStatus,
  updateContactStatus,
  setPriority,
  setNextFollowUp,
  markComplete,
  markStatus,
  assignRecord,
  approveStatus,
  rejectStatus,
};