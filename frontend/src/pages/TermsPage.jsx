import React from 'react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050810] pt-24 pb-16 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#F97316]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Terms of <span className="text-[#F97316]">Service</span></h1>
        <p className="text-white/50 text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using FFZone, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 2. User Accounts
            </h2>
            <p>
              You must register for an account to participate in tournaments. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 3. Fair Play & Anti-Cheat
            </h2>
            <p>
              FFZone maintains a strict zero-tolerance policy against hacking, scripting, or exploiting bugs. Any player found violating this policy will face an immediate, permanent ban and forfeit any pending prize money.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 4. Modifications to Service
            </h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that FFZone shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
