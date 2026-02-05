import type { User, Project, Bug, ProjectMember, AccessRequest } from '@/types';

// ============================================================================
// MOCK USERS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'john@example.com',
    name: 'John Developer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    email: 'jane@example.com',
    name: 'Jane Engineer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    email: 'alex@example.com',
    name: 'Alex Designer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z',
  },
];

// ============================================================================
// MOCK PROJECTS
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'BugFixer App',
    description: 'The bug tracking application itself - eating our own dog food!',
    slug: 'bugfixer-app',
    isPublic: true,
    ownerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    owner: mockUsers[0],
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
    bugCount: 8,
    openBugCount: 5,
  },
  {
    id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    name: 'Mobile App v2',
    description: 'Next generation mobile application with new features',
    slug: 'mobile-app-v2',
    isPublic: true,
    ownerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    owner: mockUsers[0],
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z',
    bugCount: 3,
    openBugCount: 2,
  },
  {
    id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    name: 'Internal Tools',
    description: 'Private internal tooling - restricted access',
    slug: 'internal-tools',
    isPublic: false,
    ownerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    owner: mockUsers[0],
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-25T10:00:00Z',
    bugCount: 1,
    openBugCount: 1,
  },
  {
    id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    name: 'Design System',
    description: 'Shared component library and design tokens',
    slug: 'design-system',
    isPublic: true,
    ownerId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    owner: mockUsers[1],
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-28T10:00:00Z',
    bugCount: 4,
    openBugCount: 3,
  },
];

// ============================================================================
// MOCK BUGS
// ============================================================================

export const mockBugs: Bug[] = [
  // BugFixer App bugs
  {
    id: 'bug-001',
    title: 'Login button unresponsive on Safari',
    description: 'Users on Safari 17+ report that the login button requires multiple clicks. Console shows no errors. This appears to be related to the click handler not firing consistently.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    source: 'CUSTOMER_REPORT',
    reporterEmail: 'customer@external.com',
    screenshots: ['https://placehold.co/800x600/png?text=Safari+Bug'],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: null,
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-02T10:00:00Z',
  },
  {
    id: 'bug-002',
    title: 'Dashboard charts not loading',
    description: 'The analytics charts on the dashboard show infinite spinner. API returns 200 but data format changed.',
    priority: 'CRITICAL',
    status: 'CODE_REVIEW',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: ['https://placehold.co/800x600/png?text=Chart+Loading+Issue'],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reporter: mockUsers[1],
    createdAt: '2025-02-01T14:00:00Z',
    updatedAt: '2025-02-03T10:00:00Z',
  },
  {
    id: 'bug-003',
    title: 'Memory leak in notification service',
    description: 'Production monitoring detected gradual memory increase over 72 hours. Heap dump shows notification listeners not being cleaned up.',
    priority: 'CRITICAL',
    status: 'TRIAGE',
    source: 'PRODUCTION_ALERT',
    reporterEmail: null,
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    reporter: mockUsers[0],
    createdAt: '2025-02-03T08:00:00Z',
    updatedAt: '2025-02-03T08:00:00Z',
  },
  {
    id: 'bug-004',
    title: 'Drag and drop flickers on Firefox',
    description: 'When dragging bug cards on Firefox, there is visible flickering. Works fine on Chrome and Safari.',
    priority: 'MEDIUM',
    status: 'TRIAGE',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reporter: mockUsers[1],
    createdAt: '2025-02-02T16:00:00Z',
    updatedAt: '2025-02-02T16:00:00Z',
  },
  {
    id: 'bug-005',
    title: 'Email notifications not sent',
    description: 'Users are not receiving email notifications when their bugs are deployed. SMTP connection appears healthy.',
    priority: 'HIGH',
    status: 'QA_TESTING',
    source: 'CUSTOMER_REPORT',
    reporterEmail: 'support@client.com',
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: null,
    createdAt: '2025-01-30T10:00:00Z',
    updatedAt: '2025-02-03T14:00:00Z',
  },
  {
    id: 'bug-006',
    title: 'Typo in error message',
    description: 'Error message says "Somthing went wrong" instead of "Something went wrong"',
    priority: 'LOW',
    status: 'DEPLOYED',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reporter: mockUsers[1],
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-29T10:00:00Z',
  },
  {
    id: 'bug-007',
    title: 'Profile image upload fails for large files',
    description: 'Uploading profile images larger than 2MB results in a 413 error. Need to add client-side validation or increase server limit.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    reporter: mockUsers[0],
    createdAt: '2025-02-01T12:00:00Z',
    updatedAt: '2025-02-02T12:00:00Z',
  },
  {
    id: 'bug-008',
    title: 'Search results inconsistent',
    description: 'Searching for bugs sometimes returns different results for the same query. Possible caching issue.',
    priority: 'LOW',
    status: 'DEPLOYED',
    source: 'AUTOMATED_TEST',
    reporterEmail: null,
    screenshots: [],
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    reporterId: null,
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-27T10:00:00Z',
  },
  // Mobile App v2 bugs
  {
    id: 'bug-009',
    title: 'App crashes on iOS 18',
    description: 'The app crashes immediately after launch on devices running iOS 18 beta.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    source: 'CUSTOMER_REPORT',
    reporterEmail: 'beta@tester.com',
    screenshots: ['https://placehold.co/800x600/png?text=iOS+Crash'],
    projectId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    reporterId: null,
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-03T10:00:00Z',
  },
  {
    id: 'bug-010',
    title: 'Push notifications delayed',
    description: 'Push notifications arrive 5-10 minutes late on Android devices.',
    priority: 'HIGH',
    status: 'TRIAGE',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    reporterId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reporter: mockUsers[1],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'bug-011',
    title: 'Dark mode toggle not persisting',
    description: 'When user toggles dark mode, it resets on app restart.',
    priority: 'LOW',
    status: 'DEPLOYED',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    reporterId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    reporter: mockUsers[0],
    createdAt: '2025-01-29T10:00:00Z',
    updatedAt: '2025-01-30T10:00:00Z',
  },
  // Internal Tools bug
  {
    id: 'bug-012',
    title: 'Report export timing out',
    description: 'Exporting large reports (>10k rows) causes the server to timeout.',
    priority: 'HIGH',
    status: 'TRIAGE',
    source: 'PRODUCTION_ALERT',
    reporterEmail: null,
    screenshots: [],
    projectId: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    reporterId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    reporter: mockUsers[0],
    createdAt: '2025-02-03T09:00:00Z',
    updatedAt: '2025-02-03T09:00:00Z',
  },
  // Design System bugs
  {
    id: 'bug-013',
    title: 'Button component missing focus styles',
    description: 'The Button component does not have visible focus styles, failing WCAG accessibility requirements.',
    priority: 'HIGH',
    status: 'CODE_REVIEW',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    reporterId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    reporter: mockUsers[2],
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-03T10:00:00Z',
  },
  {
    id: 'bug-014',
    title: 'Modal backdrop not closing on click',
    description: 'Clicking the backdrop of a modal does not close it as expected.',
    priority: 'MEDIUM',
    status: 'TRIAGE',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    reporterId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    reporter: mockUsers[1],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'bug-015',
    title: 'Color tokens not exported correctly',
    description: 'Some color tokens are missing from the exported CSS variables file.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    source: 'INTERNAL_QA',
    reporterEmail: null,
    screenshots: [],
    projectId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    reporterId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    reporter: mockUsers[2],
    createdAt: '2025-01-31T10:00:00Z',
    updatedAt: '2025-02-02T10:00:00Z',
  },
  {
    id: 'bug-016',
    title: 'Storybook build failing',
    description: 'The Storybook build is failing due to a dependency conflict with React 19.',
    priority: 'HIGH',
    status: 'DEPLOYED',
    source: 'AUTOMATED_TEST',
    reporterEmail: null,
    screenshots: [],
    projectId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    reporterId: null,
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-30T10:00:00Z',
  },
];

