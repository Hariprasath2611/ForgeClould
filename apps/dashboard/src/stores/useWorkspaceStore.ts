import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  quotas: {
    maxProjects: number;
    maxMembers: number;
    maxDeployments: number;
    maxStorageGB: number;
    maxBandwidthGB: number;
    maxCpuCores: number;
    maxMemoryMB: number;
  };
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  framework: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  sourceControl: {
    provider: string;
    repository: string;
    branch: string;
  };
  settings: {
    buildSettings: {
      buildCommand: string;
      outputDirectory: string;
      installCommand: string;
    };
    environmentVariables: Array<{
      key: string;
      value: string;
      isSecret: boolean;
      environment: 'all' | 'development' | 'staging' | 'production';
    }>;
  };
}

export interface Environment {
  _id: string;
  projectId: string;
  name: 'development' | 'staging' | 'production';
  slug: string;
  status: 'PROVISIONING' | 'ACTIVE' | 'DEPLOYING' | 'ERROR';
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  configuration: {
    customDomains: string[];
  };
}

export interface ProjectMember {
  _id: string;
  projectId: string;
  userId: string;
  roleId: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export interface QuotaInfo {
  limits: Workspace['quotas'];
  usage: {
    projects: number;
    members: number;
    cpuCores: number;
    memoryMB: number;
    storageGB: number;
  };
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  currentProject: Project | null;
  environments: Environment[];
  members: ProjectMember[];
  quota: QuotaInfo | null;
  isLoading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  fetchProjects: (workspaceId: string) => Promise<void>;
  fetchProjectDetails: (projectId: string) => Promise<void>;
  fetchQuota: (workspaceId: string) => Promise<void>;
  
  createWorkspace: (name: string) => Promise<Workspace>;
  createProject: (params: {
    workspaceId: string;
    name: string;
    repository: string;
    framework: string;
    branch?: string;
  }) => Promise<any>;
  
  archiveProject: (projectId: string) => Promise<void>;
  restoreProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  cloneProject: (projectId: string, targetWorkspaceId: string) => Promise<void>;
  scaleEnvironment: (envId: string, resources: { cpu: number; memory: number; storage: number }) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  projects: [],
  currentProject: null,
  environments: [],
  members: [],
  quota: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>('/v1/workspaces');
      const list = response.data || [];
      set({ workspaces: list, isLoading: false });
      if (list.length > 0 && !get().currentWorkspace) {
        get().setCurrentWorkspace(list[0]);
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch workspaces', isLoading: false });
    }
  },

  setCurrentWorkspace: (workspace) => {
    localStorage.setItem('current_workspace_id', workspace._id);
    set({ currentWorkspace: workspace, projects: [], quota: null });
    get().fetchProjects(workspace._id);
    get().fetchQuota(workspace._id);
  },

  fetchProjects: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>(`/v1/projects?workspaceId=${workspaceId}`);
      set({ projects: response.data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch projects', isLoading: false });
    }
  },

  fetchProjectDetails: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>(`/v1/projects/${projectId}`);
      const { project, environments, members } = response.data;
      set({
        currentProject: project,
        environments: environments || [],
        members: members || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project details', isLoading: false });
    }
  },

  fetchQuota: async (workspaceId) => {
    try {
      const response = await apiClient.get<any>(`/v1/quotas/${workspaceId}`);
      set({ quota: response.data });
    } catch (err: any) {
      console.error('Failed to fetch workspace quotas', err);
    }
  },

  createWorkspace: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>('/v1/workspaces', { name });
      const newWs = response.data;
      set((state) => ({
        workspaces: [...state.workspaces, newWs],
        isLoading: false,
      }));
      return newWs;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create workspace', isLoading: false });
      throw err;
    }
  },

  createProject: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>('/v1/projects', params);
      const data = response.data;
      set((state) => ({
        projects: [...state.projects, data.project],
        isLoading: false,
      }));
      if (get().currentWorkspace) {
        get().fetchQuota(get().currentWorkspace!._id);
      }
      return data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || 'Failed to create project', isLoading: false });
      throw err;
    }
  },

  archiveProject: async (projectId) => {
    try {
      const response = await apiClient.post<any>(`/v1/projects/${projectId}/archive`);
      const updated = response.data;
      set((state) => ({
        projects: state.projects.map((p) => (p._id === projectId ? updated : p)),
        currentProject: state.currentProject?._id === projectId ? updated : state.currentProject,
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  },

  restoreProject: async (projectId) => {
    try {
      const response = await apiClient.post<any>(`/v1/projects/${projectId}/restore`);
      const updated = response.data;
      set((state) => ({
        projects: state.projects.map((p) => (p._id === projectId ? updated : p)),
        currentProject: state.currentProject?._id === projectId ? updated : state.currentProject,
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  },

  deleteProject: async (projectId) => {
    try {
      await apiClient.delete(`/v1/projects/${projectId}`);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== projectId),
        currentProject: state.currentProject?._id === projectId ? null : state.currentProject,
      }));
      if (get().currentWorkspace) {
        get().fetchQuota(get().currentWorkspace!._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  },

  cloneProject: async (projectId, targetWorkspaceId) => {
    try {
      await apiClient.post(`/v1/projects/${projectId}/clone`, { targetWorkspaceId });
      if (get().currentWorkspace?._id === targetWorkspaceId) {
        get().fetchProjects(targetWorkspaceId);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  },

  scaleEnvironment: async (envId, resources) => {
    try {
      const response = await apiClient.post<any>(`/v1/environments/${envId}/scale`, resources);
      const updatedEnv = response.data;
      set((state) => ({
        environments: state.environments.map((e) => (e._id === envId ? updatedEnv : e)),
      }));
      if (get().currentWorkspace) {
        get().fetchQuota(get().currentWorkspace!._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
      throw err;
    }
  },
}));
