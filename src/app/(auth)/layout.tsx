"use client";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex items-center justify-center min-h-screen dark text-foreground bg-background">
            <div className="rounded-xl p-8 max-w-md w-full backdrop-blur-sm border border-gray-100">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h1>
                    <p className="text-center text-gray-600 mt-2">Please sign in to continue</p>
                </div>

                <div className="flex justify-center space-x-6 mb-6">
                    <Link
                        href="/sign-in"
                        className="px-6 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/sign-up"
                        className="px-6 py-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors duration-200"
                    >
                        Sign Up
                    </Link>
                </div>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-gray-500 text-sm">or continue with</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {children}

                <div className="mt-6 text-center text-sm text-gray-600">
                    Protected by reCAPTCHA and subject to our
                    <Link href="/privacy" className="text-blue-500 hover:underline ml-1">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
