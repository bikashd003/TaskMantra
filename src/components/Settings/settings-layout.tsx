import { SidebarNav } from "./sidebar-nav"

interface SettingsLayoutProps {
    children: React.ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="container relative mx-auto flex flex-1 items-start gap-8 px-4 py-4 md:py-8 md:px-8">
            <div className="w-[240px] flex-shrink-0">
                <SidebarNav />
            </div>
            <main className="flex-1">{children}</main>
        </div>
    )
}

