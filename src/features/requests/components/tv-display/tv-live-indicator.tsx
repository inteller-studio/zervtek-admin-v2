'use client'

import { motion } from 'framer-motion'

export function TVLiveIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-2">
      <span className="relative flex h-3 w-3">
        {/* Ping animation */}
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-500"
          animate={{
            scale: [1, 2],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
        {/* Static dot */}
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
      </span>
      <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Live
      </span>
    </div>
  )
}
