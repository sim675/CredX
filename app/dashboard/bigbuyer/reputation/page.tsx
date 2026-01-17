"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, TrendingUp, Clock, CheckCircle2, Wallet, FileText } from "lucide-react"
import { fetchInvoicesByBuyer, Invoice, getStatusLabel, calculateDaysRemaining } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { Press_Start_2P } from "next/font/google"

const minecraft = Press_Start_2P({ 
  weight: "400", 
  subsets: ["latin"] 
})

export default function BigBuyerReputationPage() {
  const { address, isConnected } = useAccount()
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
        const buyerInvoices = await fetchInvoicesByBuyer(address)
        setInvoices(buyerInvoices)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load reputation data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [address, isConnected, toast])

  // Calculate reputation metrics from blockchain data
  const totalInvoices = invoices.length
  const repaidInvoices = invoices.filter((inv) => inv.status === 3)
  const defaultedInvoices = invoices.filter((inv) => inv.status === 4)
  const onTimeRate = totalInvoices > 0 ? Math.round((repaidInvoices.length / totalInvoices) * 100) : 0
  
  // Calculate unique MSMEs
  const uniqueMSMEs = new Set(invoices.map((inv) => inv.msme.toLowerCase())).size

  // Calculate reputation score (0-1000, simple formula)
  const reputationScore = totalInvoices > 0
    ? Math.round((repaidInvoices.length / totalInvoices) * 1000)
    : 0

  // Grade mapping
  const getGrade = (score: number) => {
    if (score >= 950) return "A+"
    if (score >= 900) return "A"
    if (score >= 850) return "B+"
    if (score >= 800) return "B"
    if (score >= 750) return "C+"
    if (score >= 700) return "C"
    return "D"
  }

  const grade = getGrade(reputationScore)

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view your reputation metrics.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 bg-[#080808] min-h-screen p-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2 bg-white/5" />
          <Skeleton className="h-5 w-96 bg-white/5" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-white/10 bg-white/[0.02]">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2 bg-white/5" />
                <Skeleton className="h-4 w-64 bg-white/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    // 1. Reverted to #080808 so the background isn't pure black
    <div className="min-h-screen bg-transparent relative text-white selection:bg-orange-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Background image with low opacity */}
        <div className="absolute inset-0 w-full h-full">
          <img src="/bitcoin.jpeg" alt="bitcoin background" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-yellow-600/15 blur-[100px] rounded-full" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-orange-400/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 p-6 space-y-8 pb-20 overflow-visible">
        <div>
          <h1 className={`${minecraft.className} text-2xl md:text-3xl text-white uppercase leading-normal pt-2`}>
            Reputation
          </h1>
          <p className="text-neutral-500 font-medium mt-2">Your on-chain payment reliability and trust score</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 2. Glass Cards: Changed to bg-white/[0.03] for clear glass look (not black) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Award className="size-6 text-orange-500" />
              </div>
            </div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Buyer Reliability Score</p>
            <div className="text-3xl font-bold tracking-tighter text-white mt-2">{grade}</div>
            <div className="text-right">
              <p className="text-sm text-orange-200">Numeric Score</p>
              <p className="text-3xl font-extrabold text-white">{reputationScore}</p>
              <p className="text-xs text-muted-foreground">out of 1000</p>
            </div>
            <Progress value={(reputationScore / 1000) * 100} className="h-3 mt-4 bg-white/10" />
            <p className="text-sm text-orange-300 mt-2">
              {totalInvoices === 0
                ? "No invoices yet"
                : `Based on ${totalInvoices} ${totalInvoices === 1 ? "invoice" : "invoices"}`}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <TrendingUp className="size-6 text-orange-500" />
              </div>
            </div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payment Summary</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-orange-200">Total Invoices</span>
              <span className="text-sm font-semibold text-white">{totalInvoices}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-orange-200">Repaid</span>
              <span className="text-sm font-semibold text-green-400">{repaidInvoices.length}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-orange-200">Defaulted</span>
              <span className="text-sm font-semibold text-red-400">{defaultedInvoices.length}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-orange-200">Success Rate</span>
              <span className="text-sm font-semibold text-white">{onTimeRate}%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Payment Success Rate</CardTitle>
              <CheckCircle2 className="size-4 text-[#FFD600]" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{onTimeRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {repaidInvoices.length} of {totalInvoices} {totalInvoices === 1 ? "invoice" : "invoices"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Total Invoices</CardTitle>
              <FileText className="size-4 text-[#FFD600]" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-2">All-time received</p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Repaid</CardTitle>
              <TrendingUp className="size-4 text-[#FFD600]" />
            </div>
            <div className="text-2xl font-extrabold text-green-400 mt-2">{repaidInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Successfully paid</p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">MSMEs Served</CardTitle>
              <Award className="size-4 text-[#FFD600]" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{uniqueMSMEs}</div>
            <p className="text-xs text-muted-foreground mt-2">Unique businesses</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] p-8 mt-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]" />
              <h3 className="text-xl font-bold tracking-tight text-white">Reputation Metrics</h3>
            </div>
          </div>

          <div>
            <p className="text-orange-400 font-bold mb-2">Score Factors</p>
            <p className="text-neutral-500">
              Your reputation is calculated based on payment success rate, total invoices, and punctuality.
            </p>
          </div>

          <div className="mt-6">
            {totalInvoices === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 opacity-70">
                <FileText className="h-10 w-10 text-orange-500" />
                <p className="text-sm text-orange-200 text-center">
                  No invoices yet. Your reputation will be calculated once you receive invoices.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-200">Payment Success Rate</span>
                    <span className="text-sm font-semibold text-white">{onTimeRate}%</span>
                  </div>
                  <Progress value={onTimeRate} className="h-3 bg-white/10" />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-200">Total Invoices</span>
                    <span className="text-sm font-semibold text-white">{totalInvoices}</span>
                  </div>
                  <Progress value={Math.min((totalInvoices / 100) * 100, 100)} className="h-3 bg-white/10" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-200">Reputation Score</span>
                    <span className="text-sm font-semibold text-white">{reputationScore}/1000</span>
                  </div>
                  <Progress value={(reputationScore / 1000) * 100} className="h-3 bg-white/10" />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}