'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, HardDrive, Plus, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStorage } from '@/hooks/useStorage';
import { useUsageStats } from '@/hooks/useUsageStats';
import { StoragePurchaseModal } from '@/components/Storage/StoragePurchaseModal';
import { RazorpayTestButton } from '@/components/Storage/RazorpayTestButton';
import { useState } from 'react';

export default function LimitsPage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const {
    storageInfo,
    storageBreakdown,
    isLoadingInfo,
    isLoadingBreakdown,
    formatBytes,
    formatMB,
    getStorageColor,
    getStorageStatus,
  } = useStorage();

  const {
    stats,
    usageHistory,
    recommendations,
    isLoading: isLoadingStats,
    error: statsError,
    getUsageColor,
    getUsageStatus: getResourceStatus,
    formatUsageText,
    getProgressValue,
  } = useUsageStats();

  const storageData = storageInfo
    ? {
        used: formatMB(storageInfo.totalUsed),
        limit: formatMB(storageInfo.totalLimit),
        percentage: storageInfo.usagePercentage,
        isOverLimit: storageInfo.isOverLimit,
        freeStorage: formatMB(storageInfo.freeStorageLimit),
        purchasedStorage: formatMB(storageInfo.purchasedStorage),
      }
    : {
        used: 0,
        limit: 50,
        percentage: 0,
        isOverLimit: false,
        freeStorage: 50,
        purchasedStorage: 0,
      };

  return (
    <div className="container mx-auto py-6 space-y-8 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usage & Limits</h2>
        <p className="text-muted-foreground">
          Monitor your resource usage and manage your plan limits
        </p>
      </div>

      {/* Error Alert */}
      {statsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load Usage Data</AlertTitle>
          <AlertDescription>
            {statsError}. Some usage statistics may not be available.
          </AlertDescription>
        </Alert>
      )}

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
              <CardDescription>Storage-based subscription with lifetime purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center">
                    <HardDrive className="mr-2 h-4 w-4" />
                    Storage Plan <Badge className="ml-2">Active</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {storageData.freeStorage}MB free + {storageData.purchasedStorage}MB purchased
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowPurchaseModal(true)} className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Buy Storage
                  </Button>
                  <RazorpayTestButton />
                </div>
              </div>

              {/* Storage Warnings */}
              {storageData.isOverLimit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Storage Limit Exceeded</AlertTitle>
                  <AlertDescription>
                    You cannot upload new files until you purchase additional storage or delete
                    existing files.
                  </AlertDescription>
                </Alert>
              )}

              {storageData.percentage >= 90 && !storageData.isOverLimit && (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Storage Almost Full</AlertTitle>
                  <AlertDescription>
                    You&apos;re using {storageData.percentage.toFixed(1)}% of your storage. Consider
                    purchasing additional storage.
                  </AlertDescription>
                </Alert>
              )}

              {storageData.percentage >= 75 && storageData.percentage < 90 && (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Storage Getting Full</AlertTitle>
                  <AlertDescription>
                    You&apos;re using {storageData.percentage.toFixed(1)}% of your storage space.
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
                {isLoadingStats ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatUsageText(
                          stats.projects.used,
                          stats.projects.limit,
                          stats.projects.isUnlimited
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${getUsageColor(stats.projects.percentage, stats.projects.isUnlimited)}`}
                      >
                        {stats.projects.isUnlimited ? 'Unlimited' : `${stats.projects.percentage}%`}
                      </span>
                    </div>
                    <Progress
                      value={getProgressValue(
                        stats.projects.used,
                        stats.projects.limit,
                        stats.projects.isUnlimited
                      )}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {getResourceStatus(stats.projects.percentage, stats.projects.isUnlimited)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Unable to load</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatUsageText(
                          stats.tasks.used,
                          stats.tasks.limit,
                          stats.tasks.isUnlimited
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${getUsageColor(stats.tasks.percentage, stats.tasks.isUnlimited)}`}
                      >
                        {stats.tasks.isUnlimited ? 'Unlimited' : `${stats.tasks.percentage}%`}
                      </span>
                    </div>
                    <Progress
                      value={getProgressValue(
                        stats.tasks.used,
                        stats.tasks.limit,
                        stats.tasks.isUnlimited
                      )}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {getResourceStatus(stats.tasks.percentage, stats.tasks.isUnlimited)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Unable to load</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <HardDrive className="mr-2 h-4 w-4" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingInfo ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {storageData.used}MB of {storageData.limit}MB used
                      </span>
                      <span
                        className={`text-sm font-medium ${getStorageColor(storageData.percentage)}`}
                      >
                        {storageData.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(storageData.percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{getStorageStatus(storageData.percentage)}</span>
                      <span>{formatBytes(storageInfo?.availableStorage || 0)} available</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : stats ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatUsageText(
                          stats.teamMembers.used,
                          stats.teamMembers.limit,
                          stats.teamMembers.isUnlimited
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${getUsageColor(stats.teamMembers.percentage, stats.teamMembers.isUnlimited)}`}
                      >
                        {stats.teamMembers.isUnlimited
                          ? 'Unlimited'
                          : `${stats.teamMembers.percentage}%`}
                      </span>
                    </div>
                    <Progress
                      value={getProgressValue(
                        stats.teamMembers.used,
                        stats.teamMembers.limit,
                        stats.teamMembers.isUnlimited
                      )}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {getResourceStatus(
                        stats.teamMembers.percentage,
                        stats.teamMembers.isUnlimited
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Unable to load</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage</CardTitle>
              <CardDescription>Breakdown of your resource usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Calls</h3>
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : stats ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {stats.apiCalls.used} of {stats.apiCalls.limit} used this month
                          </span>
                          <span className="text-sm font-medium">
                            {stats.apiCalls.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={stats.apiCalls.percentage} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Resets on: {new Date(stats.apiCalls.resetDate).toLocaleDateString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Unable to load API usage data</div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Storage Usage Breakdown</h3>
                  {isLoadingBreakdown ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-gray-200 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : storageBreakdown && storageBreakdown.length > 0 ? (
                    <div className="space-y-4">
                      {storageBreakdown.map(item => {
                        const percentage = storageInfo
                          ? (item.totalSize / storageInfo.totalUsed) * 100
                          : 0;
                        return (
                          <div key={item._id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="capitalize">{item._id}</span>
                              <span>
                                {formatBytes(item.totalSize)} ({item.fileCount} files)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No files uploaded yet</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Usage History</h3>
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-6 bg-gray-200 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : usageHistory && usageHistory.length > 0 ? (
                    <div className="text-sm">
                      <p>Usage reports for the last 3 months:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {usageHistory.map(month => (
                          <li key={`${month.month}-${month.year}`}>
                            {month.month} {month.year} - {month.teamMembers.used} members,{' '}
                            {month.storage.used.toFixed(1)}MB storage
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No usage history available</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <HardDrive className="mr-2 h-5 w-5" />
                    Storage Plan
                  </CardTitle>
                  <Badge>Current</Badge>
                </div>
                <CardDescription>
                  Pay only for the storage you need - lifetime access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">₹2</span>
                  <span className="text-muted-foreground"> / MB</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>50MB Free Storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited Projects & Tasks</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited Team Members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Lifetime Storage Access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>Real-time Storage Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>File Type Support</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full flex items-center justify-center"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy More Storage
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Packages</CardTitle>
                <CardDescription>Popular storage options for different needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">50MB</span>
                        <span className="text-sm text-muted-foreground ml-2">Small projects</span>
                      </div>
                      <span className="font-bold">₹100</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">100MB</span>
                        <span className="text-sm text-blue-600 ml-2">Popular</span>
                      </div>
                      <span className="font-bold">₹200</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">500MB</span>
                        <span className="text-sm text-muted-foreground ml-2">Large projects</span>
                      </div>
                      <span className="font-bold">₹1,000</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">1GB</span>
                        <span className="text-sm text-muted-foreground ml-2">Enterprise</span>
                      </div>
                      <span className="font-bold">₹2,048</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  All purchases are lifetime access with no recurring fees
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Need a custom plan?</CardTitle>
              <CardDescription>Contact our sales team for a tailored solution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <p className="text-sm text-muted-foreground">
                  If your organization has specific requirements, our team can create a custom plan
                  that fits your needs perfectly.
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
          <CardDescription>View how your resource usage has changed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Monthly Usage Trends</h3>
              <p className="text-sm text-muted-foreground">
                Your resource usage has been consistent over the past 3 months.
              </p>

              {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : usageHistory && usageHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {usageHistory.map(month => (
                    <div key={`${month.month}-${month.year}`} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-sm text-muted-foreground">{month.year}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Team Members</span>
                            <span>{month.teamMembers.used} members</span>
                          </div>
                          <Progress
                            value={
                              month.teamMembers.limit > 0
                                ? (month.teamMembers.used / month.teamMembers.limit) * 100
                                : Math.min((month.teamMembers.used / 5) * 100, 100)
                            }
                            className="h-1 mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Storage</span>
                            <span>
                              {month.storage.used.toFixed(1)}/{month.storage.limit}MB
                            </span>
                          </div>
                          <Progress
                            value={(month.storage.used / month.storage.limit) * 100}
                            className="h-1 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No usage history available</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Usage Recommendations</h3>
              {isLoadingStats ? (
                <div className="mt-4 space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-3 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendations && recommendations.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          rec.priority === 'high'
                            ? 'bg-red-50'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-50'
                              : 'bg-blue-50'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-5 w-5 ${
                            rec.priority === 'high'
                              ? 'text-red-500'
                              : rec.priority === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-center py-4 text-gray-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recommendations at this time</p>
                  <p className="text-xs">Your usage looks good!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {storageInfo && (
        <StoragePurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          currentStorage={storageInfo}
        />
      )}
    </div>
  );
}
