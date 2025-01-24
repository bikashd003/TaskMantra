"use client";

import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/context/AuthProvider";
import React from "react";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>{children}</AuthProvider>
        </SessionProvider>
    );
}
