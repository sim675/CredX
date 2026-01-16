// app/dashboard/msme/page.tsx
"use client";

import ReputationSection from "@/components/msme/ReputationSection";
import { DashboardChatSection } from "@/components/chat/DashboardChatSection";
import { useEffect, useState, useRef } from "react";
import { useAccount, usePublicClient, useBalance } from "wagmi";
import { PlusCircle, ArrowUpRight, Wallet, Copy, MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchInvoicesByMSME, Invoice, getStatusLabel } from "@/lib/invoice";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth"; 
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
// 1. IMPORT THE FONT HERE
import { Rye } from 'next/font/google';

// 2. CONFIGURE THE FONT
const rye = Rye({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

// --- CIRCULAR PROGRESS COMPONENT ---
const CircleProgress = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 38; 
  const stroke = 7; 
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <circle stroke={color} strokeWidth={stroke} strokeDasharray={circumference + " " + circumference} style={{ strokeDashoffset, transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
      </svg>
      <span className="absolute text-sm font-bold text-white/90">{percentage}%</span>
    </div>
  );
};

// --- WALLET CARD COMPONENT ---
const WalletCreditCard = ({ address, balance }: { address: string | undefined, balance: string | undefined }) => {
  const formatAddr = (addr: string) => `${addr.slice(0, 4)}  ${addr.slice(4, 8)}  ${addr.slice(8, 12)}  ${addr.slice(-4)}`;
  
  return (
    <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4361ee] via-[#3a0ca3] to-[#7209b7] z-0" />
      <div className="absolute top-[-50%] left-[-20%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] z-0" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0" />

      <div className="relative z-10 flex flex-col justify-between h-full text-white">
        <div className="flex justify-between items-start">
          <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center border border-yellow-600/50 shadow-sm opacity-90">
             <div className="w-full h-[1px] bg-yellow-700/40 absolute top-1/2" />
             <div className="h-full w-[1px] bg-yellow-700/40 absolute left-1/3" />
             <div className="h-full w-[1px] bg-yellow-700/40 absolute right-1/3" />
             <div className="w-6 h-4 border border-yellow-700/40 rounded-sm" />
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>

        <div className="mt-4">
          <p className="text-xs text-blue-100/80 font-medium tracking-wider mb-1">CURRENT BALANCE</p>
          <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            {balance ? parseFloat(balance).toFixed(4) : "0.0000"} <span className="text-lg font-normal opacity-80">POL</span>
          </h2>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="space-y-1">
            <p className="font-mono text-sm tracking-widest text-blue-50/90 shadow-black drop-shadow-sm">
              {address ? formatAddr(address) : "0000 0000 0000 0000"}
            </p>
            <p className="text-[10px] text-blue-100/70 uppercase font-semibold">Wallet Holder</p>
          </div>
          <div className="flex relative">
            <div className="w-8 h-8 rounded-full bg-white/80 mix-blend-overlay" />
            <div className="w-8 h-8 rounded-full bg-white/80 mix-blend-overlay -ml-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MSMEDashboard() {
  const { address, isConnected } = useAccount();
  const { user } = useAuth();
  const publicClient = usePublicClient();
  const { data: balanceData } = useBalance({ address });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");
  
  // --- CHAT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false); // Optional: for full screen mode
  
  const { toast } = useToast();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
    else setGreeting("Good Night");
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const msmeInvoices = await fetchInvoicesByMSME(address, publicClient || undefined);
        setInvoices(msmeInvoices);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoices();
  }, [address, isConnected, publicClient, toast]);

  // Stats Logic
  const totalValue = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  // In new enum: 2 = Fundraising, 3 = Funded
  const fundedValue = invoices.filter((inv) => inv.status === 3).reduce((sum, inv) => sum + parseFloat(inv.fundedAmount), 0);
  const fundingRate = totalValue > 0 ? Math.round((fundedValue / totalValue) * 100) : 0;
  const activeCount = invoices.filter((inv) => inv.status === 2).length;
  const activeRate = invoices.length > 0 ? Math.round((activeCount / invoices.length) * 100) : 0;

  const stats = [
    { label: "Total Invoices", value: invoices.length.toString(), subtext: "Lifetime", percentage: 100, color: "#3b82f6" },
    { label: "Total Value", value: `${totalValue.toFixed(0)}`, unit: "MATIC", subtext: "Last 30 days", percentage: 75, color: "#f472b6" },
    { label: "Fundraising", value: activeCount.toString(), subtext: "Active now", percentage: activeRate, color: "#a855f7" },
    { label: "Funded Value", value: `${fundedValue.toFixed(0)}`, unit: "MATIC", subtext: "Successful", percentage: fundingRate, color: "#06b6d4" },
  ];

  const getStatusBadge = (status: number) => {
    const statusLabel = getStatusLabel(status);
    const statusMap: Record<string, { variant: "outline" | "default" | "secondary" | "destructive"; className: string }> = {
      Fundraising: { variant: "outline", className: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
      Funded: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
      Repaid: { variant: "secondary", className: "" },
      Defaulted: { variant: "destructive", className: "" },
    };

    const mapping = statusMap[statusLabel] || { variant: "outline" as const, className: "" };
    return <Badge variant={mapping.variant} className={mapping.className}>{statusLabel}</Badge>;
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative z-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transform scale-50 -z-10" />
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Connect your wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">Connect your wallet to view your MSME dashboard and manage invoices.</p>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
          <Link href="/connect">Connect Wallet</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
   <div className="space-y-8 relative z-10 min-h-screen pb-20">
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span 
            className={cn(
              "text-3xl font-medium text-orange-200/90 block mb-2 uppercase tracking-wider", 
              rye.className
            )}
          >
            {greeting}.
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">{user?.name || "User"}</h1>
        </div>
        <Button className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/20 transition-all duration-300" asChild>
          <Link href="/dashboard/msme/tokenize"><PlusCircle className="mr-2 h-4 w-4" />Create Invoice</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-xl">
            <CardContent className="px-6 py-8 flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
                  {stat.unit && <span className="text-xs text-muted-foreground font-medium">{stat.unit}</span>}
                </div>
                <span className="text-[11px] text-muted-foreground/60 pt-1">{stat.subtext}</span>
              </div>
              <div className="transform transition-transform hover:scale-105"><CircleProgress percentage={stat.percentage} color={stat.color} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid: Invoices & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full backdrop-blur-xl bg-card/40 border-white/5 shadow-2xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div>
                <CardTitle className="text-xl font-semibold text-white/90">Recent Invoices</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage and track your tokenized invoice status</p>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:flex border-white/10 hover:bg-white/5" asChild>
                <Link href="/dashboard/msme/invoices">View All <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 h-full">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10"><Wallet className="h-8 w-8 text-muted-foreground" /></div>
                  <h3 className="text-lg font-medium">No invoices yet</h3>
                  <Button variant="secondary" asChild><Link href="/dashboard/msme/tokenize">Create Invoice</Link></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="group flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-white/90">Invoice #{invoice.id}</h3>
                          {getStatusBadge(invoice.status)}
                          {invoice.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                          {invoice.isPrivate && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>To: <span className="text-white/70">{formatAddress(invoice.buyer)}</span></span>
                          <span>Due: {invoice.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{invoice.amount} MATIC</p>
                        <p className="text-xs text-muted-foreground">Funded: <span className="text-white/70">{invoice.fundedAmount} MATIC</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="h-[240px]">
            <WalletCreditCard address={address} balance={balanceData ? formatEther(balanceData.value) : undefined} />
          </div>
           <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
             <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-white" onClick={() => {navigator.clipboard.writeText(address || ""); toast({title: "Copied", description: "Address copied to clipboard"})}}>
                  <Copy className="h-3 w-3" />
                </Button>
             </div>
             <code className="text-xs text-white/70 bg-black/20 px-2 py-1 rounded block truncate">{address}</code>
           </div>
        </div>
      </div>

      <div className="pt-6"><ReputationSection walletAddress={address} /></div>

      {/* ========================================
        FLOATING CHAT WIDGET
        ========================================
      */}
      {address && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          
          {/* Floating Window */}
          <div 
            className={cn(
              "w-[450px] transition-all duration-300 ease-in-out origin-bottom-right rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#121212]/95 backdrop-blur-xl",
              isChatOpen 
                ? "scale-100 opacity-100 translate-y-0" 
                : "scale-0 opacity-0 translate-y-10 pointer-events-none h-0"
            )}
            style={{ 
              height: isChatExpanded ? "80vh" : "600px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" 
            }}
          >
            {/* Header / Draggable Area */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
              <span className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" /> CredX Support & Chat
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-white"
                  onClick={() => setIsChatExpanded(!isChatExpanded)}
                >
                  {isChatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-red-500/20 hover:text-red-400"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content Wrapper */}
            <div className="h-[calc(100%-48px)] overflow-hidden">
              <DashboardChatSection walletAddress={address} role="msme" />
            </div>
          </div>

          {/* Toggle Button (FAB) */}
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "h-14 w-14 rounded-full shadow-[0_0_20px_rgba(255,122,24,0.3)] transition-all duration-300 hover:scale-110",
              "bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white",
              isChatOpen && "rotate-90 scale-90 opacity-0 absolute" // Hide/Transform when open if desired, or keep generic
            )}
            style={{ display: isChatOpen ? 'none' : 'flex' }} // Option: Hide button when chat is open to reduce clutter, or keep it to toggle close
          >
            <MessageCircle className="h-7 w-7" />
          </Button>

           {/* Close/Minimize Button (Shows when open) */}
           {isChatOpen && (
              <Button
                onClick={() => setIsChatOpen(false)}
                className="h-14 w-14 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 shadow-lg animate-in fade-in zoom-in"
              >
                <X className="h-6 w-6" />
              </Button>
           )}
        </div>
      )}

    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/40 border-white/5 h-32"><CardContent className="h-full flex items-center justify-center"><Skeleton className="h-16 w-16 rounded-full" /></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card className="bg-card/40 border-white/5 h-[400px]"><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
        <div className="lg:col-span-1">
           <Skeleton className="h-[240px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
