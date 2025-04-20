'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { usePostHog } from 'posthog-js/react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [referrer, setReferrer] = useState<string>('');

  // Get page load time and referrer on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get referrer information
      setReferrer(document.referrer || '');

      // Get page load time using Performance API
      if (window.performance && 'getEntriesByType' in window.performance) {
        const navEntries = window.performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          const navTiming = navEntries[0] as PerformanceNavigationTiming;
          setPageLoadTime(Math.round(navTiming.loadEventEnd - navTiming.startTime));
        }
      }
    }
  }, []);

  // Track pageviews with enhanced data
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }

      // Get page metadata
      const title = document.title;
      const isAuthenticated = !!localStorage.getItem('user_id');

      // Capture pageview with enhanced properties
      posthog.capture('$pageview', {
        $current_url: url,
        page_title: title,
        page_path: pathname,
        page_referrer: referrer,
        page_load_time: pageLoadTime,
        is_authenticated: isAuthenticated,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        query_params: Object.fromEntries(searchParams.entries()),
        timestamp: new Date().toISOString(),
      });

      // Reset scroll position tracking for the new page
      window.addEventListener('scroll', handleScroll, { passive: true, once: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [pathname, searchParams, posthog, pageLoadTime, referrer]);

  // Track when user starts scrolling
  const handleScroll = () => {
    if (posthog) {
      posthog.capture('page_scrolled', {
        page_path: pathname,
        scroll_position: window.scrollY,
        viewport_height: window.innerHeight,
        document_height: document.documentElement.scrollHeight,
      });
    }
  };

  return null;
}

// Wrap this in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
export default function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
