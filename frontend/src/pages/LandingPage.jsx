/**
 * FFZone – Landing Page
 * Hero with animated background, stats bar, featured tournaments.
 */

import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useInView } from 'framer-motion'
import { FiZap, FiUsers, FiAward } from 'react-icons/fi'
import { GiFlame, GiCrossedSwords, GiTrophy, GiTargetShot } from 'react-icons/gi'
import { FaFire } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import TournamentCard from '../components/TournamentCard'

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

// ── Star field background ──────────────────────────────────────────────────
const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  delay: `${Math.random() * 5}s`,
  dur: `${2 + Math.random() * 3}s`,
}))

function StarField() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {STARS.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white opacity-0"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
            boxShadow: `0 0 ${parseInt(s.size) * 2}px rgba(255,255,255,0.8)`,
          }}
        />
      ))}
    </div>
  )
}

// ── SVG Dividers ──────────────────────────────────────────────────────────
function SectionDivider({ type = 'slant', color = '#05070A', flip = false }) {
  const glowColor = "#FF007F";
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#FF007F]/10 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#00FF9C]/8 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-3/4 w-64 h-64 rounded-full bg-[#00D2FF]/8 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
    </div>
  )
}

// ── Dynamic Background Section Wrapper ─────────────────────────────────────
function DynamicSection({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF007F]/5 via-transparent to-[#00FF9C]/5 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,0,127,0.03)_0,transparent_70%)] animate-float" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="card p-5 text-center group hover:bg-[#0E121A]/80 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="text-2xl font-black text-white mb-1 tracking-tight">{value}</div>
      <div className="text-white/50 text-xs font-bold uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { data } = useQuery({
    queryKey: ['featured-tournaments'],
    queryFn: () => api.get('/tournaments/?status=upcoming&page=1').then(r => r.data),
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
    '/landing-bg.png',
    '/slide-1.jpg',
    '/slide-2.jpg',
    '/slide-3.png',
    '/slide-4.jpg'
  ]

  const heroTitles = [
    <>Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-glow-fire">Begins</span><br />Here</>,
    <>Only <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-glow-fire">Legends</span><br />Survive</>,
    <>Rise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-glow-fire">To</span><br />Booyah</>,
    <>India's Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-glow-fire">FF</span><br />Arena</>,
    <>Dominate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-glow-fire">The</span><br />Battleground</>
  ]

  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#05070A] relative overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#FF007F] z-[100] origin-left"
        style={{ scaleX, boxShadow: '0 0 10px rgba(255,0,127,0.8)' }}
      />

      <StarField />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Crossfade background slides */}
        {bgImages.map((src, i) => (
          <div
            key={src}
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === bgIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              position: 'absolute',
              inset: 0,
              zIndex: 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-[#05070A]/60" style={{ zIndex: 1 }}></div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}><AnimatedBackground /></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#FF007F]/10 border border-[#FF007F]/30 rounded-full px-4 py-2 text-sm text-[#FF007F] font-bold mb-8 uppercase tracking-widest"
          >
            <GiFlame className="animate-pulse" />
            India's #1 Free Fire Tournament Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            key={bgIndex}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-4xl sm:text-5xl md:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tighter"
          >
            {heroTitles[bgIndex]}
          </motion.h1>

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
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/tournaments" className="btn-fire px-10 py-4 text-base glow-fire flex items-center gap-2 font-black uppercase tracking-wider hover:scale-105 transition-transform active:scale-95">
              <GiCrossedSwords size={20} />
              Browse Tournaments
            </Link>
            <Link to="/login?tab=register" className="btn-ghost px-10 py-4 text-base flex items-center gap-2 font-black uppercase tracking-wider hover:scale-105 transition-transform active:scale-95">
              <FiZap size={20} />
              Join for Free
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
        >
          <div className="w-[2px] h-12 bg-gradient-to-b from-[#FF007F] to-transparent" />
        </motion.div>

        {/* Bottom Mask for Hero */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#05070A] to-transparent z-10" />

        <div className="absolute bottom-0 w-full z-40">
          <SectionDivider type="slant" flip />
        </div>
      </section>

      {/* ── Featured Tournaments ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-32 relative overflow-hidden -mt-20 z-10">
        <ScrollReveal className="flex items-center justify-between mb-12 relative z-20">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 tracking-tight">
              <FaFire className="text-[#FF007F] animate-pulse" /> Featured <span className="text-[#FF007F]">Tournaments</span>
            </h2>
            <p className="text-white/50 text-base mt-2 font-medium">Upcoming competitions you can join right now</p>
          </div>
          <Link to="/tournaments" className="btn-ghost text-sm py-2 px-6 font-bold hover:bg-[#FF007F] hover:text-white transition-all">View All →</Link>
        </ScrollReveal>

        {featured.length > 0 ? (
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
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Why Choose <span className="text-[#FF007F]">FFZone</span>?</h2>
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
              { icon: FiZap, color: '#FF007F', title: 'Instant Registration', desc: 'Join tournaments in seconds with our streamlined QR or Razorpay payment flow.' },
              { icon: GiTrophy, color: '#00D2FF', title: 'Real Prize Pools', desc: 'Compete for real cash prizes distributed directly after tournament completion.' },
              { icon: FiUsers, color: '#00FF9C', title: 'Team Finder', desc: 'Find Duo & Squad partners from our active community of Free Fire players.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="card p-8 group hover:bg-[#0E121A]/80 transition-all duration-500 hover:shadow-[0_0_50px_-12px_rgba(255,0,127,0.3)]"
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
          <ScrollReveal delay={0.1} className="card p-10 md:p-14 relative overflow-hidden group border border-[#FF007F]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF007F]/10 to-transparent" />
            <div className="relative z-10">
              <span className="text-[#FF007F] font-black uppercase tracking-[0.3em] text-xs mb-4 block">Elite Community</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Master the <span className="text-glow-fire text-[#FF007F]">Arena</span></h2>
              <p className="text-white/60 text-lg mb-10 font-medium leading-relaxed">
                Connect with India's top Free Fire players. Get exclusive tips, early tournament access, and participate in mega giveaways.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <motion.a whileHover={{ y: -5 }} href="#" className="flex items-center gap-3 bg-[#5865F2]/10 border border-[#5865F2]/30 px-6 py-3 rounded-xl text-white font-bold hover:bg-[#5865F2]/20 transition-all">
                  <div className="w-8 h-8 bg-[#5865F2] rounded-lg flex items-center justify-center shadow-lg shadow-[#5865F2]/40">
                    <FiZap size={18} />
                  </div>
                  Discord
                </motion.a>
                <motion.a whileHover={{ y: -5 }} href="#" className="flex items-center gap-3 bg-[#00D2FF]/10 border border-[#00D2FF]/30 px-6 py-3 rounded-xl text-white font-bold hover:bg-[#00D2FF]/20 transition-all">
                  <div className="w-8 h-8 bg-[#00D2FF] rounded-lg flex items-center justify-center shadow-lg shadow-[#00D2FF]/40">
                    <FiUsers size={18} />
                  </div>
                  Telegram
                </motion.a>
              </div>

              <Link to="/login?tab=register" className="btn-fire px-12 py-4 text-lg glow-fire inline-flex items-center gap-3 font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                Get Started Now <FaFire />
              </Link>
            </div>
          </ScrollReveal>

          {/* Steps to Win Card */}
          <ScrollReveal delay={0.2} className="card p-10 md:p-14 relative overflow-hidden border border-white/5 bg-[#0E121A]/50">
            <div className="relative z-10">
              <span className="text-[#00FF9C] font-black uppercase tracking-[0.3em] text-xs mb-4 block">How to play</span>
              <h2 className="text-4xl font-black text-white mb-10 tracking-tight">Your Path to <span className="text-[#00FF9C]">Glory</span></h2>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'Register Account', desc: 'Create your profile and verify your Free Fire UID in seconds.', color: '#FF007F' },
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

      {/* ── Stats Bar ────────────────────────── */}
      <DynamicSection className="py-24 relative -mt-20 z-40">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            <StatCard icon={GiTrophy} label="Tournaments Hosted" value="500+" color="#FF007F" />
            <StatCard icon={FiUsers} label="Active Players" value="10K+" color="#00D2FF" />
            <StatCard icon={GiTargetShot} label="Kills Recorded" value="1.2M+" color="#00FF9C" />
            <StatCard icon={FiAward} label="Prize Distributed" value="₹5L+" color="#FF007F" />
          </motion.div>
        </div>
      </DynamicSection>
    </div>
  )
}
