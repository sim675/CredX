"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Wallet, 
  LogOut, 
  Search, 
  PlusCircle, 
  History, 
  UserCheck, 
  Clock, 
  Receipt, 
  CreditCard 
} from "lucide-react"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ROLE_NAV = {
  msme: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/msme" },
    { label: "Create Invoice", icon: PlusCircle, href: "/dashboard/msme/tokenize" },
    { label: "Active Invoices", icon: FileText, href: "/dashboard/msme/active" },
    { label: "Settled History", icon: History, href: "/dashboard/msme/history" },
    { label: "Reputation", icon: UserCheck, href: "/dashboard/msme/reputation" },
    { label: "Wallet", icon: Wallet, href: "/dashboard/msme/wallet" },
  ],
  investor: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/investor" },
    { label: "Invoice Marketplace", icon: Search, href: "/dashboard/investor/marketplace" },
    { label: "My Portfolio", icon: TrendingUp, href: "/dashboard/investor/portfolio" },
    { label: "Returns", icon: History, href: "/dashboard/investor/returns" },
    { label: "Wallet", icon: Wallet, href: "/dashboard/investor/wallet" },
  ],
  bigbuyer: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/bigbuyer" },
    { label: "Outstanding Invoices", icon: Clock, href: "/dashboard/bigbuyer/outstanding" },
    { label: "Payment History", icon: Receipt, href: "/dashboard/bigbuyer/history" },
    { label: "Reputation", icon: UserCheck, href: "/dashboard/bigbuyer/reputation" },
    { label: "Wallet & Payments", icon: CreditCard, href: "/dashboard/bigbuyer/wallet" },
  ],
}

interface SidebarItemProps {
  item: typeof ROLE_NAV[keyof typeof ROLE_NAV][number]
  isActive?: boolean
}

function SidebarItem({ item, isActive }: SidebarItemProps) {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {isActive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500/50 to-transparent"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.3 }}
        />
      )}
      <Link href={item.href} className="block">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
          isActive 
            ? "bg-orange-500/20 text-orange-200 shadow-[0_0_15px_rgba(255,77,0,0.3)]" 
            : "text-orange-200 hover:bg-orange-500/10 hover:text-white"
        )}>
          <item.icon className="size-4" />
          <span className="font-medium">{item.label}</span>
        </div>
      </Link>
    </motion.div>
  )
}

export function MagmaSidebar({ role }: { role: UserRole }) {
  const { logout, user } = useAuth()
  const navItems = ROLE_NAV[role] || []

  return (
    <div className="w-64 h-screen bg-[#050505] border-r border-orange-500/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IC</span>
          </div>
          <h1 className="text-2xl font-bold text-orange-200">CredX</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-orange-300 uppercase tracking-wider mb-3">Menu</h2>
        </div>
        {navItems.map((item) => (
          <SidebarItem 
            key={item.label} 
            item={item}
            isActive={false} // You can add active state logic here
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-orange-500/20 mt-auto">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-orange-200 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-orange-300 capitalize">{role === "bigbuyer" ? "Big Buyer" : role}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-orange-200 hover:text-white hover:bg-orange-500/20"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
