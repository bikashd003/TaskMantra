import { useState, useEffect } from 'react';
import axios from 'axios';

interface UsageStats {
  projects: {
    used: number;
    limit: number;
    percentage: number;
    isUnlimited: boolean;
  };
  tasks: {
    used: number;
    limit: number;
    percentage: number;
    isUnlimited: boolean;
  };
  teamMembers: {
    used: number;
    limit: number;
    percentage: number;
    isUnlimited: boolean;
  };
  apiCalls: {
    used: number;
    limit: number;
    percentage: number;
    resetDate: Date;
  };
  organization: {
    name: string;
    ownerId: string;
    memberCount: number;
    createdAt: Date;
  };
}

interface UsageHistoryItem {
  month: string;
  year: number;
  date: Date;
  projects: {
    used: number;
    limit: number;
  };
  teamMembers: {
    used: number;
    limit: number;
  };
  storage: {
    used: number;
    limit: number;
  };
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface UsageStatsResponse {
  success: boolean;
  stats: UsageStats;
  usageHistory: UsageHistoryItem[];
  recommendations: Recommendation[];
  lastUpdated: Date;
}

export function useUsageStats() {
  const [data, setData] = useState<UsageStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('/api/usage/stats');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const refetch = () => {
    fetchUsageStats();
  };

  // Helper functions
  const getUsageColor = (percentage: number, isUnlimited: boolean = false) => {
    if (isUnlimited) return 'text-green-600';
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageStatus = (percentage: number, isUnlimited: boolean = false) => {
    if (isUnlimited) return 'Unlimited';
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'Warning';
    return 'Good';
  };

  const formatUsageText = (used: number, limit: number, isUnlimited: boolean = false) => {
    if (isUnlimited) {
      return `${used} (Unlimited)`;
    }
    return `${used} of ${limit}`;
  };

  const getProgressValue = (used: number, limit: number, isUnlimited: boolean = false) => {
    if (isUnlimited) {
      // For unlimited resources, show a small progress based on usage
      return Math.min((used / 10) * 100, 100);
    }
    return Math.min((used / limit) * 100, 100);
  };

  return {
    data,
    stats: data?.stats || null,
    usageHistory: data?.usageHistory || [],
    recommendations: data?.recommendations || [],
    isLoading,
    error,
    refetch,
    lastUpdated: data?.lastUpdated,

    // Helper functions
    getUsageColor,
    getUsageStatus,
    formatUsageText,
    getProgressValue,
  };
}
