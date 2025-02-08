import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-6 w-6" />
        </div>
        <div className="hidden md:flex items-center space-x-8 font-sans">
          <Link href="#" className="hover:text-gray-300 transition-colors">Services</Link>
          <Link href="#" className="hover:text-gray-300 transition-colors">How it works</Link>
          <Link href="#" className="hover:text-gray-300 transition-colors">Features</Link>
          <Link href="#" className="hover:text-gray-300 transition-colors">Pricing</Link>
        </div>
        <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
          Upgrade
        </Button>
      </nav>

      {/* 404 Content */}
      <main className="container mx-auto px-6 pt-20 text-center">
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-[#96E072] to-[#96E072]/50 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-t from-[#96E072] to-[#96E072]/50 rounded-full blur-3xl opacity-10" />
          
          {/* Error Text */}
          <div className="relative z-10">
            <h1 className="text-[200px] font-playfair leading-none tracking-tighter">
              <span className="text-gray-600">E</span>
              <span className="text-gray-600">r</span>
              <span className="text-gray-600">r</span>
              <span className="text-gray-600">o</span>
              <span className="text-gray-600">r</span>
              <span className="text-white">40</span>
              <span className="text-white rotate-45 inline-block">+</span>
            </h1>
            <p className="text-gray-400 text-xl mt-6 font-sans">
              The page you were looking for was either removed or doesn&apos;t exist.
            </p>
            <Link href="/">
              <Button className="mt-8 bg-[#96E072] text-black hover:bg-[#7BC55C] font-sans">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}