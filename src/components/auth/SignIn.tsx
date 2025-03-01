import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { signInSchema } from '@/Schemas/auth';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignInProps {
    onSwitchForm: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchForm }) => {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();


    const handleSubmit = async (values: { email: string; password: string }) => {
        const result = await signIn("credentials", {
            redirect: false,
            email: values.email,
            password: values.password,
        });

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Login successful");
            router.push("/home");
        }
    };

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/home" });
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="h-full flex flex-col justify-center p-8 bg-white">
            <motion.div
                className="text-center mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to continue to your account</p>
            </motion.div>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={signInSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-6">
                        <div className="space-y-4">
                            <motion.div
                                className="relative"
                                custom={0}
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                            >
                                <Mail className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Field
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email && touched.email
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:ring-indigo-500'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                />
                                <ErrorMessage name="email">
                                    {msg => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </motion.div>

                            <motion.div
                                className="relative"
                                custom={1}
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                            >
                                <Lock className="absolute left-3 top-6 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Field
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border ${errors.password && touched.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-200 focus:ring-indigo-500'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[1.65rem] transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <ErrorMessage name="password">
                                    {msg => <div className="text-red-500 text-sm mt-1">{msg}</div>}
                                </ErrorMessage>
                            </motion.div>
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                            {!isSubmitting && <ArrowRight className="ml-2" size={18} />}
                        </motion.button>

                        <div className="relative flex items-center justify-center my-4">
                            <div className="border-t border-gray-300 absolute w-full"></div>
                            <span className="bg-white px-2 text-sm text-gray-500 relative">Or continue with</span>
                        </div>

                        <motion.button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FcGoogle size={20} />
                            <span className="ml-2">Sign in with Google</span>
                        </motion.button>
                    </Form>
                )}
            </Formik>

            <motion.div
                className="mt-8 text-center"
                custom={5}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
            >
                <p className="text-gray-600">
                    Don&apos;t have an account?{' '}
                    <motion.button
                        onClick={onSwitchForm}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign Up
                    </motion.button>
                </p>
            </motion.div>
        </div>
    );
};

export default SignIn;