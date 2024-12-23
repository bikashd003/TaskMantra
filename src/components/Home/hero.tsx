"use client"

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

export default function Hero() {
    return (
        <section className="py-20 text-center">
            <motion.h1
                className="text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Manage Projects with Ease
            </motion.h1>
            <motion.p
                className="text-xl mb-8 text-muted-foreground"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                Streamline your workflow, boost productivity, and deliver results
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Button size="lg">Get Started</Button>
            </motion.div>
        </section>
    )
}

