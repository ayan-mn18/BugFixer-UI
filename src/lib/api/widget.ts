import { get, post, put, del } from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetSettings {
  id: string;
  token: string;
  allowedOrigins: string[];
  enabled: boolean;
  embedSnippet: string;
  createdAt: string;
}

export interface WidgetSettingsResponse {
  widget: WidgetSettings | null;
}

export interface WidgetConfigResponse {
  project: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

export interface WidgetCreateBugRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source?: string;
  reporterEmail?: string;
  screenshots?: string[];
}

export interface WidgetCreateBugResponse {
  bug: {
    id: string;
    title: string;
    priority: string;
    status: string;
  };
  message: string;
}

export interface UpdateWidgetSettingsRequest {
  allowedOrigins?: string[];
  enabled?: boolean;
}

// ============================================================================
// AUTHENTICATED ENDPOINTS (for project settings)
// ============================================================================

export const getWidgetSettings = (slug: string) =>
  get<WidgetSettingsResponse>(`/widget/settings/${slug}`);

export const generateWidgetToken = (slug: string) =>
  post<WidgetSettingsResponse>(`/widget/settings/${slug}/generate`);

export const updateWidgetSettings = (slug: string, data: UpdateWidgetSettingsRequest) =>
  put<WidgetSettingsResponse>(`/widget/settings/${slug}`, data);

export const deleteWidgetToken = (slug: string) =>
  del<{ message: string }>(`/widget/settings/${slug}`);

// ============================================================================
// PUBLIC WIDGET ENDPOINTS (token-based, used by widget iframe)
// ============================================================================

export const getWidgetConfig = (token: string) =>
  get<WidgetConfigResponse>(`/widget/${token}/config`);

export const createWidgetBug = (token: string, data: WidgetCreateBugRequest) =>
  post<WidgetCreateBugResponse>(`/widget/${token}/bugs`, data);
