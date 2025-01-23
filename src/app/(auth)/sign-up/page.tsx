"use client";
import { useFormik } from "formik";
import { signUpSchema } from "@/app/Schemas/auth";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import React, { useState } from "react";

const SignUp = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = React.useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: signUpSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const response = await fetch("/api/auth/sign-up", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        password: values.password,
                    }),
                });

                if (response.ok) {
                    const result = await signIn("credentials", {
                        email: values.email,
                        password: values.password,
                        redirect: false,
                    });

                    if (result?.ok) {
                        router.push("/home");
                        toast.success("Registration successful");
                    }
                }
            } catch (error) {
                toast.error(`Registration failed: ${error}`);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        },
    });

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" });
    };

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-lg rounded-lg">
            <div className=" p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center text-white mb-6 animate-pulse">
                    Sign Up
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-1">Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Name"
                            value={values.name}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.name && errors.name ? "ring-2 ring-red-500" : ""
                                }`}
                        />
                        {touched.name && errors.name && (
                            <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400 mb-1">Email</label>
                        <input
                            name="email"
                            type="text"
                            placeholder="Email"
                            value={values.email}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.email && errors.email ? "ring-2 ring-red-500" : ""
                                }`}
                        />
                        {touched.email && errors.email && (
                            <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-gray-400 mb-1">Password</label>
                        <input
                            name="password"
                            type={isVisible ? "text" : "password"}
                            placeholder="Password"
                            value={values.password}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.password && errors.password
                                ? "ring-2 ring-red-500"
                                : ""
                                }`}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-10 text-gray-400 hover:text-gray-200"
                            onClick={toggleVisibility}
                        >
                            {isVisible ? <EyeClosed /> : <Eye />}
                        </button>
                        {touched.password && errors.password && (
                            <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-400 mb-1">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${touched.confirmPassword && errors.confirmPassword
                                ? "ring-2 ring-red-500"
                                : ""
                                }`}
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-transform duration-300 transform hover:scale-105"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin mx-auto" />
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="flex flex-col items-center justify-center mt-6">
                    <p className="text-gray-400">Or sign up via</p>
                    <button
                        onClick={handleGoogleSignIn}
                        className="mt-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-full shadow-md transition-transform duration-300 transform hover:scale-110"
                    >
                        <FcGoogle size={30} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
