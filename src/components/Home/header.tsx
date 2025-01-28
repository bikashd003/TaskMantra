"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-6">
            <nav className="container mx-auto px-4 flex justify-between items-center">
                <div>
                    <Link href="/" className="text-2xl font-bold text-white">TaskMantra</Link>
                </div>
                <div className="hidden md:flex space-x-4">
                    <NavItem href="#features">Features</NavItem>
                    <NavItem href="#pricing">Pricing</NavItem>
                    <NavItem href="#testimonials">Testimonials</NavItem>
                </div>
                <div className="flex items-center space-x-4">
                    <Link href="/sign-up" className="text-white">Sign Up</Link>
                    <button onClick={toggleMenu} className="md:hidden text-white">
                        <Menu />
                    </button>
                </div>
            </nav>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden fixed top-16 right-0 h-40 w-64 bg-black p-4 shadow-lg flex flex-col space-y-4"
                >
                    <NavItem href="#features">Features</NavItem>
                    <NavItem href="#pricing">Pricing</NavItem>
                    <NavItem href="#testimonials">Testimonials</NavItem>
                </motion.div>
            )}
        </motion.div>
    );
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
    );
}
