"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function LimitsPage() {
  // Mock data - in a real app, this would come from your API
  const usageData = {
    projects: { used: 8, limit: 10, percentage: 80 },
    tasks: { used: 156, limit: 200, percentage: 78 },
    storage: { used: 2.4, limit: 5, percentage: 48 },
    teamMembers: { used: 3, limit: 5, percentage: 60 },
    apiCalls: { used: 4500, limit: 10000, percentage: 45 },
  };

  return (
    <div className="container mx-auto py-6 space-y-8 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usage & Limits</h2>
        <p className="text-muted-foreground">
          Monitor your resource usage and manage your plan limits
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Usage Details</TabsTrigger>
          <TabsTrigger value="plans">Plans & Upgrades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the Pro plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center">
                    Pro Plan <Badge className="ml-2">Current</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Renews on June 15, 2023
                  </p>
                </div>
                <Button variant="outline" className="flex items-center">
                  Upgrade <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {usageData.projects.percentage > 75 && (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Approaching limit</AlertTitle>
                  <AlertDescription>
                    You&apos;re approaching your project limit. Consider upgrading your plan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {usageData.projects.used} of {usageData.projects.limit} used
                    </span>
                    <span className="text-sm font-medium">
                      {usageData.projects.percentage}%
                    </span>
                  </div>
                  <Progress value={usageData.projects.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {usageData.tasks.used} of {usageData.tasks.limit} used
                    </span>
                    <span className="text-sm font-medium">
                      {usageData.tasks.percentage}%
                    </span>
                  </div>
                  <Progress value={usageData.tasks.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {usageData.storage.used} GB of {usageData.storage.limit} GB used
                    </span>
                    <span className="text-sm font-medium">
                      {usageData.storage.percentage}%
                    </span>
                  </div>
                  <Progress value={usageData.storage.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {usageData.teamMembers.used} of {usageData.teamMembers.limit} used
                    </span>
                    <span className="text-sm font-medium">
                      {usageData.teamMembers.percentage}%
                    </span>
                  </div>
                  <Progress value={usageData.teamMembers.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage</CardTitle>
              <CardDescription>
                Breakdown of your resource usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Calls</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {usageData.apiCalls.used} of {usageData.apiCalls.limit} used this month
                      </span>
                      <span className="text-sm font-medium">
                        {usageData.apiCalls.percentage}%
                      </span>
                    </div>
                    <Progress value={usageData.apiCalls.percentage} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average: 150 calls per day
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Storage Usage Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Documents</span>
                      <span>1.2 GB</span>
                    </div>
                    <Progress value={24} className="h-2" />
                    
                    <div className="flex items-center justify-between mt-4">
                      <span>Images</span>
                      <span>0.8 GB</span>
                    </div>
                    <Progress value={16} className="h-2" />
                    
                    <div className="flex items-center justify-between mt-4">
                      <span>Other</span>
                      <span>0.4 GB</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Usage History</h3>
                  <div className="text-sm">
                    <p>View detailed usage reports for previous months:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>May 2023</li>
                      <li>April 2023</li>
                      <li>March 2023</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>
                  For individuals and small projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">$5</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>5 Projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>100 Tasks</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>2 GB Storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>2 Team Members</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Downgrade
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pro</CardTitle>
                  <Badge>Current</Badge>
                </div>
                <CardDescription>
                  For growing teams and businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">$15</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>10 Projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>200 Tasks</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>5 GB Storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>5 Team Members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Advanced Analytics</span>
                  </li>
                </ul>
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>
                  For large teams and organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">$49</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited Projects</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited Tasks</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>20 GB Storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited Team Members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Custom Integrations</span>
                  </li>
                </ul>
                <Button className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need a custom plan?</CardTitle>
              <CardDescription>
                Contact our sales team for a tailored solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <p className="text-sm text-muted-foreground">
                  If your organization has specific requirements, our team can create a custom plan that fits your needs perfectly.
                </p>
                <Button variant="outline">Contact Sales</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Resource Allocation History</CardTitle>
          <CardDescription>
            View how your resource usage has changed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Monthly Usage Trends</h3>
              <p className="text-sm text-muted-foreground">
                Your resource usage has been consistent over the past 3 months.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">March</span>
                    <span className="text-sm text-muted-foreground">2023</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Projects</span>
                        <span>6/10</span>
                      </div>
                      <Progress value={60} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Storage</span>
                        <span>1.8/5 GB</span>
                      </div>
                      <Progress value={36} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">April</span>
                    <span className="text-sm text-muted-foreground">2023</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Projects</span>
                        <span>7/10</span>
                      </div>
                      <Progress value={70} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Storage</span>
                        <span>2.1/5 GB</span>
                      </div>
                      <Progress value={42} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">May</span>
                    <span className="text-sm text-muted-foreground">2023</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Projects</span>
                        <span>8/10</span>
                      </div>
                      <Progress value={80} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Storage</span>
                        <span>2.4/5 GB</span>
                      </div>
                      <Progress value={48} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Usage Recommendations</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Optimize project storage</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider archiving completed projects to free up storage space.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Plan for growth</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      At your current growth rate, you may need to upgrade your plan in 2 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}