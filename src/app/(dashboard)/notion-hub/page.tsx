'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  RefreshCw,
  Loader2,
  ArrowRight,
  Search,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useIntegrations } from '@/hooks/useIntegrations';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { NotionService } from '@/services/Notion.service';

export default function NotionHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { integrations, syncNotion } = useIntegrations();
  const notionIntegration = integrations.find(i => i.provider === 'notion');

  // Fetch Notion pages
  const {
    data: notionPages = [],
    isLoading: isPagesLoading,
    refetch: refetchPages,
  } = useQuery({
    queryKey: ['notion-pages'],
    queryFn: () => NotionService.getPages(),
    enabled: !!notionIntegration,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Import page mutation
  const importPageMutation = useMutation({
    mutationFn: (pageId: string) => NotionService.importPageAsTask(pageId),
    onSuccess: data => {
      toast.success('Page imported successfully', {
        description: data.message || 'The page has been added to your tasks',
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to import page: ${error.message}`);
    },
  });

  const isLoading = isPagesLoading;

  const handleSync = async () => {
    try {
      await syncNotion();
      toast.success('Notion data synced successfully');
      refetchPages();
    } catch (error) {
      toast.error('Failed to sync Notion data');
    }
  };

  const handleImportPage = (pageId: string) => {
    importPageMutation.mutate(pageId);
  };

  const filteredPages = notionPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!notionIntegration) {
    return (
      <div className="bg-white px-4 rounded-md py-8 h-full w-full flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Notion Not Connected</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You need to connect your Notion account before accessing the Notion Hub.
        </p>
        <Button onClick={() => router.push('/integrations')}>
          Go to Integrations
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white px-4 rounded-md py-2 h-full w-full overflow-y-auto custom-scrollbar"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Notion Hub
          </h2>
          <p className="text-muted-foreground mt-1">Manage your Notion integration and content</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search Notion content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white shadow-sm border-muted"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={isLoading}
            className="h-10 w-10 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {notionIntegration && (
        <div className="mb-6 bg-muted/20 p-4 rounded-lg border border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">
                  {notionIntegration.workspaceName || 'Notion Workspace'}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Last synced:{' '}
                {notionIntegration.lastSyncedAt
                  ? formatDistanceToNow(new Date(notionIntegration.lastSyncedAt), {
                      addSuffix: true,
                    })
                  : 'Never'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/integrations')}
            className="text-sm"
          >
            <Settings className="mr-2 h-3.5 w-3.5" />
            Manage Integration
          </Button>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span>Pages ({filteredPages.length})</span>
          </div>
        </div>

        <div className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card
                  key={i}
                  className="overflow-hidden border border-border/40 bg-white shadow-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/20">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-border/20 shadow-sm">
              <div className="mx-auto bg-muted/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">No pages found</p>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `No pages match your search for "${searchQuery}"`
                  : "You don't have any Notion pages available"}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')} className="px-6">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPages.map(page => (
                <Card
                  key={page.id}
                  className="overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardHeader className="pb-4 border-b border-border/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 rounded-xl shadow-sm">
                          <span className="text-lg">{page.icon || '📄'}</span>
                        </div>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        Updated{' '}
                        {formatDistanceToNow(new Date(page.lastUpdated), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/20 flex flex-col gap-2">
                    <Button className="w-full" onClick={() => handleImportPage(page.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Import as Task
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(page.url, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Notion
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
