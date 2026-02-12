import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Globe, Bug, Users, Loader2 } from 'lucide-react';
import { ExploreSkeleton } from '@/components/skeletons';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore, useProjectsStore, useMembersStore } from '@/stores';
import { toast } from 'sonner';
import type { Project } from '@/types';

function ExploreProjectCard({ project }: { project: Project }) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { requestAccess } = useMembersStore();

  const isOwner = project.ownerId === user?.id;
  // Simple check if user might have access - they're either owner or we show Request Access button
  const userHasAccess = isOwner;

  const handleRequestAccess = async () => {
    setIsSubmitting(true);
    const success = await requestAccess(project.id, message);
    setIsSubmitting(false);
    if (success) {
      toast.success('Access request sent!');
      setRequestOpen(false);
      setMessage('');
    } else {
      toast.error('Failed to send access request');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-xs">/{project.slug}</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description'}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Bug className="h-4 w-4" />
                  <span>{project.bugCount || 0} bugs</span>
                </div>
              </div>
              {project.owner && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.owner.avatarUrl || ''} />
                    <AvatarFallback className="text-xs">
                      {project.owner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{project.owner.name}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              {isOwner ? (
                <Button asChild className="w-full">
                  <Link to={`/projects/${project.slug}`}>Open Project</Link>
                </Button>
              ) : userHasAccess ? (
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/projects/${project.slug}`}>View Board</Link>
                </Button>
              ) : isAuthenticated ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setRequestOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Request Access
                </Button>
              ) : (
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/login">Login to Request Access</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Access to {project.name}</DialogTitle>
            <DialogDescription>
              Send a request to the project owner. They will be notified and can approve or reject your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add a message to your request (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleRequestAccess} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ExplorePage() {
  const [search, setSearch] = useState('');
  const { publicProjects, isLoading, fetchPublicProjects } = useProjectsStore();

  useEffect(() => {
    fetchPublicProjects();
  }, [fetchPublicProjects]);

  const filteredProjects = publicProjects.filter(
    (p: Project) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <ExploreSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Explore Public Projects</h1>
        <p className="text-muted-foreground">
          Discover open source projects and request access to contribute
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search public projects..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: Project) => (
            <ExploreProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
