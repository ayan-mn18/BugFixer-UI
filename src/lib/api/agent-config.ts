import { get, put } from './client';
import type { AgentConfig } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface UpdateAgentConfigRequest {
  enabled?: boolean;
  aiProvider?: 'OPENAI' | 'ANTHROPIC' | 'GEMINI';
  aiModel?: string;
  systemPrompt?: string | null;
  autoAssign?: boolean;
  targetBranch?: string;
  prBranchPrefix?: string;
}

// ============================================================================
// AGENT CONFIG API FUNCTIONS
// ============================================================================

/**
 * Get agent config for a project
 */
export async function getAgentConfig(projectId: string): Promise<{ config: AgentConfig }> {
  return get<{ config: AgentConfig }>(`/agent-config/${projectId}`);
}

/**
 * Update agent config for a project (upsert)
 */
export async function updateAgentConfig(
  projectId: string,
  data: UpdateAgentConfigRequest
): Promise<{ config: AgentConfig }> {
  return put<{ config: AgentConfig }>(`/agent-config/${projectId}`, data);
}
