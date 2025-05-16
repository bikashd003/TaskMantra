'use client';

import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Loader2,
  ArrowRight,
  SearchIcon,
  Filter,
  X,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotionConnectModal } from '@/components/Integrations/NotionConnectModal';
import { toast } from 'sonner';
import { useIntegrations } from '@/hooks/useIntegrations';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { AVAILABLE_INTEGRATIONS } from '@/constant/Integration';
import { useRouter } from 'next/navigation';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('available');
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { integrations, isLoading, error, syncNotion, disconnectNotion } = useIntegrations();
  const connectedIntegrations = integrations || [];

  const connectedProviders = new Set(connectedIntegrations.map(i => i.provider));
  const availableIntegrations = Object.values(AVAILABLE_INTEGRATIONS).filter(
    integration =>
      !connectedProviders.has(integration.id) &&
      (searchQuery === '' ||
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredConnectedIntegrations = connectedIntegrations.filter(
    integration =>
      searchQuery === '' ||
      integration.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      AVAILABLE_INTEGRATIONS[integration.provider]?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
            Integrations
          </h2>
          <p className="text-muted-foreground mt-1">Connect your favorite tools and services</p>
        </div>

        <div className="relative w-full sm:w-64 md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white shadow-sm border-muted"
          />
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-8" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="connected">
              Connected ({filteredConnectedIntegrations.length})
            </TabsTrigger>
            <TabsTrigger value="available">Available ({availableIntegrations.length})</TabsTrigger>
          </TabsList>

          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              Showing{' '}
              {activeTab === 'connected'
                ? filteredConnectedIntegrations.length
                : availableIntegrations.length}{' '}
              integrations
            </span>
          </div>
        </div>

        <TabsContent
          value="connected"
          className="space-y-8 mt-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-20 bg-white rounded-xl border border-border/20 shadow-sm"
              >
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <span className="text-muted-foreground font-medium">
                    Loading your integrations...
                  </span>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white rounded-xl border border-border/20 shadow-sm"
              >
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Failed to load integrations</p>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We couldn't fetch your connected integrations. Please try again.
                </p>
                <Button size="lg" onClick={() => window.location.reload()} className="px-8">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </motion.div>
            ) : filteredConnectedIntegrations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white rounded-xl border border-border/20 shadow-sm"
              >
                {searchQuery ? (
                  <>
                    <div className="mx-auto bg-muted/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <SearchIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">No matching integrations</p>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      No connected integrations match your search for "{searchQuery}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')} className="px-6">
                      Clear search
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium mb-2">No connected integrations yet</p>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Get started by connecting your first integration from our available options
                    </p>
                    <Button
                      size="lg"
                      onClick={() => setActiveTab('available')}
                      className="group px-8"
                    >
                      Browse Available Integrations
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredConnectedIntegrations.map((integration, i) => {
                  // Get integration metadata from our predefined list
                  const integrationMeta =
                    AVAILABLE_INTEGRATIONS[
                      integration.provider as keyof typeof AVAILABLE_INTEGRATIONS
                    ];
                  if (!integrationMeta) return null;

                  return (
                    <motion.div
                      key={integration.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                        <CardHeader className="pb-4 border-b border-border/20">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 rounded-xl shadow-sm">
                                <integrationMeta.icon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-lg">{integrationMeta.name}</CardTitle>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Connected
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 flex-grow">
                          <p className="text-sm text-muted-foreground">
                            {integrationMeta.description}
                          </p>
                          <div className="mt-5 space-y-2.5 bg-muted/30 p-4 rounded-lg border border-border/20">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground font-medium">Last synced</span>
                              <span className="font-medium">
                                {integration.lastSyncedAt
                                  ? formatDistanceToNow(new Date(integration.lastSyncedAt), {
                                      addSuffix: true,
                                    })
                                  : 'Never'}
                              </span>
                            </div>
                            {integration.workspaceName && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Workspace</span>
                                <span
                                  className="font-medium truncate max-w-[150px]"
                                  title={integration.workspaceName}
                                >
                                  {integration.workspaceName}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pt-4 gap-3 border-t border-border/20">
                          <div className="flex justify-between w-full gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 hover:bg-muted/50"
                              onClick={() => {
                                if (integration.provider === 'notion') {
                                  disconnectNotion();
                                } else {
                                  toast.info(
                                    `Disconnecting ${integrationMeta.name} will be available soon.`
                                  );
                                }
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Disconnect
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 hover:bg-muted/50"
                              onClick={() => {
                                if (integration.provider === 'notion') {
                                  syncNotion();
                                } else {
                                  toast.info(
                                    `Syncing ${integrationMeta.name} will be available soon.`
                                  );
                                }
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync
                            </Button>
                          </div>

                          {integration.provider === 'notion' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => router.push('/notion-hub')}
                            >
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Open Notion Hub
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent
          value="available"
          className="space-y-10 mt-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <AnimatePresence>
            {/* Featured Integration - Notion */}
            {!connectedProviders.has('notion') && searchQuery === '' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Badge
                    variant="outline"
                    className="mr-3 bg-amber-50 text-amber-700 border-amber-200 font-medium"
                  >
                    Featured
                  </Badge>
                  <span>Recommended for you</span>
                </h3>
                <Card className="overflow-hidden border-2 border-primary/20 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                  <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Notion</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Import pages and databases from Notion
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-primary text-white font-medium px-2 py-1 text-xs"
                    >
                      Most Popular
                    </Badge>
                  </div>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-2" />
                        <span>Import pages</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-2" />
                        <span>Database sync</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-2" />
                        <span>Two-way sync</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-emerald-600 mr-2" />
                        <span>Auto-conversion</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/10 p-4">
                    <a
                      href="https://www.notion.so/my-integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center hover:underline"
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <Button onClick={() => setIsNotionModalOpen(true)} size="sm" className="group">
                      <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                      Connect Notion
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
            {/* Other Available Integrations */}
            {availableIntegrations.length > 0 ? (
              <div>
                {searchQuery === '' && (
                  <h3 className="text-lg font-medium mb-6 flex items-center">
                    <Badge
                      variant="outline"
                      className="mr-3 bg-blue-50 text-blue-700 border-blue-200 font-medium"
                    >
                      Explore
                    </Badge>
                    <span>Available Integrations</span>
                  </h3>
                )}
                {searchQuery !== '' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium flex items-center">
                      <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Search results for "{searchQuery}"</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Found {availableIntegrations.length} integration
                      {availableIntegrations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-border/20 shadow-sm">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                      <span className="text-muted-foreground font-medium">
                        Loading integrations...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableIntegrations
                      .filter(
                        integration =>
                          integration.id !== 'notion' ||
                          connectedProviders.has('notion') ||
                          searchQuery !== ''
                      )
                      .map((integration, i) => (
                        <motion.div
                          key={integration.id}
                          custom={i}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Card className="overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                            <CardHeader className="pb-4 border-b border-border/20">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 rounded-xl shadow-sm">
                                    <integration.icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                                </div>
                                {integration.popular && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                  >
                                    Popular
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-grow">
                              <p className="text-sm text-muted-foreground">
                                {integration.description}
                              </p>
                              {integration.category && (
                                <div className="mt-4">
                                  <Badge
                                    variant="outline"
                                    className="bg-muted/50 text-muted-foreground border-muted/70 font-normal"
                                  >
                                    {integration.category.charAt(0).toUpperCase() +
                                      integration.category.slice(1)}
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-border/20">
                              <Button
                                variant={integration.available ? 'default' : 'outline'}
                                className={`w-full group ${!integration.available ? 'bg-muted/30 hover:bg-muted/50' : ''}`}
                                disabled={!integration.available}
                                onClick={() => {
                                  if (integration.id === 'notion') {
                                    setIsNotionModalOpen(true);
                                  } else {
                                    toast.info(
                                      `${integration.name} integration will be available soon.`,
                                      {
                                        description: 'Check back later for updates.',
                                      }
                                    );
                                  }
                                }}
                              >
                                {integration.available ? (
                                  <>
                                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                                    Connect
                                  </>
                                ) : (
                                  'Coming Soon'
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            ) : searchQuery !== '' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white rounded-xl border border-border/20 shadow-sm"
              >
                <div className="mx-auto bg-muted/30 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">No matching integrations</p>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  No available integrations match your search for "{searchQuery}"
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')} className="px-6">
                  Clear search
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Notion Connect Modal */}
      <NotionConnectModal isOpen={isNotionModalOpen} onOpenChange={setIsNotionModalOpen} />
    </motion.div>
  );
}
