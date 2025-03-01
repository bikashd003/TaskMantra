"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Invite {
    email?: string;
    organizationName?: string;
    role?: string;
}

const InvitePage = () => {
    const router = useRouter();
    const [invite, setInvite] = useState<Invite>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInvite = async () => {
            const res = await fetch("/api/onboarding/check-invites");
            const data = await res.json();
            if (data.hasInvite) {
                const inviteRes = await fetch("/api/invitation/details"); // Fetch invite details
                setInvite(await inviteRes.json());
            }
        };
        fetchInvite();
    }, []);

    const handleAccept = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/invitation/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: invite.email }),
            });
            if (res.ok) {
                toast.success("Invite accepted!");
                router.push("/home");
            } else {
                toast.error("Failed to accept invite");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!invite) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-gray-800">
                        Join an Organization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-600 text-center">
                        You’ve been invited to join <strong>{invite.organizationName}</strong> as a{" "}
                        <strong>{invite.role}</strong>.
                    </p>
                    <Button
                        onClick={handleAccept}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Accept Invite"}
                    </Button>
                    <Button
                        variant="link"
                        onClick={() => router.push("/home")}
                        className="w-full text-gray-600 hover:text-gray-800"
                    >
                        Skip for now
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvitePage;