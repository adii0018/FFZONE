import React from 'react'

const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  delay: `${Math.random() * 5}s`,
  dur: `${2 + Math.random() * 3}s`,
}))

export default function StarField() {
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
