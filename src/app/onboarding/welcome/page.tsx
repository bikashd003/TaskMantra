'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

const WelcomePage = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user has pending invitations
  const {
    data: inviteData,
    error: inviteError,
    isLoading: inviteLoading,
  } = useQuery({
    queryKey: ['check-invites'],
    queryFn: async () => {
      const { data } = await axios.get('/api/onboarding/check-invites');
      return data;
    },
  });

  // Check if user is already part of an organization
  const {
    data: orgData,
    error: orgError,
    isLoading: orgLoading,
  } = useQuery({
    queryKey: ['check-organization'],
    queryFn: async () => {
      const { data } = await axios.get('/api/onboarding/check-organization');
      return data;
    },
  });

  // Show error toast if queries fail
  useEffect(() => {
    if (inviteError) {
      toast.error('Failed to check invites', {
        description: inviteError instanceof Error ? inviteError.message : 'Unknown error',
      });
    }
    if (orgError) {
      toast.error('Failed to check organization status', {
        description: orgError instanceof Error ? orgError.message : 'Unknown error',
      });
    }
  }, [inviteError, orgError]);

  // Determine user status
  const hasInvite = inviteData?.hasInvite;
  const isOrganizationMember = orgData?.isOrganizationMember;
  const isLoading = inviteLoading || orgLoading;

  // Handle navigation based on user status
  const handleGetStarted = () => {
    setIsRedirecting(true);

    if (isOrganizationMember) {
      // User is already part of an organization, go to home
      router.push('/home');
    } else if (hasInvite) {
      // User has pending invitations, go to invite page
      router.push('/invite/accept');
    } else {
      // User needs to create an organization
      router.push('/onboarding/organization');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className=" rounded-3xl border-0 shadow-2xl bg-[#1e293b] text-white">
          <div className="h-1"></div>

          {/* Logo */}
          <div className="flex justify-center -mt-12">
            <motion.div
              className="rounded-full bg-[#4f46e5] p-4 shadow-xl z-50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Building2 className="h-14 w-14 text-white" strokeWidth={1.5} />
            </motion.div>
          </div>

          <CardHeader className="pt-10 pb-6">
            <CardTitle className="text-5xl font-extrabold text-center text-white">
              Welcome to TaskMantra
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              {isLoading ? (
                <div className="flex justify-center items-center space-x-2 py-4">
                  <div className="w-3 h-3 rounded-full bg-[#4f46e5] animate-pulse"></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#4f46e5] animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full bg-[#4f46e5] animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-300 text-2xl font-light">
                    {isOrganizationMember
                      ? `You're already part of ${orgData?.organization?.name}`
                      : hasInvite
                        ? 'You have pending team invitations!'
                        : "Let's get started by setting up your workspace."}
                  </p>

                  {isOrganizationMember && (
                    <div className="bg-[#2d3748] rounded-lg p-4 border border-[#4f46e5]/30">
                      <p className="text-gray-300 text-sm">
                        You&apos;re a{' '}
                        <span className="font-semibold text-[#4f46e5]">
                          {orgData?.organization?.role}
                        </span>{' '}
                        in this organization
                      </p>
                    </div>
                  )}

                  {hasInvite && (
                    <div className="bg-[#2d3748] rounded-lg p-4 border border-[#4f46e5]/30">
                      <p className="text-gray-300 text-sm">
                        You have invitations waiting for your response
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <Button
              onClick={handleGetStarted}
              className="w-full py-6 text-lg font-medium rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              disabled={isLoading || isRedirecting}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Loading...
                </span>
              ) : isRedirecting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Redirecting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Continue
                  <ArrowRight className="ml-2 h-6 w-6" />
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        <motion.p
          className="text-center text-gray-400 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} TaskMantra. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
