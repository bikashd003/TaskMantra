'use client';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import { Menu } from 'lucide-react';
import { ProjectProvider } from '@/context/ProjectContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (status === 'loading') return;
      if (!session) {
        router.push('/auth');
        setIsChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/onboarding/status');
        const data = await res.json();

        if (!data.hasCompletedOnboarding) {
          router.push('/onboarding/welcome');
        } else {
          setHasCompletedOnboarding(true);
        }
      } catch (error: any) {
        toast.error('Something went wrong. Please try again.', {
          description: 'Error: ' + error.message,
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [session, status, router]);

  if (status === 'loading' || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen theme-surface">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute w-full h-full border-4 border-primary/20 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TaskMantra
          </h3>
          <p className="text-sm theme-text-secondary animate-pulse">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated or onboarding incomplete, redirect will handle it; don't render layout
  if (!session || !hasCompletedOnboarding) return null;

  return (
    <ProjectProvider>
      <div className="flex h-screen overflow-hidden theme-surface">
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 theme-surface-elevated theme-shadow-sm z-30 px-4">
          <div className="h-full flex items-center">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 theme-button-ghost rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 theme-text-primary" />
            </button>
          </div>
        </header>
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col pt-16 md:pt-2 px-2">
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden py-2">
            <div className="h-full">{children}</div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
