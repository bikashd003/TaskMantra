"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const WelcomePage = () => {
    const router = useRouter();

    const { data, error, isLoading } = useQuery({
        queryKey: ['check-invites'],
        queryFn: async () => {
            const { data } = await axios.get('/api/onboarding/check-invites');
            return data;
        }
    });
    // Show error toast if query fails
    useEffect(() => {
        if (error) {
            toast.error("Failed to check invites", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }, [error]);
    const hasInvite = data?.hasInvite;


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md overflow-hidden rounded-xl border-0 shadow-xl">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <CardHeader className="pt-8 pb-4">
                        <CardTitle className="text-3xl font-bold text-center text-gray-800">
                            Welcome to Your Workspace
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pb-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-center"
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                            ) : (
                                <p className="text-gray-600 text-lg">
                                    {hasInvite
                                        ? "You've been invited to join an organization!"
                                        : "Let's get started by setting up your organization."}
                                </p>
                            )}
                        </motion.div>

                        <Button
                            onClick={() =>
                                router.push(hasInvite ? "/onboarding/invite" : "/onboarding/organization")
                            }
                            className="w-full py-6 text-lg font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Get Started"}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default WelcomePage;