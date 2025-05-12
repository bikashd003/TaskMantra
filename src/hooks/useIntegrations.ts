import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntegrationService } from '@/services/Integration.service';
import { toast } from 'sonner';

export function useIntegrations() {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => IntegrationService.getIntegrations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const connectMutation = useMutation({
    mutationFn: ({ provider, data }: { provider: string; data: any }) => {
      setIsConnecting(true);
      return IntegrationService.connectIntegration(provider, data);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setIsConnecting(false);
      toast.success(data.message || 'Integration connected successfully');
    },
    onError: (error: Error) => {
      setIsConnecting(false);
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (provider: string) => IntegrationService.disconnectIntegration(provider),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success(data.message || 'Integration disconnected successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  const syncMutation = useMutation({
    mutationFn: (provider: string) => IntegrationService.syncIntegration(provider),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success(data.message || 'Data synced successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync: ${error.message}`);
    },
  });

  const connectNotion = async (
    accessToken: string,
    workspaceId?: string,
    workspaceName?: string
  ) => {
    const connectionData = {
      accessToken,
      workspaceId,
      workspaceName,
    };

    return connectMutation.mutate({
      provider: 'notion',
      data: connectionData,
    });
  };

  const disconnectNotion = async () => {
    return disconnectMutation.mutate('notion');
  };

  const syncNotion = async () => {
    return syncMutation.mutate('notion');
  };

  return {
    integrations: data?.integrations || [],
    isLoading,
    error,
    refetch,
    isConnecting,
    connectNotion,
    disconnectNotion,
    syncNotion,
  };
}
