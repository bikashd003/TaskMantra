"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, History, Plus } from "lucide-react";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("subscription");

  return (
    <div className="container mx-auto py-6 space-y-8 pr-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-4">
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
                    All features included with unlimited projects
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$15</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">What&apos;s included:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Unlimited projects
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Custom integrations
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Team collaboration
                  </li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="destructive">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Update your billing details and address
              </CardDescription>
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

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
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
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your billing history and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "INV-001",
                    date: "May 1, 2023",
                    amount: "$15.00",
                    status: "Paid",
                  },
                  {
                    id: "INV-002",
                    date: "April 1, 2023",
                    amount: "$15.00",
                    status: "Paid",
                  },
                  {
                    id: "INV-003",
                    date: "March 1, 2023",
                    amount: "$15.00",
                    status: "Paid",
                  },
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <History className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p>{invoice.amount}</p>
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}