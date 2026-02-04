import { get, post, put, patch, del } from './client';
import type { Bug, Status, Priority, Source } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateBugRequest {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  source?: Source;
  reporterEmail?: string;
  screenshots?: string[];
  projectId: string;
}

export interface UpdateBugRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  source?: Source;
  reporterEmail?: string;
  screenshots?: string[];
}

export interface UpdateBugStatusRequest {
  status: Status;
}

export interface BugsResponse {
  bugs: Bug[];
}

export interface BugResponse {
  bug: Bug;
}

// ============================================================================
// BUGS API FUNCTIONS
// ============================================================================

/**
 * Get all bugs for a project
 */
export async function getBugsByProject(projectId: string): Promise<BugsResponse> {
  return get<BugsResponse>(`/bugs/project/${projectId}`);
}

/**
 * Get a single bug by ID
 */
export async function getBugById(bugId: string): Promise<BugResponse> {
  return get<BugResponse>(`/bugs/${bugId}`);
}

/**
 * Create a new bug
 */
export async function createBug(data: CreateBugRequest): Promise<{ message: string; bug: Bug }> {
  return post<{ message: string; bug: Bug }>('/bugs', data);
}

/**
 * Update an existing bug
 */
export async function updateBug(bugId: string, data: UpdateBugRequest): Promise<{ message: string; bug: Bug }> {
  return put<{ message: string; bug: Bug }>(`/bugs/${bugId}`, data);
}

/**
 * Update bug status (for Kanban drag & drop)
 */
export async function updateBugStatus(bugId: string, status: Status): Promise<{ message: string; bug: Bug }> {
  return patch<{ message: string; bug: Bug }>(`/bugs/${bugId}/status`, { status });
}

/**
 * Delete a bug
 */
export async function deleteBug(bugId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/bugs/${bugId}`);
}
