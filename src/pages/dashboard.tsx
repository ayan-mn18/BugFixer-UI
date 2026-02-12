import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Bug, Grid3X3, List, Search, Globe, Lock, Users, Crown } from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore, useProjectsStore } from '@/stores';
import type { Project } from '@/types';

function ProjectCard({ project, isOwner, isMember }: { project: Project; isOwner: boolean; isMember?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/projects/${project.slug}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isOwner ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                  <FolderKanban className={`h-5 w-5 ${isOwner ? 'text-primary' : 'text-blue-500'}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-xs">/{project.slug}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project.isPublic ? (
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
                {isOwner && (
                  <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                )}
                {isMember && !isOwner && (
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                    <Users className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description || 'No description'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bug className="h-4 w-4" />
                  <span>{project.bugCount || 0} bugs</span>
                </div>
                <div className="text-muted-foreground">
                  {project.openBugCount || 0} open
                </div>
              </div>
              {project.owner && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.owner.avatarUrl || ''} />
                  <AvatarFallback className="text-xs">
                    {project.owner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function ProjectRow({ project, isOwner, isMember }: { project: Project; isOwner: boolean; isMember?: boolean }) {
  return (
    <Link to={`/projects/${project.slug}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isOwner ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
            <FolderKanban className={`h-5 w-5 ${isOwner ? 'text-primary' : 'text-blue-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{project.name}</span>
              {project.isPublic ? (
                <Globe className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
              {isOwner && (
                <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              )}
              {isMember && !isOwner && (
                <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">
                  <Users className="h-3 w-3 mr-1" />
                  Member
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Bug className="h-4 w-4" />
            {project.bugCount || 0}
          </div>
          {project.owner && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={project.owner.avatarUrl || ''} />
              <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// Section component for project groups
function ProjectSection({
  title,
  icon: Icon,
  projects,
  user,
  view,
  emptyMessage,
  emptyDescription,
  showCreateButton = false,
  iconColor = 'text-primary',
  bgColor = 'bg-primary/10'
}: {
  title: string;
  icon: React.ElementType;
  projects: Project[];
  user: any;
  view: 'grid' | 'list';
  emptyMessage: string;
  emptyDescription: string;
  showCreateButton?: boolean;
  iconColor?: string;
  bgColor?: string;
}) {
  if (projects.length === 0 && !showCreateButton) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 border border-dashed rounded-lg"
        >
          <div className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <h3 className="font-medium mb-1">{emptyMessage}</h3>
          <p className="text-sm text-muted-foreground mb-4">{emptyDescription}</p>
          {showCreateButton && (
            <Button asChild>
              <Link to="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Link>
            </Button>
          )}
        </motion.div>
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.ownerId === user?.id}
              isMember={project.ownerId !== user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project: Project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isOwner={project.ownerId === user?.id}
              isMember={project.ownerId !== user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const { projects, isLoading, fetchMyProjects } = useProjectsStore();

  // Fetch projects on mount
  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  // Filter and separate projects
  const filteredProjects = projects.filter(
    (p: Project) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const ownedProjects = filteredProjects.filter((p: Project) => p.ownerId === user?.id);
  const sharedProjects = filteredProjects.filter((p: Project) => p.ownerId !== user?.id);

  if (isLoading && projects.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your bug tracking projects
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3X3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Owned Projects Section */}
      <ProjectSection
        title="My Projects"
        icon={Crown}
        projects={ownedProjects}
        user={user}
        view={view}
        emptyMessage="No projects created yet"
        emptyDescription="Create your first project to start tracking bugs"
        showCreateButton={true}
        iconColor="text-amber-500"
        bgColor="bg-amber-500/10"
      />

      {/* Shared Projects Section */}
      <ProjectSection
        title="Shared with Me"
        icon={Users}
        projects={sharedProjects}
        user={user}
        view={view}
        emptyMessage="No shared projects"
        emptyDescription="Projects shared with you will appear here"
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      {/* Empty state when no projects at all */}
      {filteredProjects.length === 0 && !search && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Welcome to BugFixer!</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Get started by creating your first project or wait for someone to invite you to theirs.
          </p>
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Link>
          </Button>
        </motion.div>
      )}

      {/* No search results */}
      {filteredProjects.length === 0 && search && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No projects found</h3>
          <p className="text-sm text-muted-foreground">
            Try searching with different keywords
          </p>
        </motion.div>
      )}
    </div>
  );
}
