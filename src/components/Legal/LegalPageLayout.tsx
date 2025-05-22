'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backgroundVariant?: 'blue' | 'purple' | 'green';
}

export default function LegalPageLayout({
  title,
  description,
  children,
  backgroundVariant = 'blue',
}: LegalPageLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const getBackgroundElements = () => {
    switch (backgroundVariant) {
      case 'purple':
        return (
          <>
            <motion.div
              className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.8, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        );
      case 'green':
        return (
          <>
            <motion.div
              className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.7, 1],
                opacity: [0.1, 0.18, 0.1],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        );
      default: // blue
        return (
          <>
            <motion.div
              className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 0.7, 1],
                opacity: [0.1, 0.18, 0.1],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        );
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      {getBackgroundElements()}

      {/* Navigation */}
      <motion.nav className="relative z-10 p-6" variants={itemVariants}>
        <Link href="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </Link>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pb-16">
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{description}</p>
          <p className="text-sm text-foreground/50 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div className="grid gap-8 max-w-4xl mx-auto" variants={itemVariants}>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
