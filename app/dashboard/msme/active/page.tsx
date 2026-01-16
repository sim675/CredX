"use client"

import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, ExternalLink, FileText, Activity, CheckCircle, Clock } from "lucide-react"
import { fetchInvoicesByMSME, Invoice, getStatusLabel, calculateDaysRemaining } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"
// 1. Import the Rye font
import { Rye } from 'next/font/google'

// 2. Configure the font
const rye = Rye({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})
// --- CIRCULAR PROGRESS COMPONENT ---
const CircleProgress = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 30; 
  const stroke = 5; 
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
        <circle stroke={color} strokeWidth={stroke} strokeDasharray={circumference + " " + circumference} style={{ strokeDashoffset, transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} strokeLinecap="round" fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
      </svg>
      <span className="absolute text-xs font-bold text-white/90">{percentage}%</span>
    </div>
  );
};

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function MSMEActiveInvoicesPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const msmeInvoices = await fetchInvoicesByMSME(address, publicClient || undefined)
        // Filter for active invoices: Fundraising (2) or Funded (3)
        const activeInvoices = msmeInvoices.filter(
          (inv) => inv.status === 2 || inv.status === 3
        )
        setInvoices(activeInvoices)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [address, isConnected, publicClient, toast])

  // --- STATS CALCULATIONS ---
  const totalActiveValue = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  )
  const totalFundedAmount = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.fundedAmount),
    0
  )
  
  // Calculate average days to settlement (for funded invoices only)
  const fundedInvoices = invoices.filter((inv) => inv.status === 3)
  const avgDaysToSettlement =
    fundedInvoices.length > 0
      ? Math.round(
          fundedInvoices.reduce((sum, inv) => {
            const daysRemaining = calculateDaysRemaining(inv.dueDate)
            return sum + Math.max(0, daysRemaining)
          }, 0) / fundedInvoices.length
        )
      : 0

  // --- PERCENTAGE CALCULATIONS FOR RINGS ---
  const fundingProgress = totalActiveValue > 0 ? Math.round((totalFundedAmount / totalActiveValue) * 100) : 0;
  const activeProgress = 100; 
  const daysProgress = Math.min(100, Math.round((avgDaysToSettlement / 60) * 100));


  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative z-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transform scale-50 -z-10" />
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
            <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white">Connect your wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view and manage your active invoices.
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
          <Link href="/connect">Connect Wallet</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 relative z-10">
         <div className="absolute top-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="flex flex-col space-y-2">
           <Skeleton className="h-10 w-64 bg-white/5" />
           <Skeleton className="h-5 w-96 bg-white/5" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-8 relative z-10 pb-20">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div>
        <h2 className={cn(
          "text-4xl font-bold tracking-tight text-white drop-shadow-sm uppercase",
          rye.className
        )}>
          Active Invoices
        </h2>
        <p className="text-muted-foreground mt-1">
          Track invoices that are currently fundraising or awaiting settlement.
        </p>
      </div>

      {/* --- STATS CARDS WITH GLASSMORPHISM & RINGS --- */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* Card 1: Total Active Value */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-200/70 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3 text-blue-400" />
              Total Active Value
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {totalActiveValue.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">MATIC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
              </p>
            </div>
            <div className="transform scale-110 group-hover:scale-125 transition-transform duration-500">
               <CircleProgress percentage={activeProgress} color="#3b82f6" /> {/* Blue */}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Funded Amount */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-pink-200/70 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-pink-400" />
              Total Funded
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {totalFundedAmount.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">MATIC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Liquidity received upfront
              </p>
            </div>
            <div className="transform scale-110 group-hover:scale-125 transition-transform duration-500">
               <CircleProgress percentage={fundingProgress} color="#ec4899" /> {/* Pink */}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Avg Days to Settlement */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3 text-emerald-400" />
              Est. Settlement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {avgDaysToSettlement > 0 ? avgDaysToSettlement : "-"} <span className="text-sm font-normal text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average time remaining
              </p>
            </div>
            <div className="transform scale-110 group-hover:scale-125 transition-transform duration-500">
               <CircleProgress percentage={daysProgress} color="#10b981" /> {/* Emerald */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- TABLE CARD WITH GLASSMORPHISM --- */}
      <Card className="backdrop-blur-xl bg-card/40 border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        
        <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-xl font-semibold text-white/90">Active Invoice Tracker</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Real-time status of your invoices on the blockchain.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex border-white/10 hover:bg-white/5 text-xs h-8" asChild>
                <Link href="/dashboard/msme/tokenize">
                    Create New
                </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="p-4 rounded-full bg-white/5 border border-white/10">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-white/80">No active invoices</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You don't have any invoices that are currently fundraising or funded. Start by tokenizing an invoice.
              </p>
              <Button variant="secondary" className="mt-4" asChild>
                  <Link href="/dashboard/msme/tokenize">Tokenize Invoice</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Invoice ID</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Buyer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Value</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Funded</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Due Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-center">Remaining</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-center">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const daysRemaining = calculateDaysRemaining(invoice.dueDate)
                  const statusLabel = getStatusLabel(invoice.status)
                  const isLate = daysRemaining < 0 && invoice.status === 2

                  return (
                    <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white/90">
                        #{invoice.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatAddress(invoice.buyer)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-white/90">
                        {parseFloat(invoice.amount).toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">MATIC</span>
                      </TableCell>
                      <TableCell className="text-right text-white/80">
                        {parseFloat(invoice.fundedAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {invoice.dueDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isLate 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : daysRemaining <= 5 
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {daysRemaining} days
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <Badge
                            variant="outline"
                            className={
                                statusLabel === "Fundraising"
                                ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                                : isLate
                                ? "border-red-500/50 text-red-400 bg-red-500/10"
                                : "border-green-500/50 text-green-400 bg-green-500/10"
                            }
                            >
                            {isLate ? "Late" : statusLabel}
                            </Badge>
                            
                            {/* Restored Functionality: Public/Private Badges */}
                            <div className="flex items-center gap-1">
                                {invoice.isPublic && (
                                    <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Public</span>
                                )}
                                {invoice.isPrivate && (
                                    <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Private</span>
                                )}
                            </div>
                            
                            {/* Restored Functionality: Exclusive Investor Info */}
                            {invoice.isPrivate && invoice.exclusiveInvestor && (
                                <span className="text-[9px] text-muted-foreground/60">
                                    Inv: {formatAddress(invoice.exclusiveInvestor)}
                                </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white rounded-full"
                          title="View Details"
                        >
                          <Link href={`/dashboard/msme/active/${invoice.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}