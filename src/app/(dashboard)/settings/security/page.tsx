'use client'

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Key, Lock, Shield, Smartphone } from 'lucide-react'

const securitySchema = z.object({
  password: z.object({
    current: z.string().min(1, "Current password is required"),
    new: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  }).refine((data) => data.new === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  }),
  twoFactor: z.object({
    enabled: z.boolean(),
    method: z.enum(["app", "sms"]),
  }),
  sessions: z.object({
    rememberMe: z.boolean(),
    activeDevices: z.boolean(),
  }),
})

export default function SecuritySettings() {
  const form = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      password: {
        current: "",
        new: "",
        confirm: "",
      },
      twoFactor: {
        enabled: false,
        method: "app",
      },
      sessions: {
        rememberMe: true,
        activeDevices: true,
      },
    },
  })

  function onSubmit(values: z.infer<typeof securitySchema>) {
    console.log(values)
    // TODO: Implement security settings update
  }

  const recentActivities = [
    {
      device: "Windows PC - Chrome",
      location: "Mumbai, India",
      time: "2 minutes ago",
      status: "current",
    },
    {
      device: "iPhone 12 - Safari",
      location: "Delhi, India",
      time: "1 day ago",
      status: "active",
    },
    {
      device: "MacBook Pro - Firefox",
      location: "Bangalore, India",
      time: "3 days ago",
      status: "active",
    },
  ]

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security and authentication methods
        </p>
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="password.current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password.new"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password.confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twoFactor.enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable 2FA</FormLabel>
                      <FormDescription>
                        Secure your account with two-factor authentication
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="text-sm font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to get 2FA codes
                    </p>
                  </div>
                  <Button variant="outline" className="ml-auto">
                    Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions and devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.device}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{activity.location}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    {activity.status === "current" ? (
                      <Button variant="outline" className="gap-2" disabled>
                        <AlertTriangle className="h-4 w-4" />
                        Current Device
                      </Button>
                    ) : (
                      <Button variant="outline" className="text-destructive">
                        Revoke Access
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
