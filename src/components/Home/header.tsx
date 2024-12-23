"use client"

import { motion } from 'framer-motion'
import Link from 'next/link';

export default function header() {
    return (
        <header className="py-6">
            <nav className="container mx-auto px-4 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href="/" className="text-2xl font-bold text-white">ProjectPro</Link>
                </motion.div>
                <div className="hidden md:flex space-x-4">
                    <NavItem href="#features">Features</NavItem>
                    <NavItem href="#pricing">Pricing</NavItem>
                    <NavItem href="#testimonials">Testimonials</NavItem>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/sign-up" className="text-white">Sign Up</Link>
                </div>
            </nav>
        </header>
    )
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <motion.a
            href={href}
            className="text-white hover:text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.a>
    )
}

