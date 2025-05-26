'use client';

import React, { useState } from 'react';
import {
  FileText,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
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
import { EmptyState } from '@/components/Global/EmptyState';
import { LoadingSpinner } from '@/components/Global/LoadingSpinner';

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};
const ConnectedIntegrationCard = ({
  integration,
  index,
  onDisconnect,
  onSync,
  onOpenHub,
}: {
  integration: any;
  index: number;
  onDisconnect: () => void;
  onSync: () => void;
  onOpenHub?: () => void;
}) => {
  const integrationMeta =
    AVAILABLE_INTEGRATIONS[integration.provider as keyof typeof AVAILABLE_INTEGRATIONS];
  if (!integrationMeta) return null;

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
      <Card className="theme-surface-elevated hover-reveal glow-on-hover h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-border/20">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <integrationMeta.icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base theme-text-primary">{integrationMeta.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="status-indicator-completed text-xs">
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-3 flex-grow">
          <p className="text-sm theme-text-secondary mb-4">{integrationMeta.description}</p>
          <div className="space-y-2 theme-surface p-3 rounded-md border border-border/20">
            <div className="flex justify-between text-xs">
              <span className="theme-text-secondary font-medium">Last synced</span>
              <span className="theme-text-primary font-medium">
                {integration.lastSyncedAt
                  ? formatDistanceToNow(new Date(integration.lastSyncedAt), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
            {integration.workspaceName && (
              <div className="flex justify-between text-xs">
                <span className="theme-text-secondary font-medium">Workspace</span>
                <span
                  className="theme-text-primary font-medium truncate max-w-[120px]"
                  title={integration.workspaceName}
                >
                  {integration.workspaceName}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-3 gap-2 border-t border-border/20">
          <div className="flex justify-between w-full gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 theme-button-ghost"
              onClick={onDisconnect}
            >
              <X className="mr-1 h-3 w-3" />
              Disconnect
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 theme-button-ghost"
              onClick={onSync}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Sync
            </Button>
          </div>
          {integration.provider === 'notion' && onOpenHub && (
            <Button
              variant="default"
              size="sm"
              className="w-full theme-button-primary"
              onClick={onOpenHub}
            >
              <ArrowRight className="mr-1 h-3 w-3" />
              Open Notion Hub
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const AvailableIntegrationCard = ({
  integration,
  index,
  onConnect,
}: {
  integration: any;
  index: number;
  onConnect: () => void;
}) => (
  <motion.div
    key={integration.id}
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
  >
    <Card className="theme-surface-elevated hover-reveal glow-on-hover h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <integration.icon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base theme-text-primary">{integration.name}</CardTitle>
          </div>
          {integration.popular && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-grow">
        <p className="text-sm theme-text-secondary">{integration.description}</p>
        {integration.category && (
          <div className="mt-3">
            <Badge variant="outline" className="theme-surface text-xs">
              {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t border-border/20">
        <Button
          variant={integration.available ? 'default' : 'outline'}
          className={`w-full text-sm ${integration.available ? 'theme-button-primary' : 'theme-button-ghost'}`}
          disabled={!integration.available}
          onClick={onConnect}
        >
          {integration.available ? (
            <>
              <Plus className="mr-1 h-3 w-3" />
              Connect
            </>
          ) : (
            'Coming Soon'
          )}
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('available');
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { integrations, isLoading, error, syncNotion, disconnectNotion } = useIntegrations();
  const connectedIntegrations = integrations || [];

  const connectedProviders = new Set(connectedIntegrations.map((i: any) => i.provider));
  const getFilteredIntegrations = () => {
    const available = Object.values(AVAILABLE_INTEGRATIONS).filter(
      integration =>
        !connectedProviders.has(integration.id) &&
        (searchQuery === '' ||
          integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          integration.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const connected = connectedIntegrations.filter(
      (integration: any) =>
        searchQuery === '' ||
        integration.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        AVAILABLE_INTEGRATIONS[integration.provider]?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    return { available, connected };
  };

  const { available: availableIntegrations, connected: filteredConnectedIntegrations } =
    getFilteredIntegrations();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="theme-surface px-3 rounded-lg py-2 h-full w-full overflow-y-auto custom-scrollbar"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Integrations</h2>
          <p className="theme-text-secondary mt-1 text-sm">
            Connect your favorite tools and services
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-secondary h-4 w-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 theme-input text-sm"
          />
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/20 pb-3">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="connected" className="text-sm">
              Connected ({filteredConnectedIntegrations.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="text-sm">
              Available ({availableIntegrations.length})
            </TabsTrigger>
          </TabsList>

          <div className="hidden sm:flex items-center gap-2 text-xs theme-text-secondary">
            <Filter className="h-3 w-3" />
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
          className="space-y-6 mt-4 focus-visible:outline-none focus-visible:ring-0"
        >
          <AnimatePresence>
            {isLoading ? (
              <LoadingSpinner
                variant="dots"
                size="md"
                color="primary"
                label="Loading your integrations..."
                showLabel={true}
              />
            ) : error ? (
              <EmptyState
                type="error"
                title="Failed to load integrations"
                description="We couldn't fetch your connected integrations. Please try again."
                actions={[
                  {
                    label: 'Retry',
                    onClick: () => window.location.reload(),
                    icon: <RefreshCw className="h-3 w-3" />,
                  },
                ]}
                size="md"
                animated={true}
              />
            ) : filteredConnectedIntegrations.length === 0 ? (
              searchQuery ? (
                <EmptyState
                  type="search"
                  title="No matching integrations"
                  description={`No connected integrations match your search for "${searchQuery}"`}
                  actions={[
                    {
                      label: 'Clear search',
                      onClick: () => setSearchQuery(''),
                      variant: 'outline',
                    },
                  ]}
                  size="md"
                  animated={true}
                />
              ) : (
                <EmptyState
                  type="custom"
                  icon={<Plus className="w-full h-full" />}
                  title="No connected integrations yet"
                  description="Get started by connecting your first integration from our available options"
                  actions={[
                    {
                      label: 'Browse Available Integrations',
                      onClick: () => setActiveTab('available'),
                      icon: <ArrowRight className="h-3 w-3" />,
                    },
                  ]}
                  size="md"
                  animated={true}
                />
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredConnectedIntegrations.map((integration: any, i: number) => (
                  <ConnectedIntegrationCard
                    key={integration.id}
                    integration={integration}
                    index={i}
                    onDisconnect={() => {
                      if (integration.provider === 'notion') {
                        disconnectNotion();
                      } else {
                        const integrationMeta =
                          AVAILABLE_INTEGRATIONS[
                            integration.provider as keyof typeof AVAILABLE_INTEGRATIONS
                          ];
                        toast.info(
                          `Disconnecting ${integrationMeta?.name} will be available soon.`
                        );
                      }
                    }}
                    onSync={() => {
                      if (integration.provider === 'notion') {
                        syncNotion();
                      } else {
                        const integrationMeta =
                          AVAILABLE_INTEGRATIONS[
                            integration.provider as keyof typeof AVAILABLE_INTEGRATIONS
                          ];
                        toast.info(`Syncing ${integrationMeta?.name} will be available soon.`);
                      }
                    }}
                    onOpenHub={
                      integration.provider === 'notion'
                        ? () => router.push('/notion-hub')
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent
          value="available"
          className="space-y-6 mt-4 focus-visible:outline-none focus-visible:ring-0"
        >
          <AnimatePresence>
            {/* Featured Integration - Notion */}
            {!connectedProviders.has('notion') && searchQuery === '' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <h3 className="text-base font-medium mb-3 flex items-center theme-text-primary">
                  <Badge
                    variant="outline"
                    className="mr-2 bg-amber-50 text-amber-700 border-amber-200 text-xs"
                  >
                    Featured
                  </Badge>
                  <span>Recommended for you</span>
                </h3>
                <Card className="theme-surface-elevated hover-reveal glow-on-hover border-2 border-primary/20">
                  <div className="bg-primary/5 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="theme-surface p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold theme-text-primary">Notion</h3>
                        <p className="text-xs theme-text-secondary mt-1">
                          Import pages and databases from Notion
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                      Most Popular
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['Import pages', 'Database sync', 'Two-way sync', 'Auto-conversion'].map(
                        feature => (
                          <div key={feature} className="flex items-center">
                            <Check className="h-3 w-3 text-success mr-2" />
                            <span className="theme-text-secondary">{feature}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/20 theme-surface p-3">
                    <a
                      href="https://www.notion.so/my-integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center hover:underline theme-transition"
                    >
                      Learn more
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <Button
                      onClick={() => setIsNotionModalOpen(true)}
                      size="sm"
                      className="group theme-button-primary"
                    >
                      <Plus className="mr-1 h-3 w-3 group-hover:rotate-90 theme-transition" />
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
                  <h3 className="text-base font-medium mb-4 flex items-center theme-text-primary">
                    <Badge
                      variant="outline"
                      className="mr-2 bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      Explore
                    </Badge>
                    <span>Available Integrations</span>
                  </h3>
                )}
                {searchQuery !== '' && (
                  <div className="mb-4">
                    <h3 className="text-base font-medium flex items-center theme-text-primary">
                      <SearchIcon className="h-4 w-4 mr-2 theme-text-secondary" />
                      <span>Search results for "{searchQuery}"</span>
                    </h3>
                    <p className="text-xs theme-text-secondary mt-1">
                      Found {availableIntegrations.length} integration
                      {availableIntegrations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <LoadingSpinner
                    variant="dots"
                    size="md"
                    color="primary"
                    label="Loading integrations..."
                    showLabel={true}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableIntegrations
                      .filter(
                        integration =>
                          integration.id !== 'notion' ||
                          connectedProviders.has('notion') ||
                          searchQuery !== ''
                      )
                      .map((integration, i) => (
                        <AvailableIntegrationCard
                          key={integration.id}
                          integration={integration}
                          index={i}
                          onConnect={() => {
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
                        />
                      ))}
                  </div>
                )}
              </div>
            ) : searchQuery !== '' ? (
              <EmptyState
                type="search"
                title="No matching integrations"
                description={`No available integrations match your search for "${searchQuery}"`}
                actions={[
                  {
                    label: 'Clear search',
                    onClick: () => setSearchQuery(''),
                    variant: 'outline',
                  },
                ]}
                size="md"
                animated={true}
              />
            ) : null}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Notion Connect Modal */}
      <NotionConnectModal isOpen={isNotionModalOpen} onOpenChange={setIsNotionModalOpen} />
    </motion.div>
  );
}
