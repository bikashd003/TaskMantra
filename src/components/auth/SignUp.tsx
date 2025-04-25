import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { signUpSchema } from '@/Schemas/auth';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';

interface SignUpProps {
  onSwitchForm: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/onboarding/welcome';

  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const data = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      const response = await axios.post('/api/auth/sign-up', data);

      if (response.status === 201) {
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          systemRole: response?.data?.user?.systemRole,
          redirect: false,
          callbackUrl: callbackUrl,
        });

        if (result?.ok) {
          // Use the callback URL if provided, otherwise go to onboarding
          const redirectUrl = callbackUrl.includes('/invite/accept')
            ? callbackUrl
            : '/onboarding/welcome';
          router.push(redirectUrl);
          toast.success('Registration successful');
        }
      }
    } catch (error) {
      toast.error(`Registration failed: ${error}`);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: callbackUrl });
  };

  return (
    <div className="h-full flex flex-col justify-center p-8 text-white">
      <motion.div
        className="text-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-white/60">Sign up to get started</p>
      </motion.div>

      <Formik
        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={signUpSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-5">
            <div className="space-y-4">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={18}
                />
                <Field
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.name && touched.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-white placeholder-white/40`}
                />
                <ErrorMessage name="name">
                  {msg => <div className="text-red-400 text-sm mt-1">{msg}</div>}
                </ErrorMessage>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={18}
                />
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.email && touched.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-white placeholder-white/40`}
                />
                <ErrorMessage name="email">
                  {msg => <div className="text-red-400 text-sm mt-1">{msg}</div>}
                </ErrorMessage>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={18}
                />
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.password && touched.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-white placeholder-white/40`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <ErrorMessage name="password">
                  {msg => <div className="text-red-400 text-sm mt-1">{msg}</div>}
                </ErrorMessage>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                  size={18}
                />
                <Field
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-xl focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-white placeholder-white/40`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <ErrorMessage name="confirmPassword">
                  {msg => <div className="text-red-400 text-sm mt-1">{msg}</div>}
                </ErrorMessage>
              </motion.div>
            </div>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <input
                id="terms"
                type="checkbox"
                required
                className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-white/60">
                I agree to the{' '}
                <a href="#" className="text-white hover:text-indigo-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-white hover:text-indigo-400">
                  Privacy Policy
                </a>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-white/60">
          Already have an account?{' '}
          <motion.button
            onClick={onSwitchForm}
            className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
