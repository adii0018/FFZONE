import React from 'react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050810] pt-24 pb-16 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Refund <span className="text-[#F97316]">Policy</span></h1>
        <p className="text-white/50 text-sm mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 1. Tournament Entry Fees
            </h2>
            <p>
              Once an entry fee is paid and a slot is confirmed in a tournament, it is generally non-refundable. This ensures the prize pool remains stable and the tournament schedule is not disrupted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 2. Cancellation by Organizers
            </h2>
            <p>
              If a tournament is cancelled by FFZone administrators due to unforeseen circumstances or low participation, all entry fees will be refunded in full to your wallet or original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 3. Withdrawal Requests
            </h2>
            <p>
              Withdrawal requests submitted at least 48 hours before the tournament start time may be eligible for a refund, subject to administrative approval. Requests made within 48 hours of the event will not be entertained.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> 4. Disqualification
            </h2>
            <p>
              Players or teams disqualified due to violating the Terms of Service, hacking, or using exploits are NOT eligible for any refund. Their entry fees will be forfeit.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
