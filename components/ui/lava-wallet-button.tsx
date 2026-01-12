"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LavaWalletButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function LavaWalletButton({ 
  children, 
  className, 
  variant = "default", 
  size = "default" 
}: LavaWalletButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          "relative overflow-hidden",
          variant === "default" && "bg-black/40 backdrop-blur-md border border-orange-500/20 hover:border-orange-500/40",
          variant === "outline" && "border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/10",
          variant === "ghost" && "hover:bg-orange-500/10",
          variant === "destructive" && "bg-red-500/20 border-red-500/30 hover:bg-red-500/30",
          className
        )}
      >
        {/* Lava border animation */}
        <div className="absolute inset-0 rounded-inherit">
          <div className="absolute inset-0 rounded-inherit border-2 border-transparent animate-pulse bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" 
               style={{
                 borderImage: 'linear-gradient(90deg, #FF8A00, #FFD600, #FF8A00, #FF4D00, #FF8A00)',
                 borderImageSlice: '1',
                 animation: 'lava-border 3s linear infinite',
               }} />
        </div>
        
        {/* Content */}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  )
}
