import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Project, Bug, ProjectMember, AccessRequest, Status, MemberRole } from '@/types';
import { mockUsers, mockProjects, mockBugs, mockProjectMembers, mockAccessRequests } from '@/lib/mock-data';

// ============================================================================
// THEME STORE
// ============================================================================

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'bugfixer-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);

// ============================================================================
// AUTH STORE
// ============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const user = mockUsers.find((u) => u.email === email);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        // For demo, allow any email to login as first mock user
        set({ user: mockUsers[0], isAuthenticated: true });
        return true;
      },

      signup: async (email: string, _password: string, name: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates, updatedAt: new Date().toISOString() } });
        }
      },
    }),
    {
      name: 'bugfixer-auth',
    }
  )
);

// ============================================================================
// PROJECTS STORE
// ============================================================================

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, description: string, isPublic: boolean) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  getProjectBySlug: (slug: string) => Project | undefined;
  getUserProjects: (userId: string) => Project[];
  getPublicProjects: () => Project[];
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [...mockProjects],
  currentProject: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: (name, description, isPublic) => {
    const { user } = useAuthStore.getState();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      slug: `${slug}-${Date.now()}`,
      isPublic,
      ownerId: user?.id || '',
      owner: user || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bugCount: 0,
      openBugCount: 0,
    };

    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  updateProject: (projectId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProject: (projectId) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    }));
  },

  getProjectBySlug: (slug) => {
    return get().projects.find((p) => p.slug === slug);
  },

  getUserProjects: (userId): Project[] => {
    const { projects } = get();
    const members: ProjectMember[] = useMembersStore.getState().members;
    
    const ownedProjects = projects.filter((p: Project) => p.ownerId === userId);
    const memberProjectIds: string[] = members.filter((m: ProjectMember) => m.userId === userId).map((m: ProjectMember) => m.projectId);
    const memberProjects = projects.filter(
      (p: Project): boolean => memberProjectIds.includes(p.id) && p.ownerId !== userId
    );
    
    return [...ownedProjects, ...memberProjects];
  },

  getPublicProjects: () => {
    return get().projects.filter((p) => p.isPublic);
  },
}));

// ============================================================================
// BUGS STORE
// ============================================================================

interface BugsState {
  bugs: Bug[];
  createBug: (projectId: string, bug: Partial<Bug>) => Bug;
  updateBug: (bugId: string, updates: Partial<Bug>) => void;
  updateBugStatus: (bugId: string, status: Status) => void;
  deleteBug: (bugId: string) => void;
  getBugsByProject: (projectId: string) => Bug[];
  getBugsByStatus: (projectId: string, status: Status) => Bug[];
}

export const useBugsStore = create<BugsState>((set, get) => ({
  bugs: [...mockBugs],

  createBug: (projectId, bugData) => {
    const { user } = useAuthStore.getState();
    
    const newBug: Bug = {
      id: `bug-${Date.now()}`,
      title: bugData.title || 'Untitled Bug',
      description: bugData.description || null,
      priority: bugData.priority || 'MEDIUM',
      status: 'TRIAGE',
      source: bugData.source || 'INTERNAL_QA',
      reporterEmail: bugData.reporterEmail || null,
      screenshots: bugData.screenshots || [],
      projectId,
      reporterId: user?.id || null,
      reporter: user || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ bugs: [...state.bugs, newBug] }));
    return newBug;
  },

  updateBug: (bugId, updates) => {
    set((state) => ({
      bugs: state.bugs.map((b) =>
        b.id === bugId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      ),
    }));
  },

  updateBugStatus: (bugId, status) => {
    set((state) => ({
      bugs: state.bugs.map((b) =>
        b.id === bugId ? { ...b, status, updatedAt: new Date().toISOString() } : b
      ),
    }));
  },

  deleteBug: (bugId) => {
    set((state) => ({
      bugs: state.bugs.filter((b) => b.id !== bugId),
    }));
  },

  getBugsByProject: (projectId) => {
    return get().bugs.filter((b) => b.projectId === projectId);
  },

  getBugsByStatus: (projectId, status) => {
    return get().bugs.filter((b) => b.projectId === projectId && b.status === status);
  },
}));

// ============================================================================
// MEMBERS STORE
// ============================================================================

interface MembersState {
  members: ProjectMember[];
  requests: AccessRequest[];
  addMember: (projectId: string, userId: string, role: MemberRole) => void;
  removeMember: (memberId: string) => void;
  updateMemberRole: (memberId: string, role: MemberRole) => void;
  requestAccess: (projectId: string, message: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string, note?: string) => void;
  getProjectMembers: (projectId: string) => ProjectMember[];
  getPendingRequests: (projectId: string) => AccessRequest[];
  hasAccess: (projectId: string, userId: string) => boolean;
  getUserRole: (projectId: string, userId: string) => MemberRole | 'OWNER' | null;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [...mockProjectMembers],
  requests: [...mockAccessRequests],

  addMember: (projectId, userId, role) => {
    const { user } = useAuthStore.getState();
    const targetUser = mockUsers.find((u) => u.id === userId);
    
    const newMember: ProjectMember = {
      id: `member-${Date.now()}`,
      projectId,
      userId,
      user: targetUser,
      role,
      invitedBy: user?.id || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ members: [...state.members, newMember] }));
  },

  removeMember: (memberId) => {
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    }));
  },

  updateMemberRole: (memberId, role) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, role, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },

  requestAccess: (projectId, message) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const newRequest: AccessRequest = {
      id: `request-${Date.now()}`,
      projectId,
      userId: user.id,
      user,
      status: 'PENDING',
      message,
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ requests: [...state.requests, newRequest] }));
  },

  approveRequest: (requestId) => {
    const { requests } = get();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const { user } = useAuthStore.getState();
    
    // Update request status
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED' as const,
              reviewedBy: user?.id || null,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));

    // Add as member
    get().addMember(request.projectId, request.userId, 'VIEWER');
  },

  rejectRequest: (requestId, note) => {
    const { user } = useAuthStore.getState();
    
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED' as const,
              reviewedBy: user?.id || null,
              reviewedAt: new Date().toISOString(),
              reviewNote: note || null,
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  getProjectMembers: (projectId) => {
    return get().members.filter((m) => m.projectId === projectId);
  },

  getPendingRequests: (projectId) => {
    return get().requests.filter((r) => r.projectId === projectId && r.status === 'PENDING');
  },

  hasAccess: (projectId, userId): boolean => {
    const projects: Project[] = useProjectsStore.getState().projects;
    const project = projects.find((p: Project) => p.id === projectId);
    
    if (!project) return false;
    if (project.ownerId === userId) return true;
    if (project.isPublic) return true;
    
    return get().members.some((m: ProjectMember): boolean => m.projectId === projectId && m.userId === userId);
  },

  getUserRole: (projectId, userId) => {
    const projects: Project[] = useProjectsStore.getState().projects;
    const project = projects.find((p: Project) => p.id === projectId);
    
    if (!project) return null;
    if (project.ownerId === userId) return 'OWNER';
    
    const membership = get().members.find((m) => m.projectId === projectId && m.userId === userId);
    return membership?.role || null;
  },
}));
