"use client"

import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, CheckCircle2, AlertTriangle, Wallet, FileText, TrendingUp, XCircle } from "lucide-react"
import { fetchInvoicesByMSME, Invoice } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// 1. Import Rye Font
import { Rye } from 'next/font/google'

// 2. Configure Rye Font
const rye = Rye({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

// --- BIG REPUTATION CIRCLE COMPONENT ---
const ReputationCircle = ({ score }: { score: number }) => {
  const radius = 70; 
  const stroke = 10; 
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine Color and Label based on Score
  let color = "#ef4444"; // Red (Poor)
  let label = "Poor";
  let subLabel = "Needs Improvement";

  if (score >= 90) {
    color = "#10b981"; // Emerald (Excellent)
    label = "Excellent";
    subLabel = "Top Tier Borrower";
  } else if (score >= 75) {
    color = "#3b82f6"; // Blue (Good)
    label = "Good";
    subLabel = "Reliable Borrower";
  } else if (score >= 50) {
    color = "#f59e0b"; // Amber (Fair)
    label = "Fair";
    subLabel = "Moderate Risk";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
       <div className="relative flex items-center justify-center">
        {/* Glow Effect behind the circle */}
        <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: color }} />
        
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            />
            <circle
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-out" }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-white drop-shadow-md">{score}</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-70" style={{ color }}>Score</span>
        </div>
      </div>
      <div className="mt-4 text-center space-y-1">
          <h3 className="text-xl font-bold text-white" style={{ color }}>{label}</h3>
          <p className="text-xs text-muted-foreground">{subLabel}</p>
      </div>
    </div>
  );
};

export default function MSMEReputationPage() {
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
        setInvoices(msmeInvoices)
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

  // --- REPUTATION METRICS CALCULATION ---
  const totalInvoices = invoices.length
  const repaidInvoices = invoices.filter((inv) => inv.status === 3)
  const defaultedInvoices = invoices.filter((inv) => inv.status === 4)
  const settledInvoices = repaidInvoices.length + defaultedInvoices.length
  
  // Settlement success ratio (default to 0 if no history)
  const settlementSuccessRatio =
    settledInvoices > 0
      ? Math.round((repaidInvoices.length / settledInvoices) * 100)
      : 0 
  
  const defaultCount = defaultedInvoices.length

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative z-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transform scale-50 -z-10" />
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white">Connect your wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view your blockchain reputation scorecard.
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
         <div className="absolute top-0 right-0 -z-10 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full" />
        <div>
          <Skeleton className="h-9 w-64 mb-2 bg-white/5" />
          <Skeleton className="h-5 w-96 bg-white/5" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[300px] rounded-xl bg-white/5 md:col-span-2" />
          <Skeleton className="h-[300px] rounded-xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative z-10 pb-20">
       
       {/* Ambient Backgrounds */}
      <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div>
        {/* 3. Applied Rye Font Class Here */}
        <h2 className={`text-3xl font-bold tracking-tight text-white drop-shadow-sm uppercase ${rye.className}`}>
          Reputation Scorecard
        </h2>
        <p className="text-muted-foreground mt-1">
          Your creditworthiness derived directly from your blockchain repayment history.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: METRICS GRID (Takes 2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 4 Small Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Invoices */}
              <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Created</CardTitle>
                  <FileText className="size-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-white">{totalInvoices}</div>
                  <p className="text-xs text-muted-foreground">Lifetime volume</p>
              </CardContent>
              </Card>

              {/* Repaid */}
              <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Successfully Repaid</CardTitle>
                  <CheckCircle2 className="size-4 text-green-400" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-white">{repaidInvoices.length}</div>
                  <p className="text-xs text-muted-foreground">Settled on time</p>
              </CardContent>
              </Card>

              {/* Defaults */}
              <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Defaults</CardTitle>
                  <AlertTriangle className="size-4 text-red-400" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-white">{defaultCount}</div>
                  <p className="text-xs text-muted-foreground">Missed payments</p>
              </CardContent>
              </Card>

              {/* Ratio */}
              <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Success Rate</CardTitle>
                  <Award className="size-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                  <div className={`text-2xl font-bold ${settlementSuccessRatio >= 90 ? "text-green-400" : settlementSuccessRatio >= 70 ? "text-blue-400" : "text-red-400"}`}>
                      {settlementSuccessRatio}%
                  </div>
                  <p className="text-xs text-muted-foreground">Repayment efficiency</p>
              </CardContent>
              </Card>
          </div>

          {/* Detailed Summary List */}
          <Card className="backdrop-blur-xl bg-card/40 border-white/5 shadow-2xl">
              <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                  <CardTitle className="text-lg font-semibold text-white/90">Reputation Insights</CardTitle>
                  <CardDescription>Breakdown of factors affecting your score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-500/20 text-blue-400"><TrendingUp className="size-4"/></div>
                          <div>
                              <p className="text-sm font-medium text-white">Payment History</p>
                              <p className="text-xs text-muted-foreground">Weight: High Impact</p>
                          </div>
                      </div>
                      <span className="text-sm font-mono text-white/80">{repaidInvoices.length} Paid / {Math.max(settledInvoices, 1)} Total</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-500/20 text-red-400"><XCircle className="size-4"/></div>
                          <div>
                              <p className="text-sm font-medium text-white">Negative Marks</p>
                              <p className="text-xs text-muted-foreground">Weight: Very High Impact</p>
                          </div>
                      </div>
                       <span className="text-sm font-mono text-white/80">{defaultCount} Events</span>
                  </div>
              </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: BIG REPUTATION CIRCLE (Takes 1/3 width) */}
        <div className="md:col-span-1 h-full">
          <Card className="h-full backdrop-blur-xl border-white/5 bg-[#0a0a0a]/90 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
              
              {/* Background Grid Pattern specifically for this card */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] -z-10" />

              <CardHeader className="pb-0 text-center z-10">
                  <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Current Standing</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center z-10 w-full">
                  {/* The Circle is now always visible */}
                  <ReputationCircle score={settlementSuccessRatio} />
              </CardContent>
              <div className="pb-8 px-6 text-center z-10">
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                      This score is immutable and recorded on the Polygon blockchain. High scores unlock lower interest rates.
                  </p>
              </div>
          </Card>
        </div>

      </div>
    </div>
  )
}