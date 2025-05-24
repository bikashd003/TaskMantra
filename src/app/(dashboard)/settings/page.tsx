import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Shield, Star } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium theme-text-primary">Settings Overview</h3>
        <p className="text-sm theme-text-secondary">
          Manage your account settings, preferences, and workspace configurations
        </p>
      </div>
      <Separator className="theme-divider" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 theme-text-primary">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="theme-text-secondary">
                  Frequently used settings and actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start theme-button-ghost interactive-hover"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Update Email Preferences
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start theme-button-ghost interactive-hover"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start theme-button-ghost interactive-hover"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="theme-text-primary">Account Status</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Your current account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium theme-text-primary">Account Type</span>
                  <Badge variant="secondary" className="theme-badge-secondary">
                    Free
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium theme-text-primary">Storage Used</span>
                  <Badge variant="outline" className="theme-badge-primary">
                    2.5 GB / 5 GB
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium theme-text-primary">Active Projects</span>
                  <Badge className="theme-badge-primary">3</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2 theme-surface-elevated hover-reveal theme-transition">
              <CardHeader>
                <CardTitle className="theme-text-primary">Recent Activity</CardTitle>
                <CardDescription className="theme-text-secondary">
                  Your recent account activities and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2024-02-22', action: 'Password changed', type: 'security' },
                    { date: '2024-02-21', action: 'Profile updated', type: 'profile' },
                    { date: '2024-02-20', action: 'New project created', type: 'project' },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 theme-border border-b last:border-0 interactive-hover rounded-md px-2 theme-transition"
                    >
                      <div>
                        <p className="text-sm font-medium theme-text-primary">{activity.action}</p>
                        <p className="text-xs theme-text-secondary">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="theme-badge-secondary">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
