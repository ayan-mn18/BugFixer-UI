import { useEffect, useState } from 'react';
import {
  Github,
  Bot,
  Loader2,
  ExternalLink,
  Trash2,
  Plus,
  Check,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import * as githubApi from '@/lib/api/github';
import * as agentConfigApi from '@/lib/api/agent-config';
import type { GitHubIntegrationStatus, GitHubRepoOption, AgentConfig, AIProvider } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultTab?: string;
}

// ============================================================================
// GITHUB TAB
// ============================================================================

function GitHubTab({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<GitHubIntegrationStatus | null>(null);
  const [availableRepos, setAvailableRepos] = useState<GitHubRepoOption[]>([]);
  const [repoPage, setRepoPage] = useState(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectingRepoId, setConnectingRepoId] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const data = await githubApi.getIntegrationStatus(projectId);
      setStatus(data);
    } catch {
      toast.error('Failed to load GitHub status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepos = async (page = 1) => {
    try {
      setIsLoadingRepos(true);
      const data = await githubApi.listGitHubRepos(projectId, page);
      if (page === 1) {
        setAvailableRepos(data.repos);
      } else {
        setAvailableRepos((prev) => [...prev, ...data.repos]);
      }
      setHasMoreRepos(data.hasMore);
      setRepoPage(page);
    } catch {
      toast.error('Failed to load repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [projectId]);

  useEffect(() => {
    if (status?.connected) {
      fetchRepos();
    }
  }, [status?.connected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { url } = await githubApi.getOAuthUrl(projectId);
      window.location.href = url;
    } catch {
      toast.error('Failed to initiate GitHub connection');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await githubApi.disconnectIntegration(projectId);
      setStatus({ connected: false, integration: null });
      setAvailableRepos([]);
      toast.success('GitHub disconnected');
    } catch {
      toast.error('Failed to disconnect GitHub');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnectRepo = async (repo: GitHubRepoOption) => {
    try {
      setConnectingRepoId(repo.id);
      await githubApi.connectRepo(projectId, {
        repoOwner: repo.owner,
        repoName: repo.name,
        repoFullName: repo.fullName,
        isDefault: !status?.integration?.repos?.length,
        autoCreateIssues: true,
        labelSync: true,
      });
      await fetchStatus();
      toast.success(`Connected ${repo.fullName}`);
    } catch {
      toast.error('Failed to connect repository');
    } finally {
      setConnectingRepoId(null);
    }
  };

  const handleDisconnectRepo = async (repoId: string) => {
    try {
      await githubApi.disconnectRepo(projectId, repoId);
      await fetchStatus();
      toast.success('Repository disconnected');
    } catch {
      toast.error('Failed to disconnect repository');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not connected state
  if (!status?.connected) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Github className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Connect GitHub</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Connect your GitHub account to automatically create issues when bugs are reported and enable AI-powered bug fixing.
            </p>
          </div>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Github className="h-4 w-4 mr-2" />
            )}
            Connect GitHub
          </Button>
        </div>
      </div>
    );
  }

  // Connected state
  const connectedRepoNames = new Set(
    status.integration?.repos?.map((r) => r.repoFullName) || []
  );
  const unconnectedRepos = availableRepos.filter(
    (r) => !connectedRepoNames.has(r.fullName)
  );

  return (
    <div className="space-y-6">
      {/* Connection info */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Github className="h-5 w-5" />
          <div>
            <p className="font-medium">@{status.integration?.githubUsername}</p>
            <p className="text-xs text-muted-foreground">
              Connected {status.integration?.connectedAt
                ? new Date(status.integration.connectedAt).toLocaleDateString()
                : ''}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Disconnect'
          )}
        </Button>
      </div>

      <Separator />

      {/* Connected repos */}
      <div className="space-y-3">
        <Label>Connected Repositories</Label>
        {status.integration?.repos?.length ? (
          <div className="space-y-2">
            {status.integration.repos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{repo.repoFullName}</span>
                  {repo.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                  {repo.autoCreateIssues && (
                    <Badge variant="outline" className="text-xs">Auto Issues</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDisconnectRepo(repo.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No repositories connected yet.</p>
        )}
      </div>

      <Separator />

      {/* Available repos to connect */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Available Repositories</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRepos(1)}
            disabled={isLoadingRepos}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingRepos ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-1">
            {unconnectedRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {repo.private ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm truncate">{repo.fullName}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 ml-2"
                  disabled={connectingRepoId === repo.id}
                  onClick={() => handleConnectRepo(repo)}
                >
                  {connectingRepoId === repo.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
            {unconnectedRepos.length === 0 && !isLoadingRepos && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {availableRepos.length === 0 ? 'No repositories found' : 'All repositories are connected'}
              </p>
            )}
            {isLoadingRepos && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </ScrollArea>

        {hasMoreRepos && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => fetchRepos(repoPage + 1)}
            disabled={isLoadingRepos}
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AI AGENT TAB
// ============================================================================

function AgentTab({ projectId }: { projectId: string }) {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const data = await agentConfigApi.getAgentConfig(projectId);
        setConfig(data.config);
      } catch {
        toast.error('Failed to load agent config');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [projectId]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setIsSaving(true);
      const data = await agentConfigApi.updateAgentConfig(projectId, {
        enabled: config.enabled,
        aiProvider: config.aiProvider,
        aiModel: config.aiModel,
        systemPrompt: config.systemPrompt,
        autoAssign: config.autoAssign,
        targetBranch: config.targetBranch,
        prBranchPrefix: config.prBranchPrefix,
      });
      setConfig(data.config);
      toast.success('Agent configuration saved');
    } catch {
      toast.error('Failed to save agent config');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">AI Bug-Fixing Agent</Label>
          <p className="text-sm text-muted-foreground">
            Automatically generate fix PRs for reported bugs
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
        />
      </div>

      <Separator />

      {/* AI Provider & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <Select
            value={config.aiProvider}
            onValueChange={(v) => setConfig({ ...config, aiProvider: v as AIProvider })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPENAI">OpenAI</SelectItem>
              <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
              <SelectItem value="GEMINI">Google Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            value={config.aiModel}
            onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
            placeholder="gpt-4o-mini"
          />
        </div>
      </div>

      {/* Branch settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Target Branch</Label>
          <Input
            value={config.targetBranch}
            onChange={(e) => setConfig({ ...config, targetBranch: e.target.value })}
            placeholder="main"
          />
        </div>

        <div className="space-y-2">
          <Label>PR Branch Prefix</Label>
          <Input
            value={config.prBranchPrefix}
            onChange={(e) => setConfig({ ...config, prBranchPrefix: e.target.value })}
            placeholder="bugfix/"
          />
        </div>
      </div>

      {/* Auto-assign */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Auto-assign agent</Label>
          <p className="text-sm text-muted-foreground">
            Automatically assign the AI agent to new bugs
          </p>
        </div>
        <Switch
          checked={config.autoAssign}
          onCheckedChange={(checked) => setConfig({ ...config, autoAssign: checked })}
        />
      </div>

      {/* System prompt */}
      <div className="space-y-2">
        <Label>System Prompt (optional)</Label>
        <Textarea
          value={config.systemPrompt || ''}
          onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value || null })}
          placeholder="Additional instructions for the AI agent when fixing bugs in this project..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Provide project-specific context like tech stack, coding conventions, or areas to focus on.
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// PROJECT SETTINGS DIALOG
// ============================================================================

export function ProjectSettingsDialog({
  open,
  onOpenChange,
  projectId,
  defaultTab = 'github',
}: ProjectSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure integrations and AI agent for this project.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="mt-4">
            <GitHubTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="agent" className="mt-4">
            <AgentTab projectId={projectId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
