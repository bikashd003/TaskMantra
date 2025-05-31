'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  User,
  Bell,
  Users,
  Settings,
  // Shield,
  Database,
  Lock,
  Clock,
  Wallet,
  Mail,
} from 'lucide-react';
import { useState } from 'react';

export function SidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const accountItems = [
    { href: '/settings/profile', icon: User, label: 'Profile' },
    { href: '/settings/general', icon: Settings, label: 'General' },
    { href: '/settings/notifications', icon: Bell, label: 'Notifications' },
    // { href: "/settings/security", icon: Shield, label: "Security" },
  ];

  const workspaceItems = [
    { href: '/settings/members', icon: Users, label: 'Members' },
    { href: '/settings/roles', icon: Lock, label: 'Roles & Permissions' },
    { href: '/settings/integrations', icon: Database, label: 'Integrations' },
  ];

  const billingItems = [
    { href: '/settings/billing', icon: Wallet, label: 'Billing & Plans' },
    { href: '/settings/usage', icon: Clock, label: 'Usage & Limits' },
    { href: '/settings/email-templates', icon: Mail, label: 'Email Templates' },
  ];

  const NavContent = () => (
    <Card className="min-h-[calc(100vh-140px)] rounded-lg theme-surface-elevated theme-shadow-md">
      <CardContent className="p-6 space-y-8">
        <div>
          <CardTitle className="mb-4 text-sm font-bold tracking-wider sidebar-section-label">
            Account
          </CardTitle>
          <div className="space-y-2">
            {accountItems.map(({ href, icon: Icon, label }) => (
              <Button
                key={href}
                variant={pathname === href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 theme-transition',
                  pathname === href
                    ? 'sidebar-item-active theme-button-secondary'
                    : 'sidebar-item theme-button-ghost interactive-hover'
                )}
                asChild
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <CardTitle className="mb-4 text-sm font-bold tracking-wider sidebar-section-label">
            Workspace
          </CardTitle>
          <div className="space-y-2">
            {workspaceItems.map(({ href, icon: Icon, label }) => (
              <Button
                key={href}
                variant={pathname === href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 theme-transition',
                  pathname === href
                    ? 'sidebar-item-active theme-button-secondary'
                    : 'sidebar-item theme-button-ghost interactive-hover'
                )}
                asChild
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <CardTitle className="mb-4 text-sm font-bold tracking-wider sidebar-section-label">
            Billing & Admin
          </CardTitle>
          <div className="space-y-2">
            {billingItems.map(({ href, icon: Icon, label }) => (
              <Button
                key={href}
                variant={pathname === href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 theme-transition',
                  pathname === href
                    ? 'sidebar-item-active theme-button-secondary'
                    : 'sidebar-item theme-button-ghost interactive-hover'
                )}
                asChild
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="hidden md:block">
        <NavContent />
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="px-0 text-base theme-button-ghost interactive-hover theme-focus theme-transition"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 theme-surface-elevated theme-border">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
