import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import FuzzyText from '../components/FuzzyText';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF007F] rounded-full filter blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D2FF] rounded-full filter blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-[#FF007F] drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]"
          >
            <FiAlertTriangle size={60} />
          </motion.div>
        </div>

        <div className="flex justify-center mb-2">
          <FuzzyText 
            baseIntensity={0.2}
            hoverIntensity={0.5}
            enableHover
            color="#FF007F"
            fontSize="clamp(6rem, 20vw, 15rem)"
            fontWeight={900}
          >
            404
          </FuzzyText>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
          ZONE NOT FOUND
        </h1>
        
        <p className="text-white/60 text-lg md:text-xl max-w-md mx-auto mb-10 font-medium tracking-tight">
          Oops! It seems you've wandered into an uncharted territory. This map hasn't been rendered yet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="btn-fire px-8 py-3 flex items-center gap-2 text-base font-bold uppercase tracking-wider group w-full sm:w-auto justify-center"
          >
            <FiHome size={20} />
            Back to Base
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 border border-white/10 hover:border-[#00D2FF] hover:bg-[#00D2FF]/5 text-white/70 hover:text-[#00D2FF] transition-all duration-300 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider w-full sm:w-auto justify-center"
          >
            <FiArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Decorative Lines */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF007F] to-transparent opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-50" />
    </div>
  );
};

export default NotFoundPage;
