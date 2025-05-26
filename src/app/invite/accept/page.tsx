'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertCircle, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    name: string;
  };
  invitedAt: string;
}

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<InvitationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(`/invite/accept${token ? `?token=${token}` : ''}`);
      router.push(`/auth?callbackUrl=${callbackUrl}`);
      return;
    }

    async function fetchInvitation() {
      try {
        if (token) {
          const response = await fetch(`/api/invitations/accept?token=${token}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch invitation details');
          }

          if (!data.invitation) {
            throw new Error('No invitation data returned');
          }

          setInvitation(data.invitation);
        } else {
          // No token - fetch pending invitations using the accept endpoint
          const response = await fetch('/api/invitations/accept');
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch pending invitations');
          }

          // Check if we got a single invitation or multiple invitations
          if (data.invitation) {
            // Single invitation
            setInvitation(data.invitation);
          } else if (data.invitations && data.invitations.length > 0) {
            // Multiple invitations
            setPendingInvitations(data.invitations);
          } else {
            setError('No pending invitations found for your email address');
            setLoading(false);
            return;
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token, status, router]);

  const handleAccept = async (invitationId?: string) => {
    const targetInvitation = invitationId
      ? pendingInvitations.find(inv => inv.id === invitationId)
      : invitation;

    if (!targetInvitation) return;

    setAccepting(true);
    if (invitationId) {
      setAcceptingId(invitationId);
    }

    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token || invitationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept invitation');
      }

      setSuccess(true);
      toast({
        title: 'Invitation Accepted',
        description: `You have joined ${targetInvitation.organization.name}`,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
      setAcceptingId(null);
    }
  };

  const handleDecline = () => {
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center theme-bg-primary">
        <Card className="w-full max-w-md theme-surface-elevated theme-shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="theme-text-primary">Loading Invitation</CardTitle>
            <CardDescription className="theme-text-secondary">
              Please wait while we fetch your invitation details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center theme-bg-primary">
        <Card className="w-full max-w-md theme-surface-elevated theme-shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              Invitation Error
            </CardTitle>
            <CardDescription className="theme-text-secondary">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {!token && (
              <div className="theme-surface-secondary p-4 rounded-lg theme-border">
                <p className="text-sm theme-text-secondary">
                  If you received an invitation email, please click the link in the email to access
                  your invitation.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/home')} className="theme-button-primary">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center theme-bg-primary">
        <Card className="w-full max-w-md theme-surface-elevated theme-shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Invitation Accepted
            </CardTitle>
            <CardDescription className="theme-text-secondary">
              You have successfully joined {invitation?.organization.name || 'the organization'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="theme-text-secondary">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingInvitations.length > 1) {
    return (
      <div className="flex min-h-screen items-center justify-center theme-bg-primary p-4">
        <Card className="w-full max-w-2xl theme-surface-elevated theme-shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="theme-text-primary flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Multiple Team Invitations
            </CardTitle>
            <CardDescription className="theme-text-secondary">
              You have {pendingInvitations.length} pending invitations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="theme-surface-secondary rounded-lg p-4 theme-border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="theme-text-secondary text-sm">
                      {inv.inviter.name} has invited you to join:
                    </p>
                    <h3 className="text-lg font-bold mt-1 theme-text-primary">
                      {inv.organization.name}
                    </h3>
                    <p className="text-sm theme-text-secondary mt-1">
                      Role: <span className="font-medium">{inv.role}</span>
                    </p>
                    <p className="text-xs theme-text-muted mt-1">
                      Invited on {new Date(inv.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(inv.id)}
                      disabled={accepting}
                      className="theme-button-primary"
                    >
                      {acceptingId === inv.id ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        'Accept'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md theme-border">
              <AlertCircle className="h-4 w-4" />
              <p>Make sure you recognize the people who sent these invitations.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={handleDecline} className="theme-button-secondary">
              Skip for now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center theme-bg-primary p-4">
      <Card className="w-full max-w-md theme-surface-elevated theme-shadow-lg">
        <CardHeader>
          <CardTitle className="theme-text-primary flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Team Invitation
          </CardTitle>
          <CardDescription className="theme-text-secondary">
            {token
              ? 'You have been invited to join a team on TaskMantra'
              : 'You have a pending invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation ? (
            <>
              <div className="rounded-lg theme-surface-secondary p-4 theme-border">
                <p className="font-medium theme-text-secondary text-sm">
                  {invitation.inviter.name} has invited you to join:
                </p>
                <h3 className="text-xl font-bold mt-2 theme-text-primary">
                  {invitation.organization.name}
                </h3>
                <p className="text-sm theme-text-secondary mt-1">
                  You will join as a <span className="font-medium">{invitation.role}</span>
                </p>
                {invitation.invitedAt && (
                  <p className="text-xs theme-text-muted mt-2">
                    Invited on {new Date(invitation.invitedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md theme-border">
                <AlertCircle className="h-4 w-4" />
                <p>Make sure you recognize the person who sent this invitation.</p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center theme-text-muted">No invitation details available</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={accepting}
            className="theme-button-secondary"
          >
            Decline
          </Button>
          <Button
            onClick={() => handleAccept()}
            disabled={!invitation || accepting}
            className="theme-button-primary"
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center theme-bg-primary">
          <Card className="w-full max-w-md theme-surface-elevated theme-shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="theme-text-primary">Loading Invitation</CardTitle>
              <CardDescription className="theme-text-secondary">
                Please wait while we load your invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
