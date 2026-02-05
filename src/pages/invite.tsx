import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, Check, X, Loader2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { get, post, getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  project: {
    id: string;
    name: string;
    description?: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthStore();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setIsLoading(false);
        return;
      }

      try {
        const response = await get<{ success: boolean; invitation: Invitation }>(`/invitations/${token}`);
        setInvitation(response.invitation);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !isAuthenticated) return;

    setIsAccepting(true);
    try {
      const response = await post<{ success: boolean; message: string; projectId: string; projectSlug: string }>(`/invitations/${token}/accept`, {});
      toast.success('Invitation accepted! Welcome to the project.');
      navigate(`/projects/${response.projectSlug}`);
    } catch (err: any) {
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
    } finally {
      setIsAccepting(false);
    }
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const emailMismatch = isAuthenticated && user?.email.toLowerCase() !== invitation.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            {invitation.inviter.name} has invited you to join their project
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invitation.project.name}</span>
            </div>
            {invitation.project.description && (
              <p className="text-sm text-muted-foreground">
                {invitation.project.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{invitation.role}</Badge>
            </div>
          </div>

          {/* Expiry warning */}
          {isExpired ? (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>This invitation has expired</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Expires {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Email mismatch warning */}
          {emailMismatch && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Email mismatch</p>
                <p className="text-xs">
                  This invitation was sent to <strong>{invitation.email}</strong>,
                  but you're logged in as <strong>{user?.email}</strong>.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {isExpired ? (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          ) : isAuthenticated ? (
            emailMismatch ? (
              <div className="w-full space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Please log in with <strong>{invitation.email}</strong> to accept this invitation.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">Switch Account</Link>
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
            )
          ) : (
            <div className="w-full space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Sign in or create an account to accept this invitation
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/login?redirect=/invite/${token}`}>Sign In</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to={`/signup?redirect=/invite/${token}`}>Sign Up</Link>
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default InvitePage;
