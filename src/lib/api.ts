const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  data?: any;
}

/**
 * Wrapper around fetch with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { data, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...customConfig.headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorMessage = `An error occurred: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, config?: RequestInit): Promise<T> => 
    apiRequest(endpoint, { method: 'GET', ...config }),

  post: <T>(endpoint: string, data: any, config?: RequestInit): Promise<T> => 
    apiRequest(endpoint, { method: 'POST', data, ...config }),

  put: <T>(endpoint: string, data: any, config?: RequestInit): Promise<T> => 
    apiRequest(endpoint, { method: 'PUT', data, ...config }),

  delete: <T>(endpoint: string, config?: RequestInit): Promise<T> => 
    apiRequest(endpoint, { method: 'DELETE', ...config }),
};