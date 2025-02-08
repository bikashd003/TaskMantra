import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white">
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
              <span className="text-white">404</span>
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