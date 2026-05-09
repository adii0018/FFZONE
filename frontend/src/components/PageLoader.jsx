import React from 'react';
import Loader from './Loader';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#050d1a] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <Loader size={120} color="#00f5ff" />
        <p className="text-white/40 text-sm font-medium animate-pulse tracking-widest uppercase">
          Loading FFZone...
        </p>
      </div>
    </div>
  );
}

export default PageLoader;
