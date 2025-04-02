"use client"
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed w-full  top-0 z-50 backdrop-blur-md bg-black/70 py-4 border-b border-white/10 transition-all duration-300 ease-in-out"
        >
            <nav className="container mx-auto px-4 flex justify-between items-center">
                <motion.div whileHover={{ scale: 1.05 }}>
                    <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        TaskMantra
                    </Link>
                </motion.div>
                
                <div className="hidden md:flex space-x-8">
                    <NavItem href="#features">Features</NavItem>
                    <NavItem href="#testimonials">Testimonials</NavItem>
                </div>
                
                <div className="flex items-center space-x-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/auth" className="px-6 py-2 rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                            Sign Up
                        </Link>
                    </motion.div>
                    <button 
                        onClick={toggleMenu} 
                        className="md:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-black via-gray-900 to-black p-6 shadow-2xl"
                    >
                        <div className="flex flex-col space-y-2">
                            <MobileNavItem href="#features">Features</MobileNavItem>
                            <MobileNavItem href="#testimonials">Testimonials</MobileNavItem>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
                href={href} 
                className="relative text-white/90 hover:text-white transition-colors group flex items-center"
            >
                {children}
                <ChevronDown className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all group-hover:w-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                />
            </Link>
        </motion.div>
    );
}

function MobileNavItem({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
    return (
        <motion.div 
            whileTap={{ scale: 0.95 }}
            className={className}
        >
            <Link 
                href={href} 
                className="block py-3 text-white/90 hover:text-white transition-colors text-lg font-medium"
            >
                {children}
            </Link>
        </motion.div>
    );
}