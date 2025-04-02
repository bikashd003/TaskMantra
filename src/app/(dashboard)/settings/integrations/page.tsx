"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, ExternalLink, Github, Gitlab, Slack, Trello, Calendar, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("available");
  
  // Mock data for connected and available integrations
  const connectedIntegrations = [
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications and updates to your Slack channels.",
      icon: Slack,
      status: "Connected",
      lastSync: "2 hours ago",
      workspace: "TaskMantra Team",
    },
    {
      id: "github",
      name: "GitHub",
      description: "Link GitHub issues and pull requests to your tasks.",
      icon: Github,
      status: "Connected",
      lastSync: "1 day ago",
      repository: "taskmantra/app",
    },
    {
      id: "trello",
      name: "Trello",
      description: "Import boards and cards from Trello.",
      icon: Trello,
      status: "Connected",
      lastSync: "3 days ago",
      boards: 2,
    },
  ];

  const availableIntegrations = [
    {
      id: "gitlab",
      name: "GitLab",
      description: "Link GitLab issues and merge requests to your tasks.",
      icon: Gitlab,
      popular: true,
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your tasks with Google Calendar.",
      icon: Calendar,
      popular: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Import pages and databases from Notion.",
      icon: FileText,
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">
          Connect TaskMantra with your favorite tools and services
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Integration Limit</AlertTitle>
        <AlertDescription>
          Your current plan allows up to 5 integrations. You are using 3 of 5.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableIntegrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 p-2 rounded-md">
                    <integration.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {integration.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Last Synced</p>
                    <p className="text-sm text-muted-foreground">{integration.lastSync}</p>
                  </div>
                  {integration.workspace && (
                    <div>
                      <p className="text-sm font-medium">Workspace</p>
                      <p className="text-sm text-muted-foreground">{integration.workspace}</p>
                    </div>
                  )}
                  {integration.repository && (
                    <div>
                      <p className="text-sm font-medium">Repository</p>
                      <p className="text-sm text-muted-foreground">{integration.repository}</p>
                    </div>
                  )}
                  {integration.boards && (
                    <div>
                      <p className="text-sm font-medium">Boards</p>
                      <p className="text-sm text-muted-foreground">{integration.boards} boards connected</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm">Configure</Button>
                <Button variant="destructive" size="sm">Disconnect</Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => (
              <Card key={integration.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    {integration.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{integration.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Automatic synchronization</li>
                    <li>Two-way updates</li>
                    <li>Custom notifications</li>
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button className="w-full">Connect</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold">Integration Settings</h3>
          <p className="text-muted-foreground">Configure global settings for all integrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Synchronization</CardTitle>
            <CardDescription>
              Control how and when your integrations sync data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Automatic Synchronization</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync data from connected integrations
                </p>
              </div>
              <Switch id="auto-sync" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  How often to sync data from integrations
                </p>
              </div>
              <div className="w-[180px]">
                <select
                  id="sync-frequency"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  defaultValue="30"
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                  <option value="360">Every 6 hours</option>
                  <option value="720">Every 12 hours</option>
                  <option value="1440">Once a day</option>
                </select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Integration Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about integration activities
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>
              Manage API keys for custom integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  type="password"
                  value="sk_live_51NZgLpGjsRDk5XyZ..."
                  readOnly
                  className="font-mono"
                />
                <Button variant="outline">Copy</Button>
                <Button variant="outline">Regenerate</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this key to access the TaskMantra API from your custom integrations.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Badge variant="outline">Pro Feature</Badge>
              </div>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhook"
              />
              <p className="text-sm text-muted-foreground">
                Receive real-time updates when changes occur in TaskMantra.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="flex items-start space-x-4">
            <div className="bg-slate-100 p-2 rounded-full">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-medium">Need a custom integration?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We can build custom integrations for your specific needs. Contact our team to discuss your requirements.
              </p>
              <Button variant="link" className="p-0 h-auto mt-2 flex items-center" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Learn more <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}