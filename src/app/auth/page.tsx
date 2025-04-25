'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';
import { useSearchParams } from 'next/navigation';

const PageContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  // Default to sign in if there's a callback URL (like from an invitation)
  const [isSignIn, setIsSignIn] = useState(callbackUrl ? true : false);

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 shadow-[0_0_1000px_rgba(120,119,198,0.3)] overflow-hidden">
          <AnimatePresence mode="wait">
            {isSignIn ? (
              <motion.div
                key="signin"
                className="absolute inset-0"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3,
                }}
              >
                <SignIn onSwitchForm={toggleForm} />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                className="absolute inset-0"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3,
                }}
              >
                <SignUp onSwitchForm={toggleForm} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="h-[700px]"></div>
      </div>
    </div>
  );
};

const Page = () => {
  return <PageContent />;
};

export default Page;
