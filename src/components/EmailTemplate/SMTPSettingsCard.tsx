import { SMTPSettings, smtpSettingsSchema } from '@/Schemas/EmailTemplate';
import { EmailTemplateService } from '@/services/EmailTemplate.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Edit, Loader2, Save, Settings, TestTube2, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

const SMTPSettingsCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch SMTP settings
  const { data: smtpSettings } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      try {
        return await EmailTemplateService.getSMTPSettings();
      } catch (error) {
        // Return default settings if API fails
        return {
          host: '',
          port: 587,
          username: '',
          password: '',
          secure: true,
          fromName: 'TaskMantra',
          fromEmail: 'noreply@taskmantra.com',
        };
      }
    },
  });

  const form = useForm<SMTPSettings>({
    resolver: yupResolver(smtpSettingsSchema) as any,
    defaultValues: smtpSettings,
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (smtpSettings) {
      form.reset(smtpSettings);
    }
  }, [smtpSettings, form]);

  // Update SMTP settings mutation
  const updateSMTPMutation = useMutation({
    mutationFn: EmailTemplateService.updateSMTPSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
      toast.success('SMTP settings saved successfully');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to save SMTP settings', { description: error.message });
    },
  });

  // Test SMTP connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: EmailTemplateService.testSMTPConnection,
    onSuccess: () => {
      toast.success('SMTP connection test successful');
    },
    onError: (error: Error) => {
      toast.error('SMTP connection test failed', { description: error.message });
    },
  });

  const handleSave = (data: SMTPSettings) => {
    updateSMTPMutation.mutate(data);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <Card className="theme-surface-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 theme-text-primary">
              <Settings className="h-5 w-5" />
              SMTP Settings
            </CardTitle>
            <CardDescription className="theme-text-secondary">
              Configure your email server settings for sending notifications
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="smtp.gmail.com"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Port</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="587"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="your-email@gmail.com"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default From Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="TaskMantra"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default From Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="noreply@taskmantra.com"
                        disabled={!isEditing}
                        className={isEditing ? '' : 'bg-muted'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="secure"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Use SSL/TLS</FormLabel>
                    <FormDescription>Enable secure connection to your SMTP server</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditing}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isEditing && (
              <div className="flex gap-2">
                <Button type="submit" disabled={updateSMTPMutation.isPending}>
                  {updateSMTPMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SMTPSettingsCard;
