'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

interface UserProperties {
  email?: string;
  name?: string;
  role?: string;
  plan?: string;
  [key: string]: any;
}

/**
 * Custom hook for PostHog user identification and tracking
 *
 * This hook provides methods to identify users and track user properties
 * in PostHog analytics.
 */
export function usePostHogUser() {
  const posthog = usePostHog();
  const isProduction = process.env.NODE_ENV === 'production';

  /**
   * Identify a user in PostHog
   *
   * @param userId - Unique identifier for the user
   * @param userProperties - Properties to associate with the user
   */
  const identifyUser = useCallback(
    (userId: string, userProperties: UserProperties = {}) => {
      if (isProduction && posthog) {
        // Store the user ID in localStorage for persistence
        localStorage.setItem('user_id', userId);

        // Identify the user in PostHog
        posthog.identify(userId, userProperties);

        // Set user properties as person properties in PostHog
        posthog.people.set(userProperties);

        // Capture an identify event for better tracking
        posthog.capture('user_identified', {
          distinct_id: userId,
          ...userProperties,
        });
      }
    },
    [posthog, isProduction]
  );

  /**
   * Update user properties in PostHog
   *
   * @param properties - User properties to update
   */
  const updateUserProperties = useCallback(
    (properties: UserProperties) => {
      if (isProduction && posthog) {
        posthog.people.set(properties);
      }
    },
    [posthog, isProduction]
  );

  /**
   * Track a user action or event
   *
   * @param eventName - Name of the event to track
   * @param properties - Properties to associate with the event
   */
  const trackEvent = useCallback(
    (eventName: string, properties: Record<string, any> = {}) => {
      if (isProduction && posthog) {
        posthog.capture(eventName, properties);
      }
    },
    [posthog, isProduction]
  );

  /**
   * Reset the current user's identity
   * Use this when a user logs out
   */
  const resetUser = useCallback(() => {
    if (isProduction && posthog) {
      posthog.reset();
      localStorage.removeItem('user_id');
    }
  }, [posthog, isProduction]);

  /**
   * Check if a feature flag is enabled for the current user
   *
   * @param flagKey - The feature flag key to check
   * @param defaultValue - Default value if the flag is not found
   */
  const isFeatureEnabled = useCallback(
    (flagKey: string, defaultValue: boolean = false) => {
      if (isProduction && posthog) {
        return posthog.isFeatureEnabled(flagKey) ?? defaultValue;
      }
      return defaultValue;
    },
    [posthog, isProduction]
  );

  return {
    identifyUser,
    updateUserProperties,
    trackEvent,
    resetUser,
    isFeatureEnabled,
  };
}
