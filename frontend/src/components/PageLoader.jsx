import React from 'react';
import Loader from './Loader';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#0B0F1A] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <Loader size={120} color="#F97316" />
        <p className="text-white/40 text-sm font-medium animate-pulse tracking-widest uppercase">
          Loading FFZone...
        </p>
      </div>
    </div>
  );
}

export default PageLoader;
