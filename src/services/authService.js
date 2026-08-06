import apiClient, {
  getAccessToken,
  removeTokens,
  saveTokens,
} from './apiClient';

function getResponseData(response) {
  return response.data?.data ?? response.data;
}

async function requestOtp(mobile) {
  const response = await apiClient.post('/auth/otp/request', {
    mobile,
  });
  return getResponseData(response);
}

async function loginPublicWithOtp(
  mobile,
  otp,
  remember = true
) {
  const response = await apiClient.post('/auth/otp/verify', {
    mobile,
    otp,
  });

  const data = getResponseData(response);

  saveTokens(
    {
      token: data.token,
      refreshToken: data.refreshToken,
    },
    remember
  );

  return data.user;
}

async function loginAdmin(
  loginId,
  password,
  remember = true
) {
  const response = await apiClient.post('/auth/admin/login', {
    loginId,
    password,
  });

  const data = getResponseData(response);

  saveTokens(
    {
      token: data.token,
      refreshToken: data.refreshToken,
    },
    remember
  );

  return data.user;
}

async function loginEmployee(
  employeeId,
  password,
  remember = true
) {
  const response = await apiClient.post(
    '/auth/employee/login',
    {
      employeeId,
      password,
    }
  );

  const data = getResponseData(response);

  saveTokens(
    {
      token: data.token,
      refreshToken: data.refreshToken,
    },
    remember
  );

  return data.user;
}

async function getSession() {
  if (!getAccessToken()) {
    return null;
  }

  try {
    const response = await apiClient.get('/auth/me');
    const data = getResponseData(response);
    return data?.user || null;
  } catch (err) {
    // If the server doesn't respond or token is invalid, clear session
    removeTokens();
    return null;
  }
}

async function logout() {
  try {
    if (getAccessToken()) {
      await apiClient.post('/auth/logout');
    }
  } catch (error) {
    console.warn('Server logout failed:', error.message);
  } finally {
    removeTokens();
  }

  return true;
}

async function resetEmployeePassword(employeeIdOrMobile, newPassword) {
  const response = await apiClient.post('/auth/employee/reset-password', {
    employeeId: employeeIdOrMobile,
    newPassword,
  });
  return getResponseData(response);
}

async function resetAdminPassword(adminIdOrMobile, newPassword) {
  const response = await apiClient.post('/auth/admin/reset-password', {
    adminId: adminIdOrMobile,
    newPassword,
  });
  return getResponseData(response);
}

export const authService = {
  requestOtp,
  loginPublicWithOtp,
  loginAdmin,
  loginEmployee,
  resetEmployeePassword,
  resetAdminPassword,
  getSession,
  logout,
};