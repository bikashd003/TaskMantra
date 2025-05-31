'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Global/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useStorage, StorageInfo, PurchaseInfo } from '@/hooks/useStorage';
import { HardDrive, CreditCard, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useRazorpay, RazorpayResponse } from '@/hooks/useRazorpay';

interface StoragePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStorage: StorageInfo;
}

export const StoragePurchaseModal: React.FC<StoragePurchaseModalProps> = ({
  isOpen,
  onClose,
  currentStorage,
}) => {
  const [storageMB, setStorageMB] = useState<number>(50);
  const [priceInfo, setPriceInfo] = useState<PurchaseInfo | null>(null);
  const [isProcessingPayment] = useState(false);

  const {
    calculatePrice,
    purchaseStorage,
    isCalculatingPrice,
    isPurchasing,
    formatBytes,
    formatMB,
  } = useStorage();

  const { initiateStoragePayment, isLoading: isPaymentLoading } = useRazorpay();

  // Calculate price when storage amount changes
  useEffect(() => {
    if (storageMB > 0) {
      const debounceTimer = setTimeout(async () => {
        const price = await calculatePrice(storageMB);
        setPriceInfo(price);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [storageMB, calculatePrice]);

  const handleStorageChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 10000) {
      // Max 10GB purchase at once
      setStorageMB(numValue);
    }
  };

  const handlePurchase = async () => {
    if (!priceInfo || storageMB <= 0) {
      toast.error('Please enter a valid storage amount');
      return;
    }

    try {
      await initiateStoragePayment({
        storageMB,
        onSuccess: async (response: RazorpayResponse, _orderData) => {
          try {
            await purchaseStorage({
              storageMB,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              paymentMethod: 'razorpay',
            });

            toast.success('Storage purchased successfully!');
            onClose();
            setStorageMB(50);
            setPriceInfo(null);
          } catch (error) {
            toast.error('Payment successful but failed to update storage. Please contact support.');
          }
        },
        onFailure: (error: Error) => {
          if (error.message === 'Payment cancelled by user') {
            toast.info('Payment cancelled');
          } else {
            toast.error(error.message || 'Payment failed. Please try again.');
          }
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  const quickSelectOptions = [25, 50, 100, 250, 500, 1000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5" />
          Purchase Additional Storage
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Expand your organization's storage capacity with lifetime access
        </p>

        <div className="space-y-6">
          {/* Current Storage Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">Current Storage</div>
              <div className="flex justify-between items-center">
                <span>Used: {formatBytes(currentStorage.totalUsed)}</span>
                <span>Total: {formatBytes(currentStorage.totalLimit)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatMB(currentStorage.availableStorage)}MB available
              </div>
            </CardContent>
          </Card>

          {/* Storage Amount Selection */}
          <div className="space-y-3">
            <Label htmlFor="storage-amount">Storage Amount (MB)</Label>
            <Input
              id="storage-amount"
              type="number"
              value={storageMB}
              onChange={e => handleStorageChange(e.target.value)}
              placeholder="Enter storage amount in MB"
              min="1"
              max="10000"
            />

            {/* Quick Select Options */}
            <div className="grid grid-cols-3 gap-2">
              {quickSelectOptions.map(amount => (
                <Button
                  key={amount}
                  variant={storageMB === amount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStorageMB(amount)}
                  className="text-xs"
                >
                  {amount}MB
                </Button>
              ))}
            </div>
          </div>

          {/* Price Calculation */}
          {priceInfo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium">Price Breakdown</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Storage Amount:</span>
                    <span>{priceInfo.storageMB}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per MB:</span>
                    <span>₹{priceInfo.pricePerMB}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Price:</span>
                    <span>₹{priceInfo.totalPrice}</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <strong>Lifetime Access:</strong> This storage will be available permanently for
                  your organization.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isPurchasing || isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1 flex items-center gap-2"
              disabled={
                !priceInfo ||
                storageMB <= 0 ||
                isPurchasing ||
                isPaymentLoading ||
                isCalculatingPrice
              }
            >
              {isPaymentLoading || isPurchasing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isPaymentLoading ? 'Opening Payment...' : 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Purchase ₹{priceInfo?.totalPrice || 0}
                </>
              )}
            </Button>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>🔒 Secure payment popup powered by Razorpay</p>
            <p>💳 Supports UPI, Cards, Net Banking & Wallets</p>
            <div className="bg-blue-50 p-2 rounded text-blue-700">
              <p className="font-medium">Test Mode Active</p>
              <p>Card: 4111 1111 1111 1111 | CVV: 123 | Expiry: 12/25</p>
              <p>UPI: success@razorpay (for success) | failure@razorpay (for failure)</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
