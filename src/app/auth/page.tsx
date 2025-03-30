"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';

const PageContent = () => {
    const [isSignIn, setIsSignIn] = useState(false);

    const toggleForm = () => {
        setIsSignIn(!isSignIn);
    };

    return (
        <div className="min-h-screen  flex items-center justify-center p-4 bg-gradient-to-b from-slate-950  to-neutral-950">
            <div className="w-full max-w-md relative">
                <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isSignIn ? (
                            <motion.div
                                key="signin"
                                className="absolute inset-0"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    duration: 0.3
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
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    duration: 0.3
                                }}
                            >
                                <SignUp onSwitchForm={toggleForm} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* This div creates space for the absolute positioned content */}
                <div className="h-[700px]"></div>
            </div>
        </div>
    );
}


const Page = () => {
    return (
        <PageContent />
    );
};

export default Page;