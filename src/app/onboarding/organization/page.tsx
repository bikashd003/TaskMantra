"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowRight, Building2, Loader2, MapPin, FileText } from "lucide-react";
import ImageUploader from "@/components/Global/ImageUploader";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const organizationSchema = Yup.object({
    name: Yup.string()
        .required("Organization name is required")
        .min(2, "Name must be at least 2 characters"),
    location: Yup.string().optional(),
    description: Yup.string().optional().max(300, "Description must be 300 characters or less"),
});

const OrganizationSetupPage = () => {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 3;

    const createOrganization = async (data: any) => {
        const response = await axios.post("/api/onboarding/organization", data);
        return response.data;
    };

    const mutation = useMutation({
        mutationFn: createOrganization,
        onSuccess: () => {
            toast.success("Organization created successfully");
            router.push("/home");
        },
        onError: (error: any) => {
            toast.error(
                `Failed to create organization: ${error.response?.data?.message || error.message}`
            );
        },
    });

    const formik = useFormik({
        initialValues: {
            name: "",
            location: "",
            description: "",
        },
        validationSchema: organizationSchema,
        validateOnMount: true,
        validateOnChange: true,
        onSubmit: (values) => {
            mutation.mutate({ ...values, image });
        },
    });

    const handleImageUpload = (file: File, croppedBlob?: Blob) => {
        const finalFile = croppedBlob
            ? new File([croppedBlob], file.name, { type: file.type })
            : file;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImage(reader.result);
            }
        };
        reader.readAsDataURL(finalFile);
    };

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        if (currentStep === 0) return values.name.length >= 2;
        return true;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4 md:p-8"
        >
            <div className="w-full max-w-3xl">
                {/* Progress indicator */}
                <motion.div
                    className="mb-8 hidden md:block"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-white rounded-full h-2 w-full overflow-hidden shadow-sm">
                        <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${((currentStep + 1) / totalSteps) * 100}%`
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span className={currentStep >= 0 ? "font-semibold text-blue-600" : ""}>Basic Info</span>
                        <span className={currentStep >= 1 ? "font-semibold text-blue-600" : ""}>Details</span>
                        <span className={currentStep >= 2 ? "font-semibold text-blue-600" : ""}>Branding</span>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                >
                    <div className="p-4 md:p-6">
                        <motion.h1
                            className="text-3xl md:text-2xl font-bold text-gray-800 mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {currentStep === 0 && "Let's set up your organization"}
                            {currentStep === 1 && "Tell us more about your organization"}
                            {currentStep === 2 && "Add your organization's branding"}
                        </motion.h1>

                        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col flex-1">
                            <div className="flex-1">
                            <AnimatePresence mode="wait">
                                {currentStep === 0 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -50, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-700 text-lg font-medium flex items-center">
                                                <Building2 className="mr-2 h-5 w-5 text-blue-500" />
                                                Organization Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={values.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Acme Corp"
                                                className={`text-lg py-6 px-4 ${touched.name && errors.name ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-400"
                                                    }`}
                                                autoFocus
                                            />
                                            <AnimatePresence>
                                                {touched.name && errors.name && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {errors.name}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <motion.div
                                            className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            Start by entering your organization&apos;s name. This will be visible to all members.
                                        </motion.div>
                                    </motion.div>
                                )}

                                {currentStep === 1 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -50, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-gray-700 text-lg font-medium flex items-center">
                                                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                                                Location (Optional)
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                type="text"
                                                value={values.location}
                                                onChange={handleChange}
                                                placeholder="e.g., New York, USA"
                                                className="text-lg py-6 px-4 border-gray-200 focus:ring-blue-400"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-gray-700 text-lg font-medium flex items-center">
                                                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={values.description}
                                                onChange={handleChange}
                                                placeholder="Tell us what your organization does"
                                                className="min-h-[120px] text-lg py-3 px-4 border-gray-200 focus:ring-blue-400"
                                                maxLength={300}
                                            />
                                            <div className="flex justify-end">
                                                <span className="text-sm text-gray-500">
                                                    {values.description.length}/300
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ x: 50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -50, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full"
                                        >
                                            <div className="flex-grow">
                                                <Label className="text-gray-700 text-lg font-medium block mb-2">
                                                    Organization logo (Optional)
                                                </Label>
                                                <div className="h-[500px] max-h-[500px]">

                                                    <ImageUploader
                                                        onImageUpload={handleImageUpload}
                                                        maxSizeMB={2}
                                                        aspectRatio={1}
                                                        allowedTypes={["image/jpeg", "image/png", "image/webp"]}
                                                        className="w-full"
                                                        initialImage={image}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                            </AnimatePresence>
                            </div>

                            <div className="flex justify-between pt-4 mt-8 border-t border-gray-100">
                                {currentStep > 0 ? (
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        variant="outline"
                                        className="text-gray-600"
                                    >
                                        Back
                                    </Button>
                                ) : (
                                    <div></div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={mutation.isPending || !canProceed()}
                                    className={`px-3 py-3 text-md font-medium ${currentStep === totalSteps - 1
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        } text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02]`}
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="animate-spin mx-auto h-5 w-5" />
                                    ) : currentStep === totalSteps - 1 ? (
                                        "Create Organization"
                                    ) : (
                                        <span className="flex items-center">
                                            Continue <ArrowRight className="ml-2 h-5 w-5" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                <motion.p
                    className="text-center text-sm text-gray-500 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    Step {currentStep + 1} of {totalSteps}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default OrganizationSetupPage;