'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, ReactNode } from 'react';
import PostHogPageView from '@/app/PostHogPageView';
import { usePathname } from 'next/navigation';

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  // Enable PostHog in production and staging environments
  const isProduction = process.env.NODE_ENV === 'production';
  const pathname = usePathname();

  useEffect(() => {
    // Skip PostHog initialization in development
    if (!isProduction) return;

    // Initialize PostHog with enhanced configuration
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // We'll handle pageviews manually for more control
      capture_pageleave: true, // Track when users leave pages
      autocapture: true, // Automatically capture clicks, form submissions, etc.
      session_recording: {
        maskAllInputs: false, // Only mask sensitive inputs
        maskInputOptions: {
          password: true,
          email: false, // Don't mask emails to track user journeys better
          number: false, // Don't mask numbers
        },
        maskTextSelector: '[data-ph-mask]', // Custom selector for text masking
      },
      property_blacklist: ['password', 'credit_card', 'token', 'secret'],
      respect_dnt: true, // Respect Do Not Track browser settings
      loaded: posthog => {
        // Add global properties to all events
        posthog.register({
          app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          app_name: 'TaskMantra',
          environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
        });

        // Set up error tracking
        window.addEventListener('error', event => {
          posthog.capture('error', {
            error_message: event.message,
            error_type: event.error?.name || 'Unknown',
            error_stack: event.error?.stack || 'No stack trace',
            url: window.location.href,
            component: pathname,
          });
        });

        // Track performance metrics using modern API
        if (window.performance && 'getEntriesByType' in window.performance) {
          setTimeout(() => {
            const navigationEntries = window.performance.getEntriesByType('navigation');
            if (navigationEntries.length > 0) {
              const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
              posthog.capture('performance_metrics', {
                page_load_time: navEntry.loadEventEnd - navEntry.startTime,
                dom_ready_time: navEntry.domComplete - navEntry.domInteractive,
                ttfb: navEntry.responseStart - navEntry.requestStart,
                url: window.location.href,
              });
            }
          }, 0);
        }
      },
      bootstrap: {
        distinctID: localStorage.getItem('user_id') || undefined,
        isIdentifiedID: !!localStorage.getItem('user_id'),
        featureFlags: {}, // Will be populated from server
      },
      opt_in_site_apps: true, // Enable PostHog apps
      enable_recording_console_log: true, // Record console logs in session recordings
    });

    // Clean up function
    return () => {
      // No explicit cleanup needed for PostHog
    };
  }, [isProduction, pathname]);

  // Note: We'll create a separate hook for user identification
  // that can be imported and used throughout the app

  // In development, just render children without PostHog
  if (!isProduction) {
    return <>{children}</>;
  }

  // In production, use PostHog
  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
