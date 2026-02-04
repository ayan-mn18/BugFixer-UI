// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isPublic: boolean;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  bugCount?: number;
  openBugCount?: number;
}

// Bug types
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TRIAGE' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'QA_TESTING' | 'DEPLOYED';
export type Source = 'CUSTOMER_REPORT' | 'INTERNAL_QA' | 'AUTOMATED_TEST' | 'PRODUCTION_ALERT';

export interface Bug {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  source: Source;
  reporterEmail: string | null;
  screenshots: string[];
  projectId: string;
  reporterId: string | null;
  reporter?: User | null;
  createdAt: string;
  updatedAt: string;
}

// Project member types
export type MemberRole = 'VIEWER' | 'CONTRIBUTOR' | 'MAINTAINER';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  role: MemberRole;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Access request types
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccessRequest {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  status: RequestStatus;
  message: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// UI Helper types
export interface KanbanColumn {
  id: Status;
  title: string;
  bugs: Bug[];
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  TRIAGE: { label: 'Triage', color: 'bg-slate-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500' },
  CODE_REVIEW: { label: 'Code Review', color: 'bg-purple-500' },
  QA_TESTING: { label: 'QA Testing', color: 'bg-amber-500' },
  DEPLOYED: { label: 'Deployed', color: 'bg-green-500' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-500 text-white' },
  HIGH: { label: 'High', color: 'bg-orange-500 text-white' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-500 text-black' },
  LOW: { label: 'Low', color: 'bg-slate-400 text-white' },
};

export const SOURCE_CONFIG: Record<Source, { label: string; icon: string }> = {
  CUSTOMER_REPORT: { label: 'Customer Report', icon: 'user' },
  INTERNAL_QA: { label: 'Internal QA', icon: 'search' },
  AUTOMATED_TEST: { label: 'Automated Test', icon: 'cpu' },
  PRODUCTION_ALERT: { label: 'Production Alert', icon: 'alert-triangle' },
};

export const ROLE_CONFIG: Record<MemberRole, { label: string; description: string }> = {
  VIEWER: { label: 'Viewer', description: 'Can view bugs only' },
  CONTRIBUTOR: { label: 'Contributor', description: 'Can view and create bugs' },
  MAINTAINER: { label: 'Maintainer', description: 'Can view, create, and move bugs' },
};
