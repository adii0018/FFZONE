import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import FuzzyText from '../components/FuzzyText';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
        style={{ backgroundImage: "url('/404-bg.png')" }}
      />
      
      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/80 via-transparent to-[#050d1a]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-transparent to-transparent" />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f5ff] rounded-full filter blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0066ff] rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center backdrop-blur-[2px] p-8 rounded-3xl border border-white/5 bg-black/20"
      >
        <div className="flex justify-center mb-2">
          <FuzzyText 
            baseIntensity={0.2}
            hoverIntensity={0.6}
            enableHover
            color="#00f5ff"
            fontSize="clamp(5rem, 15vw, 12rem)"
            fontWeight={900}
          >
            404
          </FuzzyText>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          ZONE COMPROMISED
        </h1>
        
        <p className="text-white/80 text-base md:text-lg max-w-md mx-auto mb-8 font-medium tracking-tight drop-shadow-[0_2_5px_rgba(0,0,0,1)]">
          You've drifted outside the safe zone! This sector hasn't been mapped. Retreat to base immediately.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="btn-fire px-10 py-3.5 flex items-center gap-2 text-base font-bold uppercase tracking-wider group w-full sm:w-auto justify-center glow-fire"
          >
            <FiHome size={20} />
            Back to Base
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-10 py-3.5 border border-white/20 bg-white/5 backdrop-blur-md hover:border-[#00D2FF] hover:bg-[#00D2FF]/10 text-white transition-all duration-300 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider w-full sm:w-auto justify-center"
          >
            <FiArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Decorative Lines */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent opacity-50" />
    </div>
  );
};

export default NotFoundPage;
