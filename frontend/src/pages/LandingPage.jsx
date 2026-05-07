/**
 * FFZone – Landing Page
 * Hero with animated background, stats bar, featured tournaments.
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiZap, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi'
import { GiFlame, GiCrossedSwords, GiTrophy, GiTargetShot } from 'react-icons/gi'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import TournamentCard from '../components/TournamentCard'

// ── Animated orbs background ──────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#F97316]/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#7C3AED]/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-3/4 w-64 h-64 rounded-full bg-[#22D3EE]/5 blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Rotating ring */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border border-[#F97316]/10 animate-spin-slow" />
      <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full border border-[#7C3AED]/15 animate-spin-slow" style={{ animationDuration: '15s' }} />

      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-[#F97316]/30"
          style={{
            top:  `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-5 text-center"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      <div className="text-white/50 text-xs font-medium">{label}</div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { data } = useQuery({
    queryKey: ['featured-tournaments'],
    queryFn:  () => api.get('/tournaments/?status=upcoming&page=1').then(r => r.data),
  })

  const featured = data?.tournaments?.slice(0, 3) || []

  return (
    <div className="min-h-screen bg-[#0B0F1A]">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#F97316]/10 border border-[#F97316]/30 rounded-full px-4 py-2 text-sm text-[#F97316] font-semibold mb-8"
          >
            <GiFlame className="animate-pulse" />
            India's #1 Free Fire Tournament Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
          >
            COMPETE.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#ea580c] text-glow-fire">
              WIN.
            </span>
            <br />
            DOMINATE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            Join daily Free Fire tournaments, prove your skills, and claim your prize. 
            Solo, Duo, or Squad — we've got every mode covered.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/tournaments" className="btn-fire px-8 py-3 text-base glow-fire flex items-center gap-2">
              <GiCrossedSwords size={18} />
              Browse Tournaments
            </Link>
            <Link to="/login?tab=register" className="btn-ghost px-8 py-3 text-base flex items-center gap-2">
              <FiZap size={18} />
              Join for Free
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-0.5 h-8 bg-gradient-to-b from-[#F97316] to-transparent" />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={GiTrophy}      label="Tournaments Hosted" value="500+"   color="#F97316" />
          <StatCard icon={FiUsers}       label="Active Players"     value="10K+"   color="#22D3EE" />
          <StatCard icon={GiTargetShot}  label="Kills Recorded"     value="1.2M+"  color="#7C3AED" />
          <StatCard icon={FiAward}       label="Prize Distributed"  value="₹5L+"   color="#F97316" />
        </div>
      </section>

      {/* ── Featured Tournaments ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              🔥 Featured <span className="text-[#F97316]">Tournaments</span>
            </h2>
            <p className="text-white/50 text-sm mt-1">Upcoming competitions you can join right now</p>
          </div>
          <Link to="/tournaments" className="btn-ghost text-sm py-2">View All →</Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(t => <TournamentCard key={t._id} tournament={t} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <GiCrossedSwords size={48} className="mx-auto mb-4 opacity-30" />
            <p>No upcoming tournaments yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">Why Choose <span className="text-[#F97316]">FFZone</span>?</h2>
            <p className="text-white/50">Everything you need for the ultimate esports experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiZap,    color: '#F97316', title: 'Instant Registration',   desc: 'Join tournaments in seconds with our streamlined QR or Razorpay payment flow.' },
              { icon: GiTrophy, color: '#22D3EE', title: 'Real Prize Pools',       desc: 'Compete for real cash prizes distributed directly after tournament completion.' },
              { icon: FiUsers,  color: '#7C3AED', title: 'Team Finder',            desc: 'Find Duo & Squad partners from our active community of Free Fire players.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="card p-10 text-center relative overflow-hidden glow-fire">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F97316]/5 to-[#7C3AED]/5" />
          <GiFlame className="text-5xl text-[#F97316] mx-auto mb-4 animate-pulse-glow relative z-10" />
          <h2 className="text-3xl font-black text-white mb-3 relative z-10">Ready to Dominate?</h2>
          <p className="text-white/60 mb-6 relative z-10">Create your account and join the battle today. First match is free!</p>
          <Link to="/login?tab=register" className="btn-fire px-10 py-3 text-base relative z-10 inline-block">
            Start Playing Now 🔥
          </Link>
        </div>
      </section>
    </div>
  )
}
