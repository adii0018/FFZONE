import React, { useState } from 'react'
import { GiCrosshair } from 'react-icons/gi'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

const FAQS = [
  {
    category: 'Tournaments',
    items: [
      {
        q: 'How do I join a tournament?',
        a: 'Go to the Tournaments page, pick an upcoming tournament, and click "Register Now". You will need to pay the entry fee via our secure payment gateway. Once confirmed, your slot is booked!'
      },
      {
        q: 'How many players are in a team?',
        a: 'Most FFZone tournaments are squad-based (4 players). Some special events may feature solo or duo formats — check the specific tournament details page for more info.'
      },
      {
        q: 'What happens if my opponent team doesn\'t show up?',
        a: 'If an opponent team fails to show up within 15 minutes of the scheduled match time, report it to an admin via Discord. The match may be awarded as a walkover win for your team.'
      },
      {
        q: 'Can I register without a full squad?',
        a: 'Yes! Use our Team Finder feature to connect with other solo players or incomplete squads looking for teammates. You can form a full team before the tournament deadline.'
      },
    ]
  },
  {
    category: 'Payments & Prizes',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We currently accept UPI, Net Banking, Debit/Credit Cards, and popular wallets via our secure payment partner. All transactions are encrypted and safe.'
      },
      {
        q: 'How are prize winnings distributed?',
        a: 'Prizes are credited to your registered UPI ID or bank account within 3-5 business days after the tournament results are officially published and verified by our admins.'
      },
      {
        q: 'Can I get a refund on my entry fee?',
        a: 'Refunds are available only if you withdraw at least 48 hours before the tournament starts, or if the tournament is cancelled by us. Check our full Refund Policy for details.'
      },
    ]
  },
  {
    category: 'Account & Technical',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the Login page, click "Forgot Password". Enter your registered email and we will send you a reset link. Check your spam folder if you don\'t see it within a few minutes.'
      },
      {
        q: 'Why is my account banned?',
        a: 'Accounts are banned for violating our Terms of Service — typically for using hacks, cheats, or toxic behavior. If you believe your ban is a mistake, contact us via the Contact Us page with your account details.'
      },
      {
        q: 'How do I update my in-game UID?',
        a: 'Go to your Profile page (accessible from the Navbar after logging in) and edit your Free Fire UID. Make sure it is correct as it is used for verification in tournaments.'
      },
    ]
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${open ? 'border-[#00f5ff]/50 bg-[#00f5ff]/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <h3 className={`font-semibold text-sm transition-colors ${open ? 'text-[#00f5ff]' : 'text-white'}`}>{q}</h3>
        <div className={`flex-shrink-0 transition-colors ${open ? 'text-[#00f5ff]' : 'text-white/40'}`}>
          {open ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </div>
      </div>
      {open && (
        <div className="px-5 pb-5 text-white/70 text-sm leading-relaxed border-t border-[#00f5ff]/20 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#050810] pt-24 pb-16 font-sans relative overflow-hidden">
      {/* BG glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00f5ff]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[400px] bg-[#00f5ff]/4 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-[#00f5ff] font-semibold mb-4">
            <GiCrosshair /> KNOWLEDGE BASE
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            Frequently Asked <span className="text-[#00f5ff]">Questions</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-lg">
            Can't find an answer? Reach out via our <a href="/contact" className="text-[#00f5ff] hover:underline">Contact page</a> and we'll get back to you ASAP.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {FAQS.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span>
                <h2 className="text-xl font-bold text-white">{section.category}</h2>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
              <div className="space-y-3">
                {section.items.map((item, iIdx) => (
                  <FaqItem key={iIdx} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-[#00f5ff]/10 to-transparent border border-[#00f5ff]/20 rounded-2xl p-10">
          <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-white/60 mb-6">Our support team is online and ready to help you out.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#00f5ff] hover:bg-[#ea580c] text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_0_rgba(249,115,22,0.4)]"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
