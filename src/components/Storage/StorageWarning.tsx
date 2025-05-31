'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/hooks/useStorage';
import { AlertTriangle, HardDrive, Plus } from 'lucide-react';
import { useState } from 'react';
import { StoragePurchaseModal } from './StoragePurchaseModal';

interface StorageWarningProps {
  showOnlyWhenNearLimit?: boolean;
  className?: string;
}

export const StorageWarning: React.FC<StorageWarningProps> = ({
  showOnlyWhenNearLimit = true,
  className = '',
}) => {
  const { storageInfo, isLoadingInfo, formatBytes } = useStorage();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (isLoadingInfo || !storageInfo) {
    return null;
  }

  const shouldShow = showOnlyWhenNearLimit ? storageInfo.usagePercentage >= 75 : true;

  if (!shouldShow) {
    return null;
  }

  const getWarningLevel = () => {
    if (storageInfo.isOverLimit) return 'critical';
    if (storageInfo.usagePercentage >= 90) return 'high';
    if (storageInfo.usagePercentage >= 75) return 'medium';
    return 'low';
  };

  const getWarningMessage = () => {
    const level = getWarningLevel();
    const used = formatBytes(storageInfo.totalUsed);
    const total = formatBytes(storageInfo.totalLimit);
    const available = formatBytes(storageInfo.availableStorage);

    switch (level) {
      case 'critical':
        return `Storage limit exceeded! You're using ${used} of ${total}. Please purchase additional storage or delete files to continue uploading.`;
      case 'high':
        return `Storage almost full! You're using ${used} of ${total} (${available} remaining). Consider purchasing additional storage.`;
      case 'medium':
        return `Storage getting full. You're using ${used} of ${total} (${available} remaining).`;
      default:
        return `Storage usage: ${used} of ${total} (${available} remaining).`;
    }
  };

  const getWarningVariant = () => {
    const level = getWarningLevel();
    if (level === 'critical') return 'destructive';
    return 'default';
  };

  const getWarningIcon = () => {
    const level = getWarningLevel();
    if (level === 'critical' || level === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <HardDrive className="h-4 w-4" />;
  };

  return (
    <>
      <Alert variant={getWarningVariant()} className={className}>
        {getWarningIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span className="flex-1">{getWarningMessage()}</span>
          <Button
            size="sm"
            variant={getWarningLevel() === 'critical' ? 'secondary' : 'outline'}
            onClick={() => setShowPurchaseModal(true)}
            className="ml-4 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Buy Storage
          </Button>
        </AlertDescription>
      </Alert>

      <StoragePurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        currentStorage={storageInfo}
      />
    </>
  );
};
