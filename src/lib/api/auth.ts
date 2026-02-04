import { get, post, put, getErrorMessage } from './client';
import type { User } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

/**
 * Login user with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/auth/login', data);
  // Store token in localStorage as backup (cookie is primary)
  if (response.token) {
    localStorage.setItem('bugfixer_token', response.token);
  }
  return response;
}

/**
 * Register new user
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/auth/signup', data);
  // Store token in localStorage as backup
  if (response.token) {
    localStorage.setItem('bugfixer_token', response.token);
  }
  return response;
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ message: string }> {
  const response = await post<{ message: string }>('/auth/logout');
  // Clear local storage
  localStorage.removeItem('bugfixer_token');
  return response;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: User }> {
  return get<{ user: User }>('/auth/me');
}

/**
 * Update user profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<{ message: string; user: User }> {
  return put<{ message: string; user: User }>('/auth/profile', data);
}

// Re-export error helper
export { getErrorMessage };
