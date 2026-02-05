import { get, post, put, del } from './client';
import type { Project } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateProjectRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface ProjectWithStats extends Project {
  bugCount: number;
  openBugCount: number;
}

export interface ProjectsResponse {
  projects: ProjectWithStats[];
}

export interface ProjectResponse {
  project: ProjectWithStats;
  userRole?: 'owner' | 'admin' | 'member' | 'viewer' | null;
}

// ============================================================================
// PROJECTS API FUNCTIONS
// ============================================================================

/**
 * Get all projects for the current user (owned + member)
 */
export async function getMyProjects(): Promise<ProjectsResponse> {
  return get<ProjectsResponse>('/projects');
}

/**
 * Get all public projects
 */
export async function getPublicProjects(): Promise<ProjectsResponse> {
  return get<ProjectsResponse>('/projects/public');
}

/**
 * Get a project by its slug
 */
export async function getProjectBySlug(slug: string): Promise<ProjectResponse> {
  return get<ProjectResponse>(`/projects/${slug}`);
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectRequest): Promise<{ message: string; project: Project }> {
  return post<{ message: string; project: Project }>('/projects', data);
}

/**
 * Update an existing project
 */
export async function updateProject(projectId: string, data: UpdateProjectRequest): Promise<{ message: string; project: Project }> {
  return put<{ message: string; project: Project }>(`/projects/${projectId}`, data);
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/projects/${projectId}`);
}
