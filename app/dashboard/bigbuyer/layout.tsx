"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import WalletDropdown from "@/components/WalletDropdown";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function BigBuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "bigbuyer")) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role="bigbuyer" />

        <main className="flex-1 bg-background">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side */}
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Big Buyer Dashboard</h1>
              </div>

              {/* Right side — Wallet */}
              <WalletDropdown />
            </div>
          </div>

          {/* Page content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
