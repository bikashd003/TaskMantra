import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="px-6 py-24 flex flex-col items-center justify-center relative overflow-hidden min-h-screen">
      <motion.div
        className="absolute top-20 left-20 w-3 h-3 bg-orange-500/40 rounded-full float-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      />
      <motion.div
        className="absolute top-40 right-32 w-2 h-8 bg-green-500/30 rounded-full float-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-4 h-4 bg-purple-500/30 rotate-45 float-fast"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-6 h-2 bg-pink-500/25 rounded-full float-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      />

      <motion.div
        className="text-center z-10 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.span
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-full text-sm font-semibold inline-block mb-8 shadow-lg hover-reveal glow-on-hover cursor-pointer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 #1 Project Management Software in India
        </motion.span>

        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Transform Your Team's{' '}
          <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-white to-green-500">
            Productivity Forever
          </span>
        </motion.h1>
      </motion.div>
    </section>
  );
};

export default HeroSection;
