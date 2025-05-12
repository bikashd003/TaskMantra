'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Database,
  ListTodo,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Layers,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '../Global/Modal';
import { Badge } from '@/components/ui/badge';

interface IntegrationFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

interface IntegrationOnboardingProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  providerName: string;
  workspaceName?: string;
}

const notionFeatures: IntegrationFeature[] = [
  {
    title: 'Import Pages',
    description: 'Import your Notion pages directly into TaskMantra as tasks or notes.',
    icon: FileText,
  },
  {
    title: 'Database Sync',
    description: 'Connect your Notion databases to automatically create and update tasks.',
    icon: Database,
  },
  {
    title: 'Task Management',
    description: 'Create, update, and track tasks in Notion from within TaskMantra.',
    icon: ListTodo,
  },
];

const providerFeatures: Record<string, IntegrationFeature[]> = {
  notion: notionFeatures,
};

export function IntegrationOnboarding({
  isOpen,
  onOpenChange,
  provider,
  providerName,
  workspaceName,
}: IntegrationOnboardingProps) {
  const [activeTab, setActiveTab] = useState('features');
  const router = useRouter();

  const features = providerFeatures[provider] || [];

  const handleExplore = () => {
    onOpenChange(false);
    if (provider === 'notion') {
      router.push('/notion-hub');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onOpenChange(false)} size="lg">
      <div className="p-1">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-3 rounded-xl shadow-sm">
              {provider === 'notion' && <FileText className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{providerName} Connected!</h2>
                <Badge
                  variant="default"
                  className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Success
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {workspaceName
                  ? `Connected to "${workspaceName}"`
                  : `Your ${providerName} account is now connected`}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="features">
              <Lightbulb className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="getStarted">
              <BookOpen className="h-4 w-4 mr-2" />
              Get Started
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="features"
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-border/40 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2 rounded-lg">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="getStarted"
            className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <div className="bg-muted/30 p-5 rounded-xl space-y-4 border border-border/50">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Start Guide
              </h4>

              {provider === 'notion' && (
                <ol className="space-y-4 list-decimal pl-5">
                  <li className="text-sm">
                    <span className="font-medium">Import your first page</span>
                    <p className="text-muted-foreground mt-1">
                      Go to the Notion Hub and select a page to import as a task or note.
                    </p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Connect a database</span>
                    <p className="text-muted-foreground mt-1">
                      Link a Notion database to automatically create and track tasks.
                    </p>
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Set up sync preferences</span>
                    <p className="text-muted-foreground mt-1">
                      Configure how often you want TaskMantra to sync with your Notion workspace.
                    </p>
                  </li>
                </ol>
              )}
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5 rounded-xl space-y-3 border border-primary/20">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h4 className="font-medium">What's Next?</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Explore the {providerName} Hub to see all available features and start integrating
                your content.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button onClick={handleExplore} className="group">
                  Explore {providerName} Hub
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Later
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/20">
          <a
            href={provider === 'notion' ? 'https://www.notion.so/' : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary flex items-center hover:underline"
          >
            Open {providerName}
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>

          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="px-4">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
