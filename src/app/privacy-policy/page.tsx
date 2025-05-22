'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, Cookie, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
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
      icon: Database,
      title: 'Information We Collect',
      content:
        'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any content you create within TaskMantra.',
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content:
        'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.',
    },
    {
      icon: Lock,
      title: 'Information Security',
      content:
        'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted both in transit and at rest.',
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content:
        'You have the right to access, update, or delete your personal information. You can also object to processing, request data portability, and withdraw consent where applicable. Contact us to exercise these rights.',
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking',
      content:
        'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.',
    },
    {
      icon: Shield,
      title: 'Data Sharing',
      content:
        'We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our platform, subject to strict confidentiality agreements.',
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
        className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
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
            Privacy Policy
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect
            your information.
          </p>
          <p className="text-sm text-foreground/50 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Privacy Sections */}
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

          {/* Additional Privacy Information */}
          <motion.div variants={itemVariants}>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Additional Privacy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Data Retention Period</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    We retain your personal information for as long as necessary to provide our
                    services and fulfill the purposes outlined in this policy, unless a longer
                    retention period is required by law.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">International Data Transfers</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    Your information may be transferred to and processed in countries other than
                    your own. We ensure appropriate safeguards are in place to protect your data
                    during such transfers.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Children's Privacy</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    Our service is not intended for children under 13 years of age. We do not
                    knowingly collect personal information from children under 13.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at
                    privacy@taskmantra.com or through our support channels.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Policy Updates</h4>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any
                    material changes by posting the new policy on this page and updating the "Last
                    updated" date.
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
