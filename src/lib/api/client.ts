import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

// API Base URL - reads from env, defaults to local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7070/api';

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies with requests (for JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Token is stored in HTTP-only cookie, sent automatically with withCredentials
    // But we can also support localStorage token as fallback
    const token = localStorage.getItem('bugfixer_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth state and redirect to login
          localStorage.removeItem('bugfixer_token');
          localStorage.removeItem('bugfixer-auth');
          // Only redirect if not already on auth pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access forbidden:', data?.message || 'You do not have permission');
          break;
        case 404:
          console.error('Resource not found:', data?.message || 'Resource not found');
          break;
        case 422:
          console.error('Validation error:', data?.message || 'Invalid input');
          break;
        case 500:
          console.error('Server error:', data?.message || 'Internal server error');
          break;
      }
    } else if (error.request) {
      console.error('Network error: No response received');
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// GENERIC API METHODS
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GET request
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

// POST request
export async function post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

// PUT request
export async function put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

// PATCH request
export async function patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

// DELETE request
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

// ============================================================================
// ERROR HANDLING HELPER
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    return axiosError.response?.data?.message 
      || axiosError.response?.data?.error 
      || axiosError.message 
      || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default apiClient;
