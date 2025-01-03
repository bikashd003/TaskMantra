"use client";
import React from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Home/header';

export default function dashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 min-w-0">
                <Header />

                <main className="p-4 lg:p-8 pt-0">
                    {children}
                </main>
            </div>
        </div>
    );
}

