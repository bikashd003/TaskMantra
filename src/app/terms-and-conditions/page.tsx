'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TermsAndConditions() {
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

  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content:
        'By accessing and using TaskMantra, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    },
    {
      icon: Users,
      title: 'Use License',
      content:
        'Permission is granted to temporarily download one copy of TaskMantra per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
    },
    {
      icon: Shield,
      title: 'User Account',
      content:
        'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities under your account.',
    },
    {
      icon: AlertTriangle,
      title: 'Prohibited Uses',
      content:
        'You may not use our service for any illegal or unauthorized purpose nor may you, in the use of the service, violate any laws in your jurisdiction including but not limited to copyright laws.',
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
        className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
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
            Terms & Conditions
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using TaskMantra.
          </p>
          <p className="text-sm text-foreground/50 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Terms Sections */}
        <motion.div className="grid gap-8 max-w-4xl mx-auto" variants={itemVariants}>
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="glass hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{section.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Additional Terms */}
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Additional Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Service Availability</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.
                    Scheduled maintenance will be announced in advance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Data Retention</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    Your data will be retained for as long as your account is active. Upon account
                    deletion, data will be permanently removed within 30 days.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    TaskMantra shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages resulting from your use of the service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Changes to Terms</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    We reserve the right to modify these terms at any time. Users will be notified
                    of significant changes via email or in-app notification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
