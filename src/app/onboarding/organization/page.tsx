"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const organizationSchema = Yup.object({
    name: Yup.string().required("Organization name is required").min(2, "Name must be at least 2 characters"),
    location: Yup.string().optional(),
    description: Yup.string().optional(),
});

const OrganizationSetupPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: "",
            location: "",
            description: "",
        },
        validationSchema: organizationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const response = await fetch("/api/onboarding/organization", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });

                if (response.ok) {
                    toast.success("Organization created successfully");
                    router.push("/home");
                } else {
                    const error = await response.json();
                    toast.error(`Failed to create organization: ${error.message}`);
                }
            } catch (error: any) {
                toast.error(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-gray-800">
                        Set Up Your Organization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="text-gray-700">Organization Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={values.name}
                                onChange={handleChange}
                                placeholder="e.g., Acme Corp"
                                className={`mt-1 ${touched.name && errors.name ? "border-red-500" : ""}`}
                            />
                            {touched.name && errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="location" className="text-gray-700">Location (Optional)</Label>
                            <Input
                                id="location"
                                name="location"
                                type="text"
                                value={values.location}
                                onChange={handleChange}
                                placeholder="e.g., New York, USA"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-gray-700">Description (Optional)</Label>
                            <Input
                                id="description"
                                name="description"
                                type="text"
                                value={values.description}
                                onChange={handleChange}
                                placeholder="e.g., A team building awesome products"
                                className="mt-1"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Organization"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizationSetupPage;