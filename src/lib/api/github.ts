import { get, post, del } from './client';
import type { GitHubIntegrationStatus, GitHubRepoOption, GitHubRepo } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectRepoRequest {
  repoOwner: string;
  repoName: string;
  repoFullName: string;
  isDefault?: boolean;
  autoCreateIssues?: boolean;
  labelSync?: boolean;
}

export interface ReposListResponse {
  repos: GitHubRepoOption[];
  hasMore: boolean;
}

// ============================================================================
// GITHUB API FUNCTIONS
// ============================================================================

/**
 * Get OAuth authorization URL for a project
 */
export async function getOAuthUrl(projectId: string): Promise<{ url: string }> {
  return get<{ url: string }>(`/github/auth/${projectId}`);
}

/**
 * Get GitHub integration status for a project
 */
export async function getIntegrationStatus(projectId: string): Promise<GitHubIntegrationStatus> {
  return get<GitHubIntegrationStatus>(`/github/status/${projectId}`);
}

/**
 * List available GitHub repos for the connected account
 */
export async function listGitHubRepos(projectId: string, page = 1): Promise<ReposListResponse> {
  return get<ReposListResponse>(`/github/repos/${projectId}?page=${page}`);
}

/**
 * Connect a GitHub repo to a project
 */
export async function connectRepo(projectId: string, data: ConnectRepoRequest): Promise<{ repo: GitHubRepo }> {
  return post<{ repo: GitHubRepo }>(`/github/repos/${projectId}`, data);
}

/**
 * Disconnect a GitHub repo from a project
 */
export async function disconnectRepo(projectId: string, repoId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/github/repos/${projectId}/${repoId}`);
}

/**
 * Disconnect GitHub integration entirely
 */
export async function disconnectIntegration(projectId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/github/${projectId}`);
}
