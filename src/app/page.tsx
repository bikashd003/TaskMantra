'use client';
import Footer from '@/components/Home/footer';
import Hero from '@/components/Home/hero';
import Navbar from '@/components/Home/navbar';
import StatsSection from '@/components/Home/stats';
import Testimonials from '@/components/Home/testimonials';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms for background elements
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.1, 0.05]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };
  const sectionVariants = {
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
  return (
    <motion.div
      ref={ref}
      className="overflow-hidden bg-background relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

      {/* Parallax Blur Background Elements */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y3, opacity }}
        className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"
      />

      {/* Additional floating elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-1/2 right-1/3 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-green-500/5 rounded-full blur-xl"
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 right-10 w-8 h-8 bg-orange-500/20 rotate-45"
        animate={{
          y: [0, -30, 0],
          rotate: [45, 225, 45],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-40 right-20 w-6 h-6 bg-green-500/30 rounded-full"
        animate={{
          x: [0, 25, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/3 left-10 w-4 h-12 bg-purple-500/20 rounded-full"
        animate={{
          rotate: [0, 360],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div variants={sectionVariants}>
        <Navbar />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10">
        <Hero />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10">
        <StatsSection />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10 py-24">
        <Testimonials />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10">
        <Footer />
      </motion.div>
    </motion.div>
  );
}
