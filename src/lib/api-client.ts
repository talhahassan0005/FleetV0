/**
 * API Client with automatic JWT token injection
 * Use this for all authenticated API calls
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiCall(
  url: string,
  options: FetchOptions = {}
) {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  // Add Authorization header if token exists and not skipped
  if (!skipAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  // If 401, token might be expired - try to refresh
  if (response.status === 401 && !skipAuth) {
    try {
      const refreshResponse = await fetch('/api/auth/jwt-refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        return fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Wrapper for GET requests
 */
export function apiGet(url: string, options?: FetchOptions) {
  return apiCall(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * Wrapper for POST requests
 */
export function apiPost(url: string, body?: any, options?: FetchOptions) {
  return apiCall(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Wrapper for PUT requests
 */
export function apiPut(url: string, body?: any, options?: FetchOptions) {
  return apiCall(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Wrapper for PATCH requests
 */
export function apiPatch(url: string, body?: any, options?: FetchOptions) {
  return apiCall(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Wrapper for DELETE requests
 */
export function apiDelete(url: string, options?: FetchOptions) {
  return apiCall(url, {
    ...options,
    method: 'DELETE',
  });
}
