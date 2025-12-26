"use client"
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
import { Button } from "@/components/ui/button"

// <CHANGE> Replaced admin navigation with bigbuyer navigation
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
  const navItems = ROLE_NAV[role] || []

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 border-b border-border/50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary size-8 rounded flex items-center justify-center text-primary-foreground">IC</div>
          <span className="group-data-[collapsible=icon]:hidden">InvoChain</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <a href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{role === "bigbuyer" ? "Big Buyer" : role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="group-data-[collapsible=icon]:hidden">
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
