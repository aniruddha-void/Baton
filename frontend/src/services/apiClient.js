/**
 * Baton API Client
 * Centralized fetch wrapper that automatically:
 * 1. Attaches JWT Authorization header
 * 2. Normalizes JSON bodies and headers
 * 3. Handles automatic token refresh on 401 Unauthorized
 * 4. Parses standard { success, data, message } response envelopes
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'baton_access_token';
const REFRESH_KEY = 'baton_refresh_token';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setStoredTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearStoredTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('baton_auth');
  localStorage.removeItem('baton_user');
}

/**
 * Universal request wrapper
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Automatically attach access token if present
  const accessToken = getStoredAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Set default Content-Type to JSON unless sending FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized: Attempt automatic token refresh
    if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            headers.set('Authorization', `Bearer ${newToken}`);
            return fetch(url, { ...config, headers });
          })
          .then((res) => res.json());
      }

      options._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearStoredTokens();
        window.dispatchEvent(new Event('baton_session_expired'));
        throw new Error('Session expired. Please log in again.');
      }

      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success) {
          const newAccessToken = refreshData.data.token;
          const newRefreshToken = refreshData.data.refreshToken;

          setStoredTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);

          headers.set('Authorization', `Bearer ${newAccessToken}`);
          return apiRequest(endpoint, { ...options, headers });
        } else {
          processQueue(new Error('Refresh failed'), null);
          clearStoredTokens();
          window.dispatchEvent(new Event('baton_session_expired'));
          throw new Error('Session expired. Please log in again.');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredTokens();
        window.dispatchEvent(new Event('baton_session_expired'));
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = data.errors;
      throw err;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Convenience HTTP method helpers
 */
export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

