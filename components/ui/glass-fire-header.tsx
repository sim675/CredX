"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassFireHeaderProps {
  children: React.ReactNode
  className?: string
}

export function GlassFireHeader({ children, className }: GlassFireHeaderProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border-b border-orange-500/20 bg-black/40 backdrop-blur-md",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Radial gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-8 py-6">
        {children}
      </div>
    </motion.div>
  )
}
