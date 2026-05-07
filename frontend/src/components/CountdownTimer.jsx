/**
 * FFZone – Countdown Timer Component
 */

import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetTime, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetTime))

  useEffect(() => {
    if (!targetTime) return
    const id = setInterval(() => {
      const tl = getTimeLeft(targetTime)
      setTimeLeft(tl)
      if (tl.total <= 0) {
        clearInterval(id)
        onEnd?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  if (!targetTime || timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="badge badge-live">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block mr-1" />
          LIVE NOW
        </span>
      </div>
    )
  }

  const units = [
    { label: 'D',  value: timeLeft.days },
    { label: 'H',  value: timeLeft.hours },
    { label: 'M',  value: timeLeft.minutes },
    { label: 'S',  value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="bg-[#0B0F1A] border border-[rgba(249,115,22,0.3)] rounded-lg w-12 h-12 flex items-center justify-center">
            <span className="text-xl font-black text-[#F97316] font-mono tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <div className="text-[10px] text-white/40 mt-1 font-bold">{label}</div>
        </div>
      ))}
    </div>
  )
}

function getTimeLeft(target) {
  const total  = new Date(target) - new Date()
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days    = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  return { total, days, hours, minutes, seconds }
}
