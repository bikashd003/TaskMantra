'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/useRazorpay';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export const RazorpayTestButton: React.FC = () => {
  const { initiateTestPayment, isLoading } = useRazorpay();

  const handleTestPayment = async () => {
    await initiateTestPayment({
      amount: 100, // ₹100
      description: 'Test Payment - 50MB Storage',
      onSuccess: response => {
        toast.success(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      onFailure: error => {
        if (error.message === 'Payment cancelled by user') {
          toast.info('Payment cancelled');
        } else {
          toast.error(`Payment failed: ${error.message}`);
        }
      },
    });
  };

  return (
    <Button
      onClick={handleTestPayment}
      disabled={isLoading}
      className="flex items-center gap-2"
      variant="outline"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Opening Payment...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Test Razorpay Payment (₹100)
        </>
      )}
    </Button>
  );
};
