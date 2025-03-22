'use client'

import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, MessageSquare, Star } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { Spinner } from '@heroui/spinner'
import { Skeleton } from '@heroui/skeleton'

const notificationSchema = z.object({
  email: z.object({
    taskAssigned: z.boolean(),
    taskUpdates: z.boolean(),
    taskComments: z.boolean(),
    dueDateReminders: z.boolean(),
    teamUpdates: z.boolean(),
  }),
  push: z.object({
    instantNotifications: z.boolean(),
    mentions: z.boolean(),
    teamActivity: z.boolean(),
  }),
  desktop: z.object({
    showNotifications: z.boolean(),
    soundEnabled: z.boolean(),
  }),
})

export default function NotificationSettings() {
  const { data: notificationsSettings, isLoading } = useQuery({
    queryKey: ['notifications-settings'],
    queryFn: async () => {
      const { data } = await axios.get("/api/settings/notifications")
      return data
    }
  })
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSchema>) => {
      const response = await axios.put("/api/settings/notifications", values)
      return response.data
    },
    onError: (error: any) => {
      toast.error(error.message || 'Something went wrong')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-settings'] })
      toast.success('Settings updated successfully')
    },
  })
  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    values: notificationsSettings?.notifications || {
      email: {
        taskAssigned: true,
        taskUpdates: true,
        taskComments: false,
        dueDateReminders: true,
        teamUpdates: true,
      },
      push: {
        instantNotifications: true,
        mentions: true,
        teamActivity: false,
      },
      desktop: {
        showNotifications: true,
        soundEnabled: true,
      },
    },
  })

  const onSubmit = async (values: z.infer<typeof notificationSchema>) => {
    await mutateAsync(values)
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize how and when you want to be notified
        </p>
      </div>
      <Separator />

      {isLoading ? (
        <div className="space-y-6">
          {/* Email Notifications Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 rounded-sm" />
              <Skeleton className="h-5 w-64 mt-2 rounded-sm" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-sm" />
                    <Skeleton className="h-4 w-48 rounded-sm" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Push Notifications Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 rounded-sm" />
              <Skeleton className="h-5 w-64 mt-2 rounded-sm" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-sm" />
                    <Skeleton className="h-4 w-48 rounded-sm" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Desktop Notifications Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 rounded-sm" />
              <Skeleton className="h-5 w-64 mt-2 rounded-sm" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 rounded-sm" />
                    <Skeleton className="h-4 w-48 rounded-sm" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-sm" />
          </div>
        </div>
      ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure your email notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email.taskAssigned"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Task Assignments</FormLabel>
                          <FormDescription>
                            Receive emails when tasks are assigned to you
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
                  <FormField
                    control={form.control}
                    name="email.taskUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Task Updates</FormLabel>
                          <FormDescription>
                            Get notified about updates to your tasks
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
                  <FormField
                    control={form.control}
                    name="email.dueDateReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Due Date Reminders</FormLabel>
                          <FormDescription>
                            Receive reminders before task due dates
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
                </CardContent>
              </Card>

              {/* Push Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Control your in-app notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="push.instantNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Instant Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications in real-time
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
                  <FormField
                    control={form.control}
                    name="push.mentions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mentions</FormLabel>
                          <FormDescription>
                            Get notified when someone mentions you
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
                </CardContent>
              </Card>

              {/* Desktop Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Desktop Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your desktop notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="desktop.showNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Show Notifications</FormLabel>
                          <FormDescription>
                            Display desktop notifications
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
                  <FormField
                    control={form.control}
                    name="desktop.soundEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sound Notifications</FormLabel>
                          <FormDescription>
                            Play a sound for notifications
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
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg">
                  {isPending ? <Spinner /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
      )}
    </div>
  )
}
