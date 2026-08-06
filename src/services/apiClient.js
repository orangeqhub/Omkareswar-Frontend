import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ACCESS_TOKEN_KEY = 'omkar_access_token';
const REFRESH_TOKEN_KEY = 'omkar_refresh_token';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

function getStoredValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

export function getAccessToken() {
  return getStoredValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getStoredValue(REFRESH_TOKEN_KEY);
}

export function removeTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(
  { token, refreshToken },
  remember = true
) {
  removeTokens();

  const storage = remember ? localStorage : sessionStorage;

  if (token) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
  }

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * FormData upload ki Content-Type browser automatic ga
     * multipart boundary tho set chestundi.
     */
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('REFRESH_TOKEN_NOT_FOUND');
  }

  const response = await axios.post(`${API_URL}/auth/refresh`, {
    refreshToken,
  });

  const data = response.data?.data;

  if (!data?.token) {
    throw new Error('INVALID_REFRESH_RESPONSE');
  }

  const remember = Boolean(
    localStorage.getItem(REFRESH_TOKEN_KEY)
  );

  saveTokens(
    {
      token: data.token,
      refreshToken: data.refreshToken || refreshToken,
    },
    remember
  );

  return data.token;
}

function isLoginOrRefreshRequest(url = '') {
  const excludedPaths = [
    '/auth/otp/request',
    '/auth/otp/verify',
    '/auth/admin/login',
    '/auth/employee/login',
    '/auth/refresh',
  ];

  return excludedPaths.some((path) => url.includes(path));
}

function createApiError(error) {
  const responseData = error.response?.data;

  const apiError = new Error(
    responseData?.message ||
      error.message ||
      'Something went wrong'
  );

  apiError.code = responseData?.code || 'API_ERROR';
  apiError.status = error.response?.status || 0;
  apiError.errors = responseData?.errors || [];
  apiError.originalError = error;

  return apiError;
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginOrRefreshRequest(originalRequest.url);

    if (shouldRefresh) {
      const currentToken = getAccessToken();
      if (currentToken && currentToken.startsWith('mock-token-')) {
        const mockError = createApiError(error);
        mockError.status = 0;
        return Promise.reject(mockError);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch {
        removeTokens();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('omkar:authentication-expired')
          );
        }
      }
    }

    return Promise.reject(createApiError(error));
  }
);

export default apiClient;