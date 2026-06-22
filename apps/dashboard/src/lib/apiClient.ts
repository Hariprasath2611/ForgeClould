import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  // Simulate retrieving token, organization context, etc.
  const token = localStorage.getItem('access_token');
  const orgId = localStorage.getItem('current_organization_id');
  const workspaceId = localStorage.getItem('current_workspace_id');
  const correlationId = crypto.randomUUID();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers['x-organization-id'] = orgId;
  if (workspaceId) config.headers['x-workspace-id'] = workspaceId;
  
  config.headers['x-correlation-id'] = correlationId;
  config.headers['x-platform-info'] = 'forgecloud-web';
  config.headers['Accept-Language'] = navigator.language;

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Only return the standard 'data' field from the standardized ApiResponse
    return response.data;
  },
  (error) => {
    // Global error mapping and retry strategies will go here
    if (error.response?.status === 401) {
      // Trigger token refresh or logout
    }
    return Promise.reject(error);
  }
);
