import React from 'react';
import { Search, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <div className="relative inline-block">
              <Search className="w-24 h-24 text-purple-500" />
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                404
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you&apos;re looking for seems to have gone on vacation. Let&apos;s get you back on track.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;