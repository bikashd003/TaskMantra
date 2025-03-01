"use client";
import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { Menu } from "lucide-react";
import { ProjectProvider } from "@/context/ProjectContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            if (status === "loading") return;
            if (!session) {
                router.push("/auth");
                setIsChecking(false);
                return;
            }

            try {
                const res = await fetch("/api/onboarding/status");
                const data = await res.json();

                if (!data.hasCompletedOnboarding) {
                    router.push("/onboarding/welcome");
                } else {
                    setHasCompletedOnboarding(true);
                }
            } catch (error: any) {
                toast.error("Something went wrong. Please try again.", {
                    description: "Error: " + error.message,
                });
            } finally {
                setIsChecking(false);
            }
        };

        checkOnboarding();
    }, [session, status, router]);

    if (status === "loading" || isChecking) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // If unauthenticated or onboarding incomplete, redirect will handle it; don't render layout
    if (!session || !hasCompletedOnboarding) return null;

    return (
        <ProjectProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50 overflow-x-hidden">
                <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-30 px-4">
                    <div className="h-full flex items-center">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </header>
                <Sidebar
                    isMobileOpen={isMobileOpen}
                    onMobileClose={() => setIsMobileOpen(false)}
                />
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-2 pt-16 md:pt-2 pb-2 px-2">
                    <Header />
                    <main className="overflow-y-auto h-[calc(100vh-64px)]">{children}</main>
                </div>
            </div>
        </ProjectProvider>
    );
}