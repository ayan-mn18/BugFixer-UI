import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Plus,
  Settings,
  Users,
  Bug,
  AlertCircle,
  Clock,
  User,
  Search,
  AlertTriangle,
  Cpu,
  GripVertical,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImageUpload, ImageGallery } from '@/components/ui/image-upload';
import { useAuthStore, useProjectsStore, useBugsStore, useMembersStore } from '@/stores';
import { toast } from 'sonner';
import type { Bug as BugType, Status, Priority, Source, Project, AccessRequest, ProjectMember } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG, SOURCE_CONFIG, ROLE_CONFIG } from '@/types';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// BUG CARD COMPONENT
// ============================================================================

interface BugCardProps {
  bug: BugType;
  onClick: () => void;
  isDragging?: boolean;
}

function BugCard({ bug, onClick, isDragging }: BugCardProps) {
  const priorityConfig = PRIORITY_CONFIG[bug.priority];
  const sourceConfig = SOURCE_CONFIG[bug.source];

  const SourceIcon = {
    CUSTOMER_REPORT: User,
    INTERNAL_QA: Search,
    AUTOMATED_TEST: Cpu,
    PRODUCTION_ALERT: AlertTriangle,
  }[bug.source];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={`
        group p-3 rounded-lg border bg-card cursor-pointer
        hover:shadow-md hover:border-primary/20 transition-all
        ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm line-clamp-2 flex-1">{bug.title}</h4>
        <Badge className={`${priorityConfig.color} text-xs shrink-0`}>
          {priorityConfig.label}
        </Badge>
      </div>

      {bug.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {bug.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <SourceIcon className="h-3 w-3" />
          <span>{sourceConfig.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {bug.reporter && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Avatar className="h-5 w-5">
            <AvatarImage src={bug.reporter.avatarUrl || ''} />
            <AvatarFallback className="text-[10px]">{bug.reporter.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{bug.reporter.name}</span>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// SORTABLE BUG CARD
// ============================================================================

function SortableBugCard({ bug, onClick, canDrag }: { bug: BugType; onClick: () => void; canDrag: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: bug.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
    >
      <div className={canDrag ? 'cursor-grab active:cursor-grabbing' : ''}>
        <BugCard bug={bug} onClick={onClick} isDragging={isDragging} />
      </div>
      {canDrag && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// KANBAN COLUMN COMPONENT
// ============================================================================

interface KanbanColumnProps {
  status: Status;
  bugs: BugType[];
  onBugClick: (bug: BugType) => void;
  canDrag: boolean;
  isOver?: boolean;
}

function KanbanColumn({ status, bugs, onBugClick, canDrag, isOver }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  const { setNodeRef, isOver: isOverDroppable } = useDroppable({
    id: status,
  });

  const isHighlighted = isOver || isOverDroppable;

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`h-2 w-2 rounded-full ${config.color}`} />
        <h3 className="font-medium text-sm">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {bugs.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={`
          h-[calc(100vh-280px)] rounded-lg transition-all duration-200
          ${isHighlighted ? 'bg-primary/10 ring-2 ring-primary/30 ring-dashed' : 'bg-muted/30'}
        `}
      >
        <ScrollArea className="h-full p-2">
          <SortableContext items={bugs.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {bugs.map((bug) => (
                  <SortableBugCard
                    key={bug.id}
                    bug={bug}
                    onClick={() => onBugClick(bug)}
                    canDrag={canDrag}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>

          {bugs.length === 0 && (
            <div className={`
              text-center py-8 text-sm text-muted-foreground 
              border-2 border-dashed rounded-lg transition-colors
              ${isHighlighted ? 'border-primary/50 text-primary' : ''}
            `}>
              {isHighlighted ? 'Drop here' : `No bugs in ${config.label.toLowerCase()}`}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

// ============================================================================
// BUG DETAIL MODAL
// ============================================================================

interface BugDetailModalProps {
  bug: BugType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onStatusChange: (status: Status) => void;
  onDelete: () => void;
}

function BugDetailModal({ bug, open, onOpenChange, isAdmin, onStatusChange, onDelete }: BugDetailModalProps) {
  if (!bug) return null;

  const priorityConfig = PRIORITY_CONFIG[bug.priority];
  const statusConfig = STATUS_CONFIG[bug.status];
  const sourceConfig = SOURCE_CONFIG[bug.source];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bug className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left line-clamp-2">{bug.title}</DialogTitle>
              <DialogDescription className="text-left">
                Created {formatDistanceToNow(new Date(bug.createdAt), { addSuffix: true })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Status & Priority */}
          <div className="flex gap-3">
            <Badge className={`${statusConfig.color} text-white`}>{statusConfig.label}</Badge>
            <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
          </div>

          {/* Status Change (Admin only) */}
          {isAdmin && (
            <div className="space-y-2">
              <Label>Move to</Label>
              <Select value={bug.status} onValueChange={(v) => onStatusChange(v as Status)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-sm whitespace-pre-wrap">
              {bug.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Source */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Source</Label>
              <p className="text-sm">{sourceConfig.label}</p>
            </div>

            {/* Reporter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Reporter</Label>
              {bug.reporter ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={bug.reporter.avatarUrl || ''} />
                    <AvatarFallback>{bug.reporter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{bug.reporter.name}</span>
                </div>
              ) : bug.reporterEmail ? (
                <p className="text-sm">{bug.reporterEmail}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Unknown</p>
              )}
            </div>
          </div>

          {/* Screenshots */}
          {bug.screenshots && bug.screenshots.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Screenshots ({bug.screenshots.length})</Label>
              <ImageGallery images={bug.screenshots} />
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Bug ID</span>
              <span className="font-mono text-right truncate ml-2">{bug.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{formatDistanceToNow(new Date(bug.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Delete Button (Admin only) */}
          {isAdmin && (
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Bug
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// CREATE BUG DIALOG
// ============================================================================

interface CreateBugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

function CreateBugDialog({ open, onOpenChange, projectId }: CreateBugDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [source, setSource] = useState<Source>('INTERNAL_QA');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBug } = useBugsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bug = await createBug(projectId, {
      title,
      description,
      priority,
      source,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });

    setIsSubmitting(false);
    if (bug) {
      toast.success('Bug created successfully!');
      onOpenChange(false);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setSource('INTERNAL_QA');
      setScreenshots([]);
    } else {
      toast.error('Failed to create bug');
    }
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setSource('INTERNAL_QA');
      setScreenshots([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Create a new bug report. It will be added to the Triage column.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the bug..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed steps to reproduce, expected vs actual behavior..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={source} onValueChange={(v) => setSource(v as Source)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Screenshots Upload */}
            <div className="space-y-2">
              <Label>Screenshots (Optional)</Label>
              <ImageUpload
                projectId={projectId}
                images={screenshots}
                onChange={setScreenshots}
                maxImages={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Bug
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// TEAM MANAGEMENT MODAL
// ============================================================================

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  members: ProjectMember[];
  requests: AccessRequest[];
}

function TeamModal({ open, onOpenChange, project, members, requests }: TeamModalProps) {
  const { user } = useAuthStore();
  const { approveAccessRequest, rejectAccessRequest, removeMember, updateMemberRole, addMember } = useMembersStore();
  const isOwner = project.ownerId === user?.id;

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const result = await addMember(project.id, inviteEmail.trim(), inviteRole as any);
      if (result.success) {
        if (result.type === 'member') {
          toast.success(`${inviteEmail} has been added to the project!`);
        } else if (result.type === 'invitation') {
          toast.success(`Invitation sent to ${inviteEmail}. They'll receive an email to join.`);
        } else {
          toast.success(`Successfully processed invite for ${inviteEmail}`);
        }
        setInviteEmail('');
        setInviteRole('MEMBER');
      } else {
        // Get the error from the store
        const errorMsg = useMembersStore.getState().error;
        toast.error(errorMsg || 'Failed to add member');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    const success = await approveAccessRequest(requestId);
    if (success) {
      toast.success('Request approved!');
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    const success = await rejectAccessRequest(requestId);
    if (success) {
      toast.success('Request rejected');
    } else {
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeMember(memberId);
    if (success) {
      toast.success('Member removed');
    } else {
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    const success = await updateMemberRole(memberId, role as any);
    if (success) {
      toast.success('Role updated!');
    } else {
      toast.error('Failed to update role');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </DialogTitle>
          <DialogDescription>
            Manage who has access to this project
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Invite Member Form (Owner only) */}
          {isOwner && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Invite Team Member
              </h4>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={!inviteEmail.trim() || isInviting}>
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Invite'
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                The user will receive an email invitation to join this project.
              </p>
            </div>
          )}

          {isOwner && <Separator />}

          {/* Pending Requests */}
          {isOwner && requests && requests.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Pending Requests ({requests.length})
              </h4>
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.user?.avatarUrl || ''} />
                        <AvatarFallback>{request.user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{request.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{request.user?.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                    {request.message && (
                      <p className="text-sm text-muted-foreground pl-11">{request.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isOwner && requests && requests.length > 0 && <Separator />}

          {/* Owner */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Owner</h4>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Avatar className="h-10 w-10">
                <AvatarImage src={project.owner?.avatarUrl || ''} />
                <AvatarFallback>{project.owner?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{project.owner?.name}</p>
                <p className="text-xs text-muted-foreground">{project.owner?.email}</p>
              </div>
              <Badge className="bg-primary">Owner</Badge>
            </div>
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Members ({members?.length || 0})</h4>
            {!members || members.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No team members yet</p>
                <p className="text-xs text-muted-foreground mt-1">Invite people to collaborate on this project</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatarUrl || ''} />
                      <AvatarFallback>{member.user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                    </div>
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(v) => handleUpdateRole(member.id, v)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary">{ROLE_CONFIG[member.role]?.label || member.role || 'Member'}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN PROJECT PAGE COMPONENT
// ============================================================================

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, isLoading: projectLoading, fetchProjectBySlug } = useProjectsStore();
  const { bugs, isLoading: bugsLoading, fetchBugsByProject, updateBugStatus, deleteBug } = useBugsStore();
  const { members, accessRequests, isLoading: membersLoading, fetchProjectMembers, fetchAccessRequests } = useMembersStore();

  const [selectedBug, setSelectedBug] = useState<BugType | null>(null);
  const [bugSheetOpen, setBugSheetOpen] = useState(false);
  const [createBugOpen, setCreateBugOpen] = useState(false);
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Fetch project data when slug changes
  useEffect(() => {
    if (slug) {
      fetchProjectBySlug(slug);
    }
  }, [slug, fetchProjectBySlug]);

  // Fetch bugs and members when project is loaded
  useEffect(() => {
    if (currentProject?.id) {
      fetchBugsByProject(currentProject.id);
      fetchProjectMembers(currentProject.id);
    }
  }, [currentProject?.id, fetchBugsByProject, fetchProjectMembers]);

  // Fetch access requests only for owners/admins (after members are loaded)
  const userRole = currentProject?.ownerId === user?.id ? 'OWNER' :
    members.find((m: ProjectMember) => m.userId === user?.id)?.role || null;
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    if (currentProject?.id && isOwnerOrAdmin) {
      fetchAccessRequests(currentProject.id);
    }
  }, [currentProject?.id, isOwnerOrAdmin, fetchAccessRequests]);

  const project = currentProject;
  const requests = accessRequests;
  const isAdmin = userRole === 'OWNER';
  // Allow drag and drop for owner, admin, and members
  const canDragBugs = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MEMBER';
  const canCreateBugs = isAdmin || userRole === 'MEMBER' || userRole === 'ADMIN';

  const [activeOverColumn, setActiveOverColumn] = useState<Status | null>(null);

  const filteredBugs = bugs.filter(
    (b: BugType) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const bugsByStatus = useMemo(() => {
    const statuses: Status[] = ['TRIAGE', 'IN_PROGRESS', 'CODE_REVIEW', 'QA_TESTING', 'DEPLOYED'];
    return statuses.reduce((acc, status) => {
      acc[status] = filteredBugs.filter((b: BugType) => b.status === status);
      return acc;
    }, {} as Record<Status, BugType[]>);
  }, [filteredBugs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setActiveOverColumn(null);
      return;
    }

    const overId = over.id as string;
    const statuses: Status[] = ['TRIAGE', 'IN_PROGRESS', 'CODE_REVIEW', 'QA_TESTING', 'DEPLOYED'];

    // Check if over a column directly
    if (statuses.includes(overId as Status)) {
      setActiveOverColumn(overId as Status);
      return;
    }

    // Check if over a bug in a column
    for (const status of statuses) {
      if (bugsByStatus[status]?.some((b: BugType) => b.id === overId)) {
        setActiveOverColumn(status);
        return;
      }
    }

    setActiveOverColumn(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveOverColumn(null);

    if (!over) return;

    const bugId = active.id as string;
    const overId = over.id as string;

    const statuses: Status[] = ['TRIAGE', 'IN_PROGRESS', 'CODE_REVIEW', 'QA_TESTING', 'DEPLOYED'];
    let targetStatus: Status | null = null;

    // Check if dropped on a column directly
    if (statuses.includes(overId as Status)) {
      targetStatus = overId as Status;
    } else {
      // Find which column the bug was dropped in (via another bug)
      for (const status of statuses) {
        if (bugsByStatus[status]?.some((b: BugType) => b.id === overId)) {
          targetStatus = status;
          break;
        }
      }
    }

    if (targetStatus) {
      const bug = bugs.find((b: BugType) => b.id === bugId);
      if (bug && bug.status !== targetStatus) {
        const success = await updateBugStatus(bugId, targetStatus);
        if (success) {
          if (targetStatus === 'DEPLOYED' && bug.reporterEmail) {
            toast.success(`Bug deployed! Email sent to ${bug.reporterEmail}`);
          } else {
            toast.success(`Bug moved to ${STATUS_CONFIG[targetStatus].label}`);
          }
        } else {
          toast.error('Failed to update bug status');
        }
      }
    }
  };

  const handleStatusChange = async (status: Status) => {
    if (!selectedBug) return;
    const success = await updateBugStatus(selectedBug.id, status);
    if (success) {
      setSelectedBug({ ...selectedBug, status });
      if (status === 'DEPLOYED' && selectedBug.reporterEmail) {
        toast.success(`Bug deployed! Email sent to ${selectedBug.reporterEmail}`);
      } else {
        toast.success(`Bug moved to ${STATUS_CONFIG[status].label}`);
      }
    } else {
      toast.error('Failed to update bug status');
    }
  };

  const handleDeleteBug = async () => {
    if (!selectedBug) return;
    const success = await deleteBug(selectedBug.id);
    if (success) {
      setBugSheetOpen(false);
      setSelectedBug(null);
      toast.success('Bug deleted');
    } else {
      toast.error('Failed to delete bug');
    }
  };

  const activeBug = activeDragId ? bugs.find((b: BugType) => b.id === activeDragId) : null;
  const isLoading = projectLoading || bugsLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">/{project.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bugs..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {canCreateBugs && (
              <Button size="sm" onClick={() => setCreateBugOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Bug
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={() => setTeamSheetOpen(true)}>
              <Users className="h-4 w-4 mr-1" />
              Team
              {requests && requests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {requests.length}
                </Badge>
              )}
            </Button>

            {isAdmin && (
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max justify-center mx-auto">
            {(['TRIAGE', 'IN_PROGRESS', 'CODE_REVIEW', 'QA_TESTING', 'DEPLOYED'] as Status[]).map(
              (status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  bugs={bugsByStatus[status]}
                  onBugClick={(bug) => {
                    setSelectedBug(bug);
                    setBugSheetOpen(true);
                  }}
                  canDrag={canDragBugs}
                  isOver={activeOverColumn === status}
                />
              )
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeBug && <BugCard bug={activeBug} onClick={() => { }} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Bug Detail Modal */}
      <BugDetailModal
        bug={selectedBug}
        open={bugSheetOpen}
        onOpenChange={setBugSheetOpen}
        isAdmin={isAdmin}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteBug}
      />

      {/* Create Bug Dialog */}
      <CreateBugDialog
        open={createBugOpen}
        onOpenChange={setCreateBugOpen}
        projectId={project.id}
      />

      {/* Team Modal */}
      <TeamModal
        open={teamSheetOpen}
        onOpenChange={setTeamSheetOpen}
        project={project}
        members={members}
        requests={requests}
      />
    </div>
  );
}
