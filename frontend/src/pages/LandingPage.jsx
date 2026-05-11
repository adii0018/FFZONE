/**
 * FFZone – Landing Page
 * Hero with animated background, stats bar, featured tournaments.
 */

import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion'
import { FiZap, FiUsers, FiAward } from 'react-icons/fi'
import { GiFlame, GiCrossedSwords, GiTrophy, GiTargetShot, GiMedal } from 'react-icons/gi'
import { FaFire } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import TournamentCard from '../components/TournamentCard'
import StarField from '../components/StarField'

// ── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
}

const revealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

// ── Scroll Reveal Component ───────────────────────────────────────────────
function ScrollReveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={revealVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}


// ── SVG Dividers ──────────────────────────────────────────────────────────
function SectionDivider({ type = 'slant', color = '#050d1a', flip = false }) {
  const glowColor = "#00f5ff";
  const shapes = {
    slant: (
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-[70px] ${flip ? 'rotate-180' : ''}`} style={{ filter: `drop-shadow(0 -2px 10px ${glowColor}40)` }}>
        <path d="M1200 120L0 16.48V0h1200v120z" fill={color}></path>
      </svg>
    ),
    wave: (
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-[90px] ${flip ? 'rotate-180' : ''}`} style={{ filter: `drop-shadow(0 -2px 10px ${glowColor}40)` }}>
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,14.29,1200,52.47V0Z" fill={color}></path>
      </svg>
    ),
    curve: (
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`w-full h-[70px] ${flip ? 'rotate-180' : ''}`} style={{ filter: `drop-shadow(0 -2px 10px ${glowColor}40)` }}>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill={color}></path>
      </svg>
    )
  }
  return <div className="absolute left-0 w-full z-40 pointer-events-none">{shapes[type]}</div>
}

// ── Animated orbs background ──────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00f5ff]/10 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00FF9C]/8 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-3/4 w-64 h-64 rounded-full bg-[#0066ff]/8 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
    </div>
  )
}

// ── Dynamic Background Section Wrapper ─────────────────────────────────────
function DynamicSection({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00f5ff]/5 via-transparent to-[#00FF9C]/5 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.03)_0,transparent_70%)] animate-float" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── Cyber Marquee ──────────────────────────────────────────────────────────
function Marquee({ items, speed = 40, reverse = false, className = "" }) {
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const handleClick = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsPaused(false), 3000); // Resume after 3s
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div 
      onClick={handleClick}
      className={`relative flex overflow-hidden bg-transparent border-y border-[#00f5ff]/10 py-6 cursor-pointer group select-none transition-all duration-500 ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <div
        className={`flex whitespace-nowrap items-center ${reverse ? 'animate-marquee-right' : 'animate-marquee-left'} ${isPaused ? 'pause-animation' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center mx-12">
            {/* Unique Gaming Icon before each item */}
            <div className="p-3 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20 mr-6 transform -skew-x-12 group-hover:glow-cyan transition-all">
              {idx % 3 === 0 && <GiTargetShot className="text-[#00f5ff] text-2xl" />}
              {idx % 3 === 1 && <GiCrossedSwords className="text-[#00FF9C] text-2xl" />}
              {idx % 3 === 2 && <GiMedal className="text-[#00D2FF] text-2xl" />}
            </div>
            
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f5ff] to-white/80 font-black text-2xl sm:text-3xl italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(0,245,255,0.3)]">
              {item}
            </span>
            
            <div className="mx-12 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent" />
          </div>
        ))}
      </div>
      
      {/* Edge Fades with deeper glow */}
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#050d1a] via-[#050d1a]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#050d1a] via-[#050d1a]/80 to-transparent z-10 pointer-events-none" />
    </div>
  )
}

// ── Count-up Hook ────────────────────────────────────────────────────────
function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      let startTime = null;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentCount = Math.floor(progress * (end - start) + start);
        setCount(currentCount);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setHasAnimated(true);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, start, duration, hasAnimated]);

  return { count, ref };
}

