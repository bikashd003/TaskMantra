"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const WelcomePage = () => {
    const router = useRouter();
    const [hasInvite, setHasInvite] = useState(null);

    useEffect(() => {
        const checkInvites = async () => {
            const res = await fetch("/api/onboarding/check-invites");
            const data = await res.json();
            setHasInvite(data.hasInvite);
        };
        checkInvites();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-gray-800">
                        Welcome to Your Workspace
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-600 text-center">
                        {hasInvite === null
                            ? "Loading..."
                            : hasInvite
                                ? "You’ve been invited to join an organization!"
                                : "Let’s get started by setting up your organization."}
                    </p>
                    <Button
                        onClick={() =>
                            router.push(hasInvite ? "/onboarding/invite" : "/onboarding/organization")
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={hasInvite === null}
                    >
                        Get Started
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default WelcomePage;