"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, TrendingUp, Wallet, LogOut, Search, PlusCircle, History, UserCheck, Clock, Receipt, CreditCard } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export function AppSidebar({ role }: { role: UserRole }) {
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const navItems = ROLE_NAV[role] || []
  
  // Track which item is being hovered
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <Sidebar variant="inset" collapsible="icon" className="w-64 bg-[#0a0a0a] border-r border-white/5">
      <SidebarHeader className="h-16 border-b border-white/5 px-6 flex items-center">
        <div className="font-bold text-2xl tracking-tighter">
          <span className="font-pirate text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-data-[collapsible=icon]:hidden">CredX</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-4" onMouseLeave={() => setHoveredItem(null)}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] px-4 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredItem === item.label;
                
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <a 
                        href={item.href}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        className={`relative flex items-center h-11 w-full rounded-lg transition-colors duration-300 px-4 ${
                          isActive || isHovered ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {/* 1. THE SLIDING GLOW PILL (Follows Mouse OR Active) */}
                        {(isActive || isHovered) && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-orange-500/10 to-orange-500/20"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                          />
                        )}

                        {/* 2. ICON & LABEL */}
                        <div className="relative z-10 flex items-center gap-3">
                          <item.icon className={`size-[18px] transition-colors ${
                            isActive || isHovered ? "text-orange-500" : "text-zinc-500"
                          }`} />
                          <span className="text-[14px] font-medium">{item.label}</span>
                        </div>

                        {/* 3. THE "ORANGE LIGHT" (Follows Mouse OR Active) */}
                        {(isActive || isHovered) && (
                          <motion.div
                            layoutId="active-light"
                            className="absolute right-0 w-[3px] h-6 bg-orange-500 rounded-l-full shadow-[0_0_15px_rgba(249,115,22,1)]"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                          />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 group-data-[collapsible=icon]:p-2">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-9 ring-1 ring-white/10 group-data-[collapsible=icon]:size-7 group-data-[collapsible=icon]:mx-auto" >
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-orange-500 font-medium uppercase tracking-wider">{role}</p>
          </div>
          <button onClick={logout} className="p-2 text-zinc-500 hover:text-orange-400 transition-all group-data-[collapsible=icon]:p-1">
            <LogOut className="size-4 group-data-[collapsible=icon]:size-3" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}