'use client';

import React, { useEffect, useState } from 'react';
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
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    // Wait for authentication to be ready
    if (status === 'loading') return;

    // Redirect to auth page if not authenticated
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(`/invite/accept?token=${token}`);
      router.push(`/auth?callbackUrl=${callbackUrl}`);
      return;
    }

    // Fetch invitation details
    async function fetchInvitation() {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        // Make sure to use the token parameter in the API request
        const response = await fetch(`/api/invitations/accept?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch invitation details');
        }

        if (!data.invitation) {
          throw new Error('No invitation data returned');
        }

        setInvitation(data.invitation);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token, status, router]);

  const handleAccept = async () => {
    if (!token || !invitation) return;

    setAccepting(true);

    try {
      // Make sure to send the token in the request body
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept invitation');
      }

      setSuccess(true);
      toast({
        title: 'Invitation Accepted',
        description: `You have joined ${invitation.organization.name}`,
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
    }
  };

  const handleDecline = () => {
    // Redirect to home page
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading Invitation</CardTitle>
            <CardDescription>Please wait while we fetch your invitation details</CardDescription>
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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              Invitation Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/home')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Invitation Accepted
            </CardTitle>
            <CardDescription>
              You have successfully joined {invitation?.organization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>You have been invited to join a team on TaskMantra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation ? (
            <>
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium">{invitation.inviter.name} has invited you to join:</p>
                <h3 className="text-xl font-bold mt-2">{invitation.organization.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You will join as a <span className="font-medium">{invitation.role}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p>Make sure you recognize the person who sent this invitation.</p>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No invitation details available
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDecline} disabled={accepting}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={!invitation || accepting}>
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
