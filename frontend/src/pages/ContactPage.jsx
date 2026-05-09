import React, { useState } from 'react'
import { FaDiscord, FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa'
import { MdLocationOn, MdSend } from 'react-icons/md'
import { GiCrosshair } from 'react-icons/gi'
import toast from 'react-hot-toast'

const CONTACT_INFO = [
  { icon: FaEnvelope, label: 'Email Us', value: 'support@ffzone.gg', color: '#00f5ff', href: 'mailto:support@ffzone.gg' },
  { icon: FaDiscord, label: 'Discord Server', value: 'discord.gg/ffzone', color: '#5865F2', href: '#' },
  { icon: FaWhatsapp, label: 'WhatsApp', value: '+91 98765 43210', color: '#25D366', href: '#' },
  { icon: MdLocationOn, label: 'Based In', value: 'India 🇮🇳', color: '#00f5ff', href: null },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      toast.success('Message sent! We will get back to you shortly.')
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#050810] pt-24 pb-16 font-sans relative overflow-hidden">
      {/* BG glows */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-[#00f5ff]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00f5ff]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-[#00f5ff] font-semibold mb-4">
            <GiCrosshair /> GET IN TOUCH
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Contact <span className="text-[#00f5ff]">Us</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Got a problem? Question about a tournament? Or just want to say hi? We're here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {CONTACT_INFO.map((item, idx) => (
              <a
                key={idx}
                href={item.href || undefined}
                className="group flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-[#00f5ff]/40 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}20`, boxShadow: `0 0 20px ${item.color}20` }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
                </div>
              </a>
            ))}

            {/* Social Quick Links */}
            <div className="mt-2 bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Follow Us</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#00f5ff] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-300">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#5865F2] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(88,101,242,0.5)] transition-all duration-300">
                  <FaDiscord size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#25D366] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all duration-300">
                  <FaWhatsapp size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Your Name <span className="text-[#00f5ff]">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ProPlayer123"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm font-semibold mb-2">Email Address <span className="text-[#00f5ff]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Tournament issue, Payment query, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] transition-all"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Message <span className="text-[#00f5ff]">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-[#00f5ff] hover:bg-[#ea580c] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_0_rgba(249,115,22,0.4)]"
              >
                {sending ? 'Sending...' : <><MdSend size={18} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
