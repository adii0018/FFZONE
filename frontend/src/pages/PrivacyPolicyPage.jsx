import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050810] pt-24 pb-16 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#00f5ff]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Privacy <span className="text-[#00f5ff]">Policy</span></h1>
        <p className="text-white/50 text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> 1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as your username, email address, in-game UID, and payment information when you register for a tournament or create an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> 2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to operate, maintain, and provide the features and functionality of the Service, as well as to communicate directly with you regarding tournaments and prize distributions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> 3. Sharing of Your Information
            </h2>
            <p>
              We do not rent or sell your personal information to third parties outside of FFZone without your consent. Your in-game name and statistics may be displayed publicly on tournament leaderboards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> 4. Security
            </h2>
            <p>
              We care about the security of your information and use commercially reasonable safeguards to preserve the integrity and security of all information we collect and that we share with our service providers.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