// ── Holographic Stat Card ───────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, suffix = "" }) {
  // Extract number from value string (e.g., "500+" -> 500)
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const { count, ref } = useCountUp(numericValue);

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className="relative group p-6 sm:p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-[#00f5ff]/30 hover:bg-white/[0.04] hover:-translate-y-2"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00f5ff]/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Icon with Ring */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 mx-auto group-hover:border-[#00f5ff]/40 transition-all duration-500 shadow-xl group-hover:shadow-[#00f5ff]/20">
        <Icon size={28} style={{ color }} className="group-hover:scale-110 transition-transform duration-500" />
        {/* Orbiting ring effect */}
        <div className="absolute inset-[-4px] rounded-2xl border border-[#00f5ff]/0 group-hover:border-[#00f5ff]/20 transition-all duration-700 scale-90 group-hover:scale-100" />
      </div>

      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter flex items-center justify-center gap-1">
          <span style={{ textShadow: `0 0 20px ${color}40` }}>{count.toLocaleString()}{suffix}</span>
        </div>
        <div className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{label}</div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

export default function LandingPage() {
  const { data } = useQuery({
    queryKey: ['featured-tournaments'],
    queryFn: () => api.get('/tournaments/?status=upcoming&page=1').then(r => r.data),
    staleTime: 3 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })

  const { data: publicStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/tournaments/public-stats/').then(r => r.data),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  })

  const featured = data?.tournaments?.slice(0, 3) || []

  // Scroll Progress
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const bgImages = [
    '/hero-main.png',
    '/slide-1.jpg',
    '/slide-2.jpg',
    '/slide-3.png',
    '/slide-4.jpg'
  ]

  const heroTitles = [
    <>Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-glow-fire">Begins</span><br />Here</>,
    <>Only <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-glow-fire">Legends</span><br />Survive</>,
    <>Rise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-glow-fire">To</span><br />Booyah</>,
    <>India's Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-glow-fire">FF</span><br />Arena</>,
    <>Dominate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-glow-fire">The</span><br />Battleground</>
  ]

  const [bgIndex, setBgIndex] = useState(0)
  const [badgeIndex, setBadgeIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  const badgePhrases = [
    "India's #1 Free Fire Tournament Platform",
    "Join 10,000+ Elite Battle Royale Players",
    "Daily Scrims, Customs & Mega Giveaways",
    "Win Real Cash Prizes Every Single Day",
    "The Ultimate Destination for FF Legends",
    "Fast Payouts & Transparent Fair Play"
  ]

  // Optimized: Preload only first image, then lazy load next ones
  useEffect(() => {
    const preloadFirstImage = () => {
      const img = new Image()
      img.src = bgImages[0]
      img.onload = () => setImagesLoaded(true)
      img.onerror = () => setImagesLoaded(true) // Continue anyway
    }
    
    preloadFirstImage()
  }, [])

  // Lazy load next image when current changes
  useEffect(() => {
    if (!imagesLoaded) return
    
    const nextIndex = (bgIndex + 1) % bgImages.length
    const img = new Image()
    img.src = bgImages[nextIndex]
    // No need to track loading - browser will cache it
  }, [bgIndex, imagesLoaded])

  useEffect(() => {
    if (!imagesLoaded) return
    
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length)
    }, 5000)
    
    // Rotate badge phrases - increased to 5s for better readability
    const badgeInterval = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % badgePhrases.length)
    }, 5000)
    
    return () => {
      clearInterval(interval)
      clearInterval(badgeInterval)
    }
  }, [imagesLoaded, badgePhrases.length])

  return (
    <div className="min-h-screen bg-[#050d1a] relative overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#00f5ff] z-[100] origin-left"
        style={{ scaleX, boxShadow: '0 0 10px rgba(0,245,255,0.8)' }}
      />

      <StarField />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Optimized: Only render current and next image */}
        {imagesLoaded ? (
          <>
            {/* Current image */}
            <div
              key={`current-${bgIndex}`}
              style={{
                backgroundImage: `url('${bgImages[bgIndex]}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 1,
                transition: 'opacity 1.5s ease-in-out',
                position: 'absolute',
                inset: 0,
                zIndex: 0,
              }}
            />
            {/* Next image (preloading for smooth transition) */}
            <div
              key={`next-${(bgIndex + 1) % bgImages.length}`}
              style={{
                backgroundImage: `url('${bgImages[(bgIndex + 1) % bgImages.length]}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0,
                transition: 'opacity 1.5s ease-in-out',
                position: 'absolute',
                inset: 0,
                zIndex: 0,
              }}
            />
          </>
        ) : (
          // Fallback gradient while first image loads
          <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#071428] to-[#050d1a]" style={{ zIndex: 0 }} />
        )}
        <div className="absolute inset-0 bg-[#050d1a]/60" style={{ zIndex: 1 }}></div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}><AnimatedBackground /></div>
        
        {/* ── Gaming Overlays ──────────────────────────────── */}
        <div className="scanline-overlay z-[3] pointer-events-none" aria-hidden="true" />
        <div className="scanline-moving z-[4] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-full px-4 py-2 text-[10px] sm:text-xs text-[#00f5ff] font-bold mb-8 uppercase tracking-widest min-h-[40px] overflow-hidden"
          >
            <GiFlame className="animate-pulse flex-shrink-0" />
            <div className="relative h-4 flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={badgeIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="whitespace-nowrap"
                >
                  {publicStats && badgeIndex === 0
                    ? publicStats.live_tournaments > 0
                      ? <><span className="text-[#00FF9C]">{publicStats.live_tournaments} Live</span> · {publicStats.total_players.toLocaleString()}+ Players · ₹{(publicStats.total_prizes / 1000).toFixed(0)}K+ Prizes</>
                      : <>{publicStats.total_tournaments}+ Tournaments · {publicStats.total_players.toLocaleString()}+ Players</>
                    : badgePhrases[badgeIndex]
                  }
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="relative min-h-[120px] sm:min-h-[160px] md:min-h-[240px] flex items-center justify-center mb-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={bgIndex}
                initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(15px)' }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1, 
                  filter: ['blur(15px)', 'blur(0px)', 'blur(2px)', 'blur(0px)'],
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: 1.1, 
                  filter: 'blur(15px)',
                  transition: { duration: 0.4 }
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-4xl sm:text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter absolute w-full select-none"
              >
                {/* Visual Glitch Layer */}
                <motion.span
                  animate={{ 
                    x: [0, -2, 2, -1, 0],
                    opacity: [1, 0.8, 1, 0.9, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {heroTitles[bgIndex]}
                </motion.span>
                
                {/* Chromatic Aberration Effect on Enter */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                  className="absolute inset-0 text-red-500 mix-blend-screen opacity-50 blur-[1px] translate-x-1"
                >
                  {heroTitles[bgIndex]}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, times: [0, 0.5, 1] }}
                  className="absolute inset-0 text-blue-500 mix-blend-screen opacity-50 blur-[1px] -translate-x-1"
                >
                  {heroTitles[bgIndex]}
                </motion.div>
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium"
          >
            Join daily Free Fire tournaments, prove your skills, and claim your prize.
            Solo, Duo, or Squad — we've got every mode covered.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
          >
            <Link 
              to="/tournaments" 
              className="btn-fire px-8 sm:px-10 py-4 text-base glow-fire flex items-center justify-center gap-2 font-black uppercase tracking-wider hover:scale-105 transition-transform active:scale-95 w-full sm:w-auto min-h-[52px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <GiCrossedSwords size={20} />
              Browse Tournaments
            </Link>
            <Link 
              to="/login?tab=register" 
              className="btn-ghost px-8 sm:px-10 py-4 text-base flex items-center justify-center gap-2 font-black uppercase tracking-wider hover:scale-105 transition-transform active:scale-95 w-full sm:w-auto min-h-[52px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <FiZap size={20} />
              Join for Free
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator - hidden on mobile */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 sm:bottom-24 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 z-30"
          aria-label="Scroll down for more content"
          role="img"
        >
          <div className="w-[2px] h-12 bg-gradient-to-b from-[#00f5ff] to-transparent" />
        </motion.div>

        {/* Bottom Mask for Hero */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050d1a] to-transparent z-10" />

        <div className="absolute bottom-0 w-full z-40">
          <SectionDivider type="slant" flip />
        </div>
      </section>


      {/* ── Featured Tournaments ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-32 relative overflow-hidden -mt-20 z-10">
        <ScrollReveal className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 relative z-20">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 tracking-tight">
              <FaFire className="text-[#00f5ff] animate-pulse" /> Featured <span className="text-[#00f5ff]">Tournaments</span>
            </h2>
            <p className="text-white/50 text-base mt-2 font-medium">Upcoming competitions you can join right now</p>
          </div>
          <Link to="/tournaments" className="btn-ghost text-sm py-2 px-6 font-bold hover:bg-[#00f5ff] hover:text-[#050d1a] transition-all whitespace-nowrap">View All →</Link>
        </ScrollReveal>

        {!data ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-40 bg-white/5 rounded-xl mb-4" />
                <div className="h-6 bg-white/5 rounded mb-2 w-3/4" />
                <div className="h-4 bg-white/5 rounded mb-4 w-1/2" />
                <div className="h-10 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20"
          >
            {featured.map(t => (
              <motion.div key={t._id} variants={itemVariants}>
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <ScrollReveal className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 relative z-20">
            <GiCrossedSwords size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-white/40 font-bold uppercase tracking-widest">No upcoming tournaments yet</p>
          </ScrollReveal>
        )}
        <div className="absolute bottom-0 w-full">
          <SectionDivider type="wave" flip />
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <DynamicSection className="py-40 relative -mt-24 z-20">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Why Choose <span className="text-[#00f5ff]">FFZone</span>?</h2>
            <p className="text-white/50 text-lg font-medium">Everything you need for the ultimate esports experience</p>
          </ScrollReveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: FiZap, color: '#00f5ff', title: 'Instant Registration', desc: 'Join tournaments in seconds with our streamlined QR or Razorpay payment flow.' },
              { icon: GiTrophy, color: '#00D2FF', title: 'Real Prize Pools', desc: 'Compete for real cash prizes distributed directly after tournament completion.' },
              { icon: FiUsers, color: '#00FF9C', title: 'Team Finder', desc: 'Find Duo & Squad partners from our active community of Free Fire players.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="card p-8 group hover:bg-[#071428]/80 transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(0,245,255,0.3)]"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={26} style={{ color }} />
                </div>
                <h3 className="text-white font-black text-xl mb-3 tracking-tight">{title}</h3>
                <p className="text-white/50 text-base leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </DynamicSection>

      {/* ── Community Hub ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-40 relative -mt-24 z-30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Join Community Card */}
          <ScrollReveal delay={0.1} className="card p-10 md:p-14 relative overflow-hidden group border border-[#00f5ff]/20 flex flex-col justify-end" style={{ minHeight: '500px' }}>
            <div 
              className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-700 bg-cover bg-center" 
              style={{ backgroundImage: 'url("/community-bg.png")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#050d1a]/60 to-transparent z-0" />
            <div className="relative z-10">
              <span className="text-[#00f5ff] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Elite Community</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Master the <span className="text-glow-fire text-[#00f5ff]">Arena</span></h2>
              <p className="text-white/60 text-lg mb-10 font-medium leading-relaxed">
                Connect with India's top Free Fire players. Get exclusive tips, early tournament access, and participate in mega giveaways.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <motion.a 
                  whileHover={{ y: -5 }} 
                  href="https://discord.gg/ffzone" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#5865F2]/10 border border-[#5865F2]/30 px-6 py-3 rounded-xl text-white font-bold hover:bg-[#5865F2]/20 transition-all"
                >
                  <div className="w-8 h-8 bg-[#5865F2] rounded-lg flex items-center justify-center shadow-lg shadow-[#5865F2]/40">
                    <FiZap size={18} />
                  </div>
                  Discord
                </motion.a>
                <motion.a 
                  whileHover={{ y: -5 }} 
                  href="https://t.me/ffzone" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#00D2FF]/10 border border-[#00D2FF]/30 px-6 py-3 rounded-xl text-white font-bold hover:bg-[#00D2FF]/20 transition-all"
                >
                  <div className="w-8 h-8 bg-[#00D2FF] rounded-lg flex items-center justify-center shadow-lg shadow-[#00D2FF]/40">
                    <FiUsers size={18} />
                  </div>
                  Telegram
                </motion.a>
              </div>

              <Link to="/login?tab=register" className="btn-fire px-8 sm:px-12 py-4 text-base sm:text-lg glow-fire inline-flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 w-full sm:w-auto min-h-[52px]" style={{ WebkitTapHighlightColor: 'transparent' }}>
                Get Started Now <FaFire />
              </Link>
            </div>
          </ScrollReveal>

          {/* Steps to Win Card */}
          <ScrollReveal delay={0.2} className="card p-10 md:p-14 relative overflow-hidden border border-white/5 bg-[#071428]/50 flex flex-col justify-end" style={{ minHeight: '500px' }}>
            <div 
              className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 bg-cover bg-center" 
              style={{ backgroundImage: 'url("/steps-bg.png")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#050d1a]/60 to-transparent z-0" />
            <div className="relative z-10">
              <span className="text-[#00FF9C] font-black uppercase tracking-[0.3em] text-xs mb-4 block">How to play</span>
              <h2 className="text-4xl font-black text-white mb-10 tracking-tight">Your Path to <span className="text-[#00FF9C]">Glory</span></h2>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Register Account', desc: 'Create your profile and verify your Free Fire UID in seconds.', color: '#00f5ff' },
                  { step: '02', title: 'Join Tournament', desc: 'Browse upcoming matches and secure your slot with easy payments.', color: '#00D2FF' },
                  { step: '03', title: 'Dominate & Win', desc: 'Compete in the battleground and claim your prizes instantly.', color: '#00FF9C' },
                ].map((s) => (
                  <motion.div key={s.step} whileHover={{ x: 10 }} className="flex gap-6 group cursor-default">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl transition-all duration-300 group-hover:glow-cyan" style={{ color: s.color }}>
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xl mb-1 tracking-tight group-hover:text-white transition-colors">{s.title}</h3>
                      <p className="text-white/40 text-sm font-medium">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ── Stats Bar - Using Real API Data ────────────────────────── */}
      <DynamicSection className="py-24 relative -mt-20 z-40">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <StatCard 
              icon={GiTrophy} 
              label="Tournaments Hosted" 
              value={publicStats?.total_tournaments?.toString() || "500"} 
              suffix="+" 
              color="#00f5ff" 
            />
            <StatCard 
              icon={FiUsers} 
              label="Active Players" 
              value={publicStats?.total_players?.toString() || "10000"} 
              suffix="+" 
              color="#00D2FF" 
            />
            <StatCard 
              icon={GiTargetShot} 
              label="Matches Played" 
              value={publicStats?.total_tournaments ? (publicStats.total_tournaments * 3).toString() : "1500"} 
              suffix="+" 
              color="#00FF9C" 
            />
            <StatCard 
              icon={FiAward} 
              label="Prize Distributed" 
              value={publicStats?.total_prizes ? Math.floor(publicStats.total_prizes / 1000).toString() : "500"} 
              suffix="K+" 
              color="#00f5ff" 
            />
          </motion.div>
        </div>
      </DynamicSection>

      {/* ── Dual Marquee Section ────────────────────────── */}
      <div className="pb-4 space-y-2 mt-4">
        <Marquee 
          speed={30}
          items={[
            "Live Scrims 24/7",
            "Daily Mega Prizes",
            "Fast & Secure Payouts",
            "100% Anti-Cheat System",
          ]}
        />
        <Marquee 
          speed={45}
          reverse
          items={[
            "Elite Community Hub",
            "Global Leaderboards",
            "Professional Casted Finals",
            "Instant Registration"
          ]}
        />
      </div>
    </div>
  )
}
