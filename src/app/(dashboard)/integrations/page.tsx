import React from 'react';
import { Construction, Wrench, Clock, Mail } from 'lucide-react';

const UnderConstruction = () => {
  return (
    <div className="h-[90vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex justify-center mb-8">
            <div className="relative overflow-hidden">
              <Construction className="w-24 h-20 text-blue-500 animate-pulse" />
              <Wrench className="w-8 h-8 text-indigo-500 absolute -bottom-2 -right-1 animate-bounce" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-800 mb-4 overflow-hidden">
            Under Construction
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We&apos;re working hard to bring you something amazing. Our team is crafting a beautiful new experience just for you.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-5 h-5" />
              <span>bikashd003@gmail.com</span>
            </div>
          </div>

          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
            </div>
            <span className="text-sm text-gray-500 mt-2 inline-block">75% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;