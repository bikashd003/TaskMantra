import { motion } from 'framer-motion';

const HeroSection = () => {
    return (
        <section className="px-6 py-24 flex flex-col items-center justify-center relative overflow-hidden ">
            <motion.div
                className="text-center z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.span
                    className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-600 text-white rounded-full text-sm font-semibold inline-block mb-8 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Seamless Integration with Hundreds of Tools
                </motion.span>

                <motion.h1
                    className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    Revolutionize Your{' '}
                    <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Task Management</span>
                </motion.h1>

                <motion.p 
                    className="text-xl text-foreground/80 mb-10 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    Experience the future of collaboration with our AI-powered platform. Boost productivity and streamline your workflow like never before.
                </motion.p> 
            </motion.div>
        </section>
    );
};

export default HeroSection;