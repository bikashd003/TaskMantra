'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/hooks/useStorage';
import { HardDrive, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { StoragePurchaseModal } from './StoragePurchaseModal';
import { useState } from 'react';

export const StorageDashboard: React.FC = () => {
  const {
    storageInfo,
    storageBreakdown,
    isLoadingInfo,
    isLoadingBreakdown,
    formatBytes,
    formatMB,
    getStorageStatus,
  } = useStorage();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (isLoadingInfo) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!storageInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Failed to load storage information</p>
        </CardContent>
      </Card>
    );
  }

  const statusIcon = () => {
    const percentage = storageInfo.usagePercentage;
    if (percentage >= 100) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (percentage >= 90) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Usage
              </CardTitle>
              <CardDescription>Monitor your organization's storage consumption</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {statusIcon()}
              <Badge variant={storageInfo.usagePercentage >= 90 ? 'destructive' : 'secondary'}>
                {getStorageStatus(storageInfo.usagePercentage)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formatBytes(storageInfo.totalUsed)}</span>
              <span>Total: {formatBytes(storageInfo.totalLimit)}</span>
            </div>
            <Progress value={Math.min(storageInfo.usagePercentage, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{storageInfo.usagePercentage.toFixed(1)}% used</span>
              <span>{formatBytes(storageInfo.availableStorage)} available</span>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatMB(storageInfo.freeStorageLimit)}MB
              </div>
              <div className="text-sm text-gray-600">Free Storage</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatMB(storageInfo.purchasedStorage)}MB
              </div>
              <div className="text-sm text-gray-600">Purchased Storage</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatMB(storageInfo.totalUsed)}MB
              </div>
              <div className="text-sm text-gray-600">Currently Used</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => setShowPurchaseModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Buy More Storage
            </Button>
            {storageInfo.usagePercentage >= 90 && (
              <Button variant="outline" className="text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Storage Almost Full
              </Button>
            )}
          </div>

          {/* Warning Messages */}
          {storageInfo.isOverLimit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Storage Limit Exceeded</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                You cannot upload new files until you purchase additional storage or delete existing
                files.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Breakdown by Resource Type */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Breakdown</CardTitle>
          <CardDescription>
            See how your storage is distributed across different resource types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBreakdown ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : storageBreakdown && storageBreakdown.length > 0 ? (
            <div className="space-y-4">
              {storageBreakdown.map(item => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium capitalize">{item._id}</div>
                      <div className="text-sm text-gray-500">{item.fileCount} files</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatBytes(item.totalSize)}</div>
                    <div className="text-sm text-gray-500">
                      {((item.totalSize / storageInfo.totalUsed) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HardDrive className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No files uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Purchase Modal */}
      <StoragePurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        currentStorage={storageInfo}
      />
    </div>
  );
};
