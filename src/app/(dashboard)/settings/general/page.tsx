'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Clock, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@heroui/skeleton';
import { toast } from 'sonner';
import { Spinner } from '@heroui/spinner';
import { useTheme } from 'next-themes';

const generalSettingsSchema = z.object({
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    animations: z.boolean(),
    reducedMotion: z.boolean(),
  }),
  localization: z.object({
    language: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
  }),
  accessibility: z.object({
    screenReader: z.boolean(),
    highContrast: z.boolean(),
    largeText: z.boolean(),
  }),
});

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const timezones = [
  { value: 'IST', label: '(UTC+05:30) India Standard Time' },
  { value: 'UTC', label: '(UTC+00:00) Universal Coordinated Time' },
  { value: 'EST', label: '(UTC-05:00) Eastern Time' },
  { value: 'CST', label: '(UTC-06:00) Central Time' },
  { value: 'PST', label: '(UTC-08:00) Pacific Time' },
];

export default function GeneralSettings() {
  const { setTheme } = useTheme();
  const { data: generalSettings, isLoading } = useQuery({
    queryKey: ['general-settings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/settings/general');
      return data;
    },
  });
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof generalSettingsSchema>) => {
      const response = await axios.put('/api/settings/general', values);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Something went wrong');
    },
    onSuccess: (_data, variables) => {
      if (variables.appearance?.theme) {
        setTheme(variables.appearance.theme);
      }
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      toast.success('Settings updated successfully');
    },
  });

  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    values: generalSettings?.general || {
      appearance: {
        theme: 'system',
        animations: true,
        reducedMotion: false,
      },
      localization: {
        language: 'en-US',
        timezone: 'IST',
        dateFormat: 'DD/MM/YYYY',
      },
      accessibility: {
        screenReader: false,
        highContrast: false,
        largeText: false,
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof generalSettingsSchema>) => {
    await mutateAsync(values);
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium theme-text-primary">General Settings</h3>
        <p className="text-sm theme-text-secondary">Customize your application experience</p>
      </div>
      <Separator className="theme-divider" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Appearance Settings */}
          <Card className="theme-surface-elevated hover-reveal theme-transition">
            <CardHeader>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32 mb-1 rounded-sm loading-skeleton" />
                  <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
                </>
              ) : (
                <>
                  <CardTitle className="theme-text-primary">Appearance</CardTitle>
                  <CardDescription className="theme-text-secondary">
                    Customize how the application looks and feels
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="appearance.theme"
                render={({ field }) => (
                  <FormItem>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-32 mb-1 rounded-sm loading-skeleton" />
                      </>
                    ) : (
                      <FormLabel className="theme-text-primary">Theme</FormLabel>
                    )}
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-40 mb-1 rounded-sm loading-skeleton" />
                        <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
                      </>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[240px] theme-input theme-focus">
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="theme-surface-elevated theme-border">
                            <SelectItem
                              value="light"
                              className="interactive-hover theme-transition"
                            >
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark" className="interactive-hover theme-transition">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="system"
                              className="interactive-hover theme-transition"
                            >
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span>System</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="theme-text-secondary">
                          Select your preferred theme appearance
                        </FormDescription>
                      </>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appearance.animations"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg theme-border border p-4 interactive-hover theme-transition">
                    <div className="space-y-0.5">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-4 w-32 mb-1 rounded-sm loading-skeleton" />
                          <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
                        </>
                      ) : (
                        <>
                          <FormLabel className="text-base theme-text-primary">
                            Enable Animations
                          </FormLabel>
                          <FormDescription className="theme-text-secondary">
                            Show animations and transitions
                          </FormDescription>
                        </>
                      )}
                    </div>
                    <FormControl>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-4 w-12 rounded-sm loading-skeleton" />
                        </>
                      ) : (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Localization Settings */}
          <Card className="theme-surface-elevated hover-reveal theme-transition">
            <CardHeader>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32 mb-1 rounded-sm loading-skeleton" />
                  <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
                </>
              ) : (
                <>
                  <CardTitle className="flex items-center gap-2 theme-text-primary">
                    <Globe className="h-5 w-5" />
                    Localization
                  </CardTitle>
                  <CardDescription className="theme-text-secondary">
                    Configure language and regional preferences
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="localization.language"
                render={({ field }) => (
                  <FormItem>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                      </>
                    ) : (
                      <FormLabel>Language</FormLabel>
                    )}
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-40 mb-1 rounded-sm" />
                        <Skeleton className="h-4 w-64 rounded-sm" />
                      </>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map(language => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose your preferred language</FormDescription>
                      </>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="localization.timezone"
                render={({ field }) => (
                  <FormItem>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                      </>
                    ) : (
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Zone
                      </FormLabel>
                    )}
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-40 mb-1 rounded-sm" />
                        <Skeleton className="h-4 w-64 rounded-sm" />
                      </>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Select a timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timezones.map(timezone => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your timezone for accurate time display
                        </FormDescription>
                      </>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localization.dateFormat"
                render={({ field }) => (
                  <FormItem>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                      </>
                    ) : (
                      <FormLabel>Date Format</FormLabel>
                    )}
                    {isLoading ? (
                      <>
                        <Skeleton className="h-8 w-40 mb-1 rounded-sm" />
                        <Skeleton className="h-4 w-64 rounded-sm" />
                      </>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dateFormats.map(format => (
                              <SelectItem key={format.value} value={format.value}>
                                {format.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose how dates should be displayed</FormDescription>
                      </>
                    )}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card className="theme-surface-elevated hover-reveal theme-transition">
            <CardHeader>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32 mb-1 rounded-sm loading-skeleton" />
                  <Skeleton className="h-4 w-64 rounded-sm loading-skeleton" />
                </>
              ) : (
                <>
                  <CardTitle className="theme-text-primary">Accessibility</CardTitle>
                  <CardDescription className="theme-text-secondary">
                    Configure accessibility preferences
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="accessibility.screenReader"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-64 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <FormLabel className="text-base">Screen Reader Optimization</FormLabel>
                          <FormDescription>Optimize interface for screen readers</FormDescription>
                        </>
                      )}
                    </div>
                    <FormControl>
                      {isLoading ? (
                        <Skeleton className="h-4 w-8 rounded-sm" />
                      ) : (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessibility.highContrast"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-64 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <FormLabel className="text-base">High Contrast Mode</FormLabel>
                          <FormDescription>Increase contrast for better visibility</FormDescription>
                        </>
                      )}
                    </div>
                    <FormControl>
                      {isLoading ? (
                        <Skeleton className="h-4 w-8 rounded-sm" />
                      ) : (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessibility.largeText"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-4 w-32 mb-1 rounded-sm" />
                          <Skeleton className="h-4 w-64 rounded-sm" />
                        </>
                      ) : (
                        <>
                          <FormLabel className="text-base">Large Text</FormLabel>
                          <FormDescription>
                            Increase text size throughout the application
                          </FormDescription>
                        </>
                      )}
                    </div>
                    <FormControl>
                      {isLoading ? (
                        <Skeleton className="h-4 w-8 rounded-sm" />
                      ) : (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="theme-button-primary theme-transition">
              {isPending ? <Spinner /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
