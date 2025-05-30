'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Star, HardDrive, Users, Plus } from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import { StorageWarning } from '@/components/Storage/StorageWarning';
import { StoragePurchaseModal } from '@/components/Storage/StoragePurchaseModal';
import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const { storageInfo, isLoadingInfo, formatMB, getStorageStatus } = useStorage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium theme-text-primary">Settings Overview</h3>
        <p className="text-sm theme-text-secondary">
          Manage your account settings, preferences, and workspace configurations
        </p>
      </div>
      <Separator className="theme-divider" />

      {/* Storage Warning */}
      <StorageWarning showOnlyWhenNearLimit={true} />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 theme-text-primary">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="theme-text-secondary">
                  Frequently used settings and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/settings/notifications">
                  <Button
                    variant="outline"
                    className="w-full justify-start theme-button-ghost interactive-hover"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notification Settings
                  </Button>
                </Link>
                <Link href="/settings/usage">
                  <Button
                    variant="outline"
                    className="w-full justify-start theme-button-ghost interactive-hover"
                  >
                    <HardDrive className="mr-2 h-4 w-4" />
                    Storage Management
                  </Button>
                </Link>
                <Link href="/settings/members">
                  <Button
                    variant="outline"
                    className="w-full justify-start theme-button-ghost interactive-hover"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Team Members
                  </Button>
                </Link>
                <Link href="/settings/email-templates">
                  <Button
                    variant="outline"
                    className="w-full justify-start theme-button-ghost interactive-hover"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Email Templates
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start theme-button-ghost interactive-hover"
                  onClick={() => setShowPurchaseModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buy Storage
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="theme-text-primary">Account Status</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Your current storage subscription information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium theme-text-primary">Subscription Type</span>
                  <Badge variant="secondary" className="theme-badge-secondary">
                    Storage-Based
                  </Badge>
                </div>
                {isLoadingInfo ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium theme-text-primary">Storage Used</span>
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : storageInfo ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium theme-text-primary">Storage Used</span>
                      <Badge
                        variant={storageInfo.usagePercentage >= 90 ? 'destructive' : 'outline'}
                        className="theme-badge-primary"
                      >
                        {formatMB(storageInfo.totalUsed)}MB / {formatMB(storageInfo.totalLimit)}MB
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium theme-text-primary">Storage Status</span>
                      <Badge
                        variant={storageInfo.isOverLimit ? 'destructive' : 'default'}
                        className={
                          storageInfo.isOverLimit
                            ? 'theme-badge-destructive'
                            : 'theme-badge-primary'
                        }
                      >
                        {getStorageStatus(storageInfo.usagePercentage)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium theme-text-primary">Free Storage</span>
                      <Badge variant="outline" className="theme-badge-secondary">
                        {formatMB(storageInfo.freeStorageLimit)}MB
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium theme-text-primary">
                        Purchased Storage
                      </span>
                      <Badge variant="outline" className="theme-badge-secondary">
                        {formatMB(storageInfo.purchasedStorage)}MB
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium theme-text-primary">Storage Used</span>
                    <Badge variant="outline" className="theme-badge-primary">
                      Unable to load
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2 theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="theme-text-primary">Recent Activity</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Your recent storage and account activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: new Date().toLocaleDateString(),
                      action: 'Storage usage calculated',
                      type: 'storage',
                      details: storageInfo
                        ? `${formatMB(storageInfo.totalUsed)}MB used`
                        : 'Loading...',
                    },
                    {
                      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
                      action: 'Settings accessed',
                      type: 'account',
                      details: 'Profile and preferences',
                    },
                    {
                      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                      action: 'Storage system initialized',
                      type: 'storage',
                      details: '50MB free storage allocated',
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 theme-border border-b last:border-0 interactive-hover rounded-md px-3 theme-transition"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium theme-text-primary">{activity.action}</p>
                        <p className="text-xs theme-text-secondary">{activity.details}</p>
                        <p className="text-xs theme-text-secondary mt-1">{activity.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`theme-badge-secondary ${
                          activity.type === 'storage'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ''
                        }`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Storage Purchase Modal */}
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
