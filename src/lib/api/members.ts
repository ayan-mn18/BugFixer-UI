import { get, post, put, del } from './client';
import type { ProjectMember, AccessRequest, MemberRole } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface AddMemberRequest {
  email: string;
  role?: MemberRole;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

export interface RequestAccessRequest {
  message?: string;
}

export interface MembersResponse {
  members: ProjectMember[];
}

export interface MemberResponse {
  member: ProjectMember;
}

export interface AccessRequestsResponse {
  accessRequests: AccessRequest[];
}

export interface AccessRequestResponse {
  request: AccessRequest;
}

// ============================================================================
// MEMBERS API FUNCTIONS
// ============================================================================

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string): Promise<MembersResponse> {
  return get<MembersResponse>(`/members/${projectId}`);
}

export interface AddMemberResponse {
  message: string;
  member?: ProjectMember;
  invitation?: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  };
}

/**
 * Add a member to a project (or send invitation if user doesn't exist)
 */
export async function addMember(projectId: string, data: AddMemberRequest): Promise<AddMemberResponse> {
  return post<AddMemberResponse>(`/members/${projectId}`, data);
}

/**
 * Update a member's role
 */
export async function updateMemberRole(projectId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<{ message: string; member: ProjectMember }> {
  return put<{ message: string; member: ProjectMember }>(`/members/${projectId}/${memberId}`, data);
}

/**
 * Remove a member from a project
 */
export async function removeMember(projectId: string, memberId: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/members/${projectId}/${memberId}`);
}

// ============================================================================
// ACCESS REQUESTS API FUNCTIONS
// ============================================================================

/**
 * Request access to a project
 */
export async function requestAccess(projectId: string, data?: RequestAccessRequest): Promise<{ message: string; request: AccessRequest }> {
  return post<{ message: string; request: AccessRequest }>(`/members/${projectId}/request`, data || {});
}

/**
 * Get all access requests for a project (admin only)
 */
export async function getAccessRequests(projectId: string): Promise<AccessRequestsResponse> {
  return get<AccessRequestsResponse>(`/members/${projectId}/requests`);
}

/**
 * Approve an access request
 */
export async function approveAccessRequest(requestId: string, role?: MemberRole): Promise<{ message: string; member: ProjectMember }> {
  return post<{ message: string; member: ProjectMember }>(`/members/requests/${requestId}/approve`, { role });
}

/**
 * Reject an access request
 */
export async function rejectAccessRequest(requestId: string, note?: string): Promise<{ message: string }> {
  return post<{ message: string }>(`/members/requests/${requestId}/reject`, { note });
}