// ============================================================================
// MOCK PROJECT MEMBERS
// ============================================================================

export const mockProjectMembers: ProjectMember[] = [
  {
    id: 'member-001',
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    userId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    user: mockUsers[1],
    role: 'MEMBER',
    invitedBy: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    createdAt: '2025-01-21T10:00:00Z',
    updatedAt: '2025-01-21T10:00:00Z',
  },
  {
    id: 'member-002',
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    userId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    user: mockUsers[2],
    role: 'VIEWER',
    invitedBy: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    createdAt: '2025-01-22T10:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z',
  },
  {
    id: 'member-003',
    projectId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    userId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    user: mockUsers[2],
    role: 'ADMIN',
    invitedBy: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    createdAt: '2025-01-29T10:00:00Z',
    updatedAt: '2025-01-29T10:00:00Z',
  },
];

// ============================================================================
// MOCK ACCESS REQUESTS
// ============================================================================

export const mockAccessRequests: AccessRequest[] = [
  {
    id: 'request-001',
    projectId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    userId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    user: mockUsers[1],
    status: 'PENDING',
    message: 'Hi! I would love to help with the mobile app bugs. I have experience with React Native.',
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-02T10:00:00Z',
  },
  {
    id: 'request-002',
    projectId: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    userId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    user: mockUsers[2],
    status: 'PENDING',
    message: 'Would like to contribute to the internal tools project.',
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    createdAt: '2025-02-03T10:00:00Z',
    updatedAt: '2025-02-03T10:00:00Z',
  },
  {
    id: 'request-003',
    projectId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    userId: 'c3d4e5f6-a7b8-9012-cdef-234567890123',
    user: mockUsers[2],
    status: 'APPROVED',
    message: 'Interested in helping with UI bugs.',
    reviewedBy: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    reviewedAt: '2025-01-22T10:00:00Z',
    reviewNote: 'Welcome aboard!',
    createdAt: '2025-01-21T10:00:00Z',
    updatedAt: '2025-01-22T10:00:00Z',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getBugsByProject(projectId: string): Bug[] {
  return mockBugs.filter((bug) => bug.projectId === projectId);
}

export function getBugsByStatus(projectId: string, status: string): Bug[] {
  return mockBugs.filter((bug) => bug.projectId === projectId && bug.status === status);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return mockProjects.find((project) => project.slug === slug);
}

export function getProjectMembers(projectId: string): ProjectMember[] {
  return mockProjectMembers.filter((member) => member.projectId === projectId);
}

export function getPendingRequests(projectId: string): AccessRequest[] {
  return mockAccessRequests.filter(
    (request) => request.projectId === projectId && request.status === 'PENDING'
  );
}

export function getUserProjects(userId: string): Project[] {
  const ownedProjects = mockProjects.filter((p) => p.ownerId === userId);
  const memberProjectIds = mockProjectMembers
    .filter((m) => m.userId === userId)
    .map((m) => m.projectId);
  const memberProjects = mockProjects.filter(
    (p) => memberProjectIds.includes(p.id) && p.ownerId !== userId
  );
  return [...ownedProjects, ...memberProjects];
}

export function getPublicProjects(): Project[] {
  return mockProjects.filter((p) => p.isPublic);
}
