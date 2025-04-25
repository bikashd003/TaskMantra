import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { signInSchema } from '@/Schemas/auth';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface SignInProps {
  onSwitchForm: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchForm }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/home';

  const handleSubmit = async (values: { email: string; password: string }) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: callbackUrl,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Login successful');
      // Use the callback URL from the query parameters or default to /home
      router.push(callbackUrl);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: callbackUrl });
  };

  return (
    <div className="h-full flex flex-col justify-center p-8 text-white">
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-white/60">Sign in to continue to your account</p>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                transition={{ delay: 0.2 }}
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
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight className="ml-2" size={18} />}
            </motion.button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-white/10 absolute w-full"></div>
              <span className="bg-transparent px-2 text-sm text-white/40 relative">
                Or continue with
              </span>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FcGoogle size={20} />
              <span className="ml-2">Sign in with Google</span>
            </motion.button>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-white/60">
                Don&apos;t have an account?{' '}
                <motion.button
                  onClick={onSwitchForm}
                  className="text-white hover:text-indigo-400 font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </p>
            </motion.div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignIn;
