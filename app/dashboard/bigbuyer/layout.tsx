"use client"

import type React from "react"

import { AppSidebar } from "@/components/dashboard/sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BigBuyerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "bigbuyer")) {
      router.push("/auth/signin")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="bigbuyer" />
        <main className="flex-1 bg-background">
          <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 h-16">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Big Buyer Dashboard</h1>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
