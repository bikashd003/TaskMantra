'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Download, History, Plus, HardDrive } from 'lucide-react';
import { StorageDashboard } from '@/components/Storage/StorageDashboard';
import { useStorage } from '@/hooks/useStorage';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('subscription');
  const { storageInfo, purchaseHistory, formatMB } = useStorage();

  return (
    <div className="container mx-auto py-6 space-y-8 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-4">
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
                    Pay only for the storage you need - lifetime access
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹2</p>
                  <p className="text-sm text-muted-foreground">per MB</p>
                </div>
              </div>

              <Separator />

              {storageInfo && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Free Storage</p>
                    <p className="text-2xl font-bold">{formatMB(storageInfo.freeStorageLimit)}MB</p>
                    <p className="text-xs text-muted-foreground">Included with account</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Purchased Storage</p>
                    <p className="text-2xl font-bold">{formatMB(storageInfo.purchasedStorage)}MB</p>
                    <p className="text-xs text-muted-foreground">Lifetime access</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Total Storage</p>
                    <p className="text-2xl font-bold">{formatMB(storageInfo.totalLimit)}MB</p>
                    <p className="text-xs text-muted-foreground">Available capacity</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Used Storage</p>
                    <p className="text-2xl font-bold">{formatMB(storageInfo.totalUsed)}MB</p>
                    <p className="text-xs text-muted-foreground">
                      {storageInfo.usagePercentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">What&apos;s included:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 50MB free storage
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Unlimited projects & tasks
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Unlimited team members
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Lifetime storage access
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Real-time storage tracking
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> File type support
                  </li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setActiveTab('storage')}>
                  <HardDrive className="mr-2 h-4 w-4" />
                  Manage Storage
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('billing-history')}>
                  <History className="mr-2 h-4 w-4" />
                  View Purchases
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Update your billing details and address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Billing Name</p>
                    <p className="text-sm text-muted-foreground">John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billing Email</p>
                    <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billing Address</p>
                    <p className="text-sm text-muted-foreground">
                      123 Main St, Anytown, CA 12345, USA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">VAT Number</p>
                    <p className="text-sm text-muted-foreground">US123456789</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <StorageDashboard />
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>

              <Button className="flex items-center" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Purchase History</CardTitle>
              <CardDescription>
                View your storage purchase history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseHistory && purchaseHistory.length > 0 ? (
                  purchaseHistory.map((purchase: any) => (
                    <div
                      key={purchase._id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <HardDrive className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{purchase.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatMB(purchase.storageAmount)}MB storage purchased
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">₹{purchase.totalPrice}</p>
                          <p className="text-xs text-muted-foreground">₹{purchase.pricePerMB}/MB</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            purchase.paymentStatus === 'completed'
                              ? 'text-green-500 border-green-200 bg-green-50'
                              : purchase.paymentStatus === 'pending'
                                ? 'text-yellow-500 border-yellow-200 bg-yellow-50'
                                : 'text-red-500 border-red-200 bg-red-50'
                          }
                        >
                          {purchase.paymentStatus}
                        </Badge>
                        <Button variant="ghost" size="icon" title="Download Receipt">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <HardDrive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't purchased any additional storage yet.
                    </p>
                    <Button onClick={() => setActiveTab('storage')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Buy Storage
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
