"use client";
import Features from "@/components/Home/features";
import Footer from "@/components/Home/footer";
import Hero from "@/components/Home/hero";
import Navbar from "@/components/Home/navbar";
import Testimonials from "@/components/Home/testimonials";
import { motion } from "framer-motion";

export default function Home() {
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
        ease: "easeOut",
      },
    },
  };
  return (
    <motion.div
      className="overflow-hidden bg-gradient-to-b from-slate-950  to-neutral-950"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={sectionVariants}>
        <Navbar />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10">
        <Hero />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10 py-24">
        <Features />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10  py-24">
        <Testimonials />
      </motion.div>
      <motion.div variants={sectionVariants} className="relative z-10">
        <Footer />
      </motion.div>
    </motion.div >
  );
}

