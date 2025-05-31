import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface StorageInfo {
  organizationId: string;
  totalLimit: number;
  totalUsed: number;
  availableStorage: number;
  usagePercentage: number;
  isOverLimit: boolean;
  freeStorageLimit: number;
  purchasedStorage: number;
}

export interface StorageBreakdown {
  _id: string;
  totalSize: number;
  fileCount: number;
}

export interface PurchaseInfo {
  storageMB: number;
  pricePerMB: number;
  totalPrice: number;
  storageBytes: number;
}

export interface StoragePurchase {
  _id: string;
  organizationId: string;
  purchasedBy: {
    name: string;
    email: string;
  };
  storageAmount: number;
  pricePerMB: number;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string;
  orderId: string;
  purchaseType: string;
  description: string;
  createdAt: string;
}

export const useStorage = () => {
  const queryClient = useQueryClient();

  // Get storage information
  const {
    data: storageInfo,
    isLoading: isLoadingInfo,
    error: infoError,
    refetch: refetchStorageInfo,
  } = useQuery<StorageInfo>({
    queryKey: ['storage', 'info'],
    queryFn: async () => {
      const response = await axios.get('/api/storage/info');
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get storage breakdown
  const {
    data: storageBreakdown,
    isLoading: isLoadingBreakdown,
    error: breakdownError,
  } = useQuery<StorageBreakdown[]>({
    queryKey: ['storage', 'breakdown'],
    queryFn: async () => {
      const response = await axios.get('/api/storage/breakdown');
      return response.data.data;
    },
  });

  // Get purchase history
  const {
    data: purchaseHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery<StoragePurchase[]>({
    queryKey: ['storage', 'purchases'],
    queryFn: async () => {
      const response = await axios.get('/api/storage/purchases');
      return response.data.data;
    },
  });

  // Calculate storage price
  const calculatePriceMutation = useMutation({
    mutationFn: async (storageMB: number): Promise<PurchaseInfo> => {
      const response = await axios.post('/api/storage/calculate-price', { storageMB });
      return response.data.data;
    },
  });

  // Purchase storage
  const purchaseStorageMutation = useMutation({
    mutationFn: async (purchaseData: {
      storageMB: number;
      paymentId: string;
      orderId: string;
      paymentMethod?: string;
    }) => {
      const response = await axios.post('/api/storage/purchase', purchaseData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Storage purchased successfully!');
      queryClient.invalidateQueries({ queryKey: ['storage'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to purchase storage');
    },
  });

  // Check if file can be uploaded
  const checkUploadMutation = useMutation({
    mutationFn: async (fileSize: number) => {
      const response = await axios.post('/api/storage/check-upload', { fileSize });
      return response.data.data;
    },
  });

  // Utility functions
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMB = (bytes: number): number => {
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
  };

  const getStorageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStorageStatus = (percentage: number): string => {
    if (percentage >= 100) return 'Over Limit';
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'Warning';
    return 'Good';
  };

  const calculatePrice = async (storageMB: number): Promise<PurchaseInfo | null> => {
    try {
      return await calculatePriceMutation.mutateAsync(storageMB);
    } catch (error) {
      toast.error('Failed to calculate price');
      return null;
    }
  };

  const purchaseStorage = async (purchaseData: {
    storageMB: number;
    paymentId: string;
    orderId: string;
    paymentMethod?: string;
  }) => {
    return await purchaseStorageMutation.mutateAsync(purchaseData);
  };

  const checkCanUpload = async (fileSize: number) => {
    try {
      return await checkUploadMutation.mutateAsync(fileSize);
    } catch (error) {
      toast.error('Failed to check upload permission');
      return null;
    }
  };

  return {
    // Data
    storageInfo,
    storageBreakdown,
    purchaseHistory,

    // Loading states
    isLoadingInfo,
    isLoadingBreakdown,
    isLoadingHistory,
    isCalculatingPrice: calculatePriceMutation.isPending,
    isPurchasing: purchaseStorageMutation.isPending,
    isCheckingUpload: checkUploadMutation.isPending,

    // Errors
    infoError,
    breakdownError,
    historyError,

    // Actions
    calculatePrice,
    purchaseStorage,
    checkCanUpload,
    refetchStorageInfo,

    // Utilities
    formatBytes,
    formatMB,
    getStorageColor,
    getStorageStatus,
  };
};
