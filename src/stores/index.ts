import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Project, Bug, ProjectMember, AccessRequest, Status, MemberRole, Priority, Source } from '@/types';
import * as authApi from '@/lib/api/auth';
import * as projectsApi from '@/lib/api/projects';
import * as bugsApi from '@/lib/api/bugs';
import * as membersApi from '@/lib/api/members';
import { getErrorMessage } from '@/lib/api/client';

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
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatarUrl?: string }) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          return true;
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          return false;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup({ email, password, name });
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          return true;
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Continue with logout even if API fails
        } finally {
          localStorage.removeItem('bugfixer_token');
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },

      checkAuth: async () => {
        // Only check if we think we're authenticated
        if (!get().isAuthenticated && !localStorage.getItem('bugfixer_token')) {
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch {
          // Token invalid or expired
          localStorage.removeItem('bugfixer_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(updates);
          set({ user: response.user, isLoading: false });
          return true;
        } catch (error) {
          const message = getErrorMessage(error);
          set({ isLoading: false, error: message });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bugfixer-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// ============================================================================
// PROJECTS STORE
// ============================================================================

interface ProjectsState {
  projects: Project[];
  publicProjects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  fetchMyProjects: () => Promise<void>;
  fetchPublicProjects: () => Promise<void>;
  fetchProjectBySlug: (slug: string) => Promise<Project | null>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, description: string, isPublic: boolean) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  getProjectBySlug: (slug: string) => Project | undefined;
  clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  publicProjects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchMyProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getMyProjects();
      set({ projects: response.projects, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  fetchPublicProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getPublicProjects();
      set({ publicProjects: response.projects, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  fetchProjectBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.getProjectBySlug(slug);
      set({ currentProject: response.project, isLoading: false });
      return response.project;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message, currentProject: null });
      return null;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: async (name, description, isPublic) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsApi.createProject({ name, description, isPublic });
      set((state) => ({ 
        projects: [...state.projects, response.project], 
        isLoading: false 
      }));
      return response.project;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return null;
    }
  },

  updateProject: async (projectId, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Filter out null values and only include defined values
      const cleanUpdates: { name?: string; description?: string; isPublic?: boolean } = {};
      if (updates.name !== undefined) cleanUpdates.name = updates.name;
      if (updates.description !== undefined && updates.description !== null) {
        cleanUpdates.description = updates.description;
      }
      if (updates.isPublic !== undefined) cleanUpdates.isPublic = updates.isPublic;
      
      const response = await projectsApi.updateProject(projectId, cleanUpdates);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? response.project : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? response.project 
          : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId 
          ? null 
          : state.currentProject,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  getProjectBySlug: (slug) => {
    return get().projects.find((p) => p.slug === slug);
  },

  clearError: () => set({ error: null }),
}));

// ============================================================================
// BUGS STORE
// ============================================================================

interface BugsState {
  bugs: Bug[];
  isLoading: boolean;
  error: string | null;
  fetchBugsByProject: (projectId: string) => Promise<void>;
  createBug: (projectId: string, bug: Partial<Bug>) => Promise<Bug | null>;
  updateBug: (bugId: string, updates: Partial<Bug>) => Promise<boolean>;
  updateBugStatus: (bugId: string, status: Status) => Promise<boolean>;
  deleteBug: (bugId: string) => Promise<boolean>;
  getBugsByProject: (projectId: string) => Bug[];
  getBugsByStatus: (projectId: string, status: Status) => Bug[];
  clearBugs: () => void;
  clearError: () => void;
}

export const useBugsStore = create<BugsState>((set, get) => ({
  bugs: [],
  isLoading: false,
  error: null,

  fetchBugsByProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bugsApi.getBugsByProject(projectId);
      set({ bugs: response.bugs, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  createBug: async (projectId, bugData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bugsApi.createBug({
        title: bugData.title || 'Untitled Bug',
        description: bugData.description || undefined,
        priority: bugData.priority,
        status: bugData.status,
        source: bugData.source,
        reporterEmail: bugData.reporterEmail || undefined,
        screenshots: bugData.screenshots,
        projectId,
      });
      set((state) => ({ 
        bugs: [...state.bugs, response.bug], 
        isLoading: false 
      }));
      return response.bug;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return null;
    }
  },

  updateBug: async (bugId, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Filter out null values and only include defined values
      const cleanUpdates: { title?: string; description?: string; priority?: Priority; status?: Status; source?: Source } = {};
      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.description !== undefined && updates.description !== null) {
        cleanUpdates.description = updates.description;
      }
      if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.source !== undefined) cleanUpdates.source = updates.source;
      
      const response = await bugsApi.updateBug(bugId, cleanUpdates);
      set((state) => ({
        bugs: state.bugs.map((b) => (b.id === bugId ? response.bug : b)),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateBugStatus: async (bugId, status) => {
    // Optimistic update for smooth drag & drop
    const previousBugs = get().bugs;
    set((state) => ({
      bugs: state.bugs.map((b) =>
        b.id === bugId ? { ...b, status, updatedAt: new Date().toISOString() } : b
      ),
    }));

    try {
      await bugsApi.updateBugStatus(bugId, status);
      return true;
    } catch (error) {
      // Rollback on error
      set({ bugs: previousBugs });
      const message = getErrorMessage(error);
      set({ error: message });
      return false;
    }
  },

  deleteBug: async (bugId) => {
    set({ isLoading: true, error: null });
    try {
      await bugsApi.deleteBug(bugId);
      set((state) => ({
        bugs: state.bugs.filter((b) => b.id !== bugId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  getBugsByProject: (projectId) => {
    return get().bugs.filter((b) => b.projectId === projectId);
  },

  getBugsByStatus: (projectId, status) => {
    return get().bugs.filter((b) => b.projectId === projectId && b.status === status);
  },

  clearBugs: () => set({ bugs: [], error: null }),

  clearError: () => set({ error: null }),
}));

// ============================================================================
// MEMBERS STORE
// ============================================================================

interface MembersState {
  members: ProjectMember[];
  accessRequests: AccessRequest[];
  isLoading: boolean;
  error: string | null;
  fetchProjectMembers: (projectId: string) => Promise<void>;
  fetchAccessRequests: (projectId: string) => Promise<void>;
  addMember: (projectId: string, email: string, role?: MemberRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<boolean>;
  requestAccess: (projectId: string, message?: string) => Promise<boolean>;
  approveAccessRequest: (requestId: string, role?: MemberRole) => Promise<boolean>;
  rejectAccessRequest: (requestId: string, note?: string) => Promise<boolean>;
  clearMembers: () => void;
  clearError: () => void;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  accessRequests: [],
  isLoading: false,
  error: null,

  fetchProjectMembers: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.getProjectMembers(projectId);
      set({ members: response.members, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  fetchAccessRequests: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.getAccessRequests(projectId);
      set({ accessRequests: response.accessRequests || [], isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  addMember: async (projectId, email, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.addMember(projectId, { email, role });
      set((state) => ({ 
        members: [...state.members, response.member], 
        isLoading: false 
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  removeMember: async (memberId) => {
    // Find the member to get projectId
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return false;

    set({ isLoading: true, error: null });
    try {
      await membersApi.removeMember(member.projectId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateMemberRole: async (memberId, role) => {
    // Find the member to get projectId
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return false;

    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.updateMemberRole(member.projectId, memberId, { role });
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? response.member : m)),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  requestAccess: async (projectId, message) => {
    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.requestAccess(projectId, { message });
      set((state) => ({ 
        accessRequests: [...state.accessRequests, response.request], 
        isLoading: false 
      }));
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ isLoading: false, error: errorMessage });
      return false;
    }
  },

  approveAccessRequest: async (requestId, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await membersApi.approveAccessRequest(requestId, role);
      set((state) => ({
        accessRequests: state.accessRequests.filter((r) => r.id !== requestId),
        members: [...state.members, response.member],
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  rejectAccessRequest: async (requestId, note) => {
    set({ isLoading: true, error: null });
    try {
      await membersApi.rejectAccessRequest(requestId, note);
      set((state) => ({
        accessRequests: state.accessRequests.filter((r) => r.id !== requestId),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearMembers: () => set({ members: [], accessRequests: [], error: null }),

  clearError: () => set({ error: null }),
}));
