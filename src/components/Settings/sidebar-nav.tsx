'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card,  } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Settings, Bell, Users, Shield, FileText, CreditCard, Map, LayoutGrid, Sliders } from 'lucide-react'
import { useState } from "react"

export function SidebarNav() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const accountItems = [
        { href: "/settings/profile", icon: User, label: "My Profile" },
        { href: "/settings", icon: Bell, label: "General" },
        { href: "/settings/preferences", icon: Sliders, label: "Preferences" },
        { href: "/settings/applications", icon: LayoutGrid, label: "Applications" },
    ]

    const workspaceItems = [
        { href: "/settings/workspace", icon: Settings, label: "Settings" },
        { href: "/settings/members", icon: Users, label: "Members" },
        { href: "/settings/security", icon: Shield, label: "Security" },
        { href: "/settings/templates", icon: FileText, label: "Templates" },
        { href: "/settings/billing", icon: CreditCard, label: "Billing" },
        { href: "/settings/roadmap", icon: Map, label: "Roadmaps" },
    ]

    const NavContent = () => (
        <Card className="py-6 h-full">
            <div className="space-y-6">
                <div>
                    <h2 className="px-4 text-xs font-semibold text-muted-foreground tracking-wider">
                        ACCOUNT
                    </h2>
                    <div className="mt-2 space-y-1">
                        {accountItems.map(({ href, icon: Icon, label }) => (
                            <Link key={href} href={href} onClick={() => setOpen(false)}>
                                <span
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        pathname === href ? "bg-accent" : "transparent"
                                    )}
                                >
                                    <Icon className="mr-3 h-4 w-4" />
                                    <span>{label}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="px-4 text-xs font-semibold text-muted-foreground tracking-wider">
                        WORKSPACE
                    </h2>
                    <div className="mt-2 space-y-1">
                        {workspaceItems.map(({ href, icon: Icon, label }) => (
                            <Link key={href} href={href} onClick={() => setOpen(false)}>
                                <span
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        pathname === href ? "bg-accent" : "transparent"
                                    )}
                                >
                                    <Icon className="mr-3 h-4 w-4" />
                                    <span>{label}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0">
                    <NavContent />
                </SheetContent>
            </Sheet>
            <aside className="hidden md:block">
                <NavContent />
            </aside>
        </>
    )
}

