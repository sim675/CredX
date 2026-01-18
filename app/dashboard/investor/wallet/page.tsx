"use client"

import { useEffect, useState } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatEther } from "viem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, ExternalLink, Copy, Check, ShieldCheck, TrendingUp, Globe } from "lucide-react"
import { fetchAllInvoices, fetchInvestmentAmount, Invoice } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

// 1. IMPORT MINECRAFT FONT
import { Press_Start_2P } from 'next/font/google'

const minecraft = Press_Start_2P({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

// --- 3D BACKGROUND COMPONENT ---
const BackgroundOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a0a0a]">
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ x: [0, -70, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" 
      />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  )
}

function formatFullAddress(addr: string) {
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`
}

export default function InvestorWalletPage() {
  const { address, isConnected } = useAccount()
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({ address })
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [investments, setInvestments] = useState<Record<number, string>>({})
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !address) {
        setIsLoadingInvoices(false)
        return
      }

      try {
        setIsLoadingInvoices(true)
        const invoices = await fetchAllInvoices()
        setAllInvoices(invoices)

        const investmentMap: Record<number, string> = {}
        for (const inv of invoices) {
          const amount = await fetchInvestmentAmount(inv.id, address)
          if (parseFloat(amount) > 0) {
            investmentMap[inv.id] = amount
          }
        }
        setInvestments(investmentMap)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load wallet data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingInvoices(false)
      }
    }
    loadData()
  }, [address, isConnected, toast])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({ title: "Copied", description: "Wallet address copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const portfolioInvoices = allInvoices.filter((inv) => investments[inv.id])
  const totalDeployed = Object.values(investments).reduce(
    (sum, amount) => sum + parseFloat(amount),
    0
  )

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative overflow-hidden">
        <BackgroundOrbs />
        <div className="p-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
           <Wallet className="h-16 w-16 text-white/50" />
        </div>
        <h3 className={`text-xl text-white ${minecraft.className}`}>Connect Wallet</h3>
        <p className="text-sm text-white/40 text-center max-w-md">
          Connect your wallet to view your wallet balance and investment data.
        </p>
      </div>
    )
  }

  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`

  return (
    <div className="space-y-8 relative min-h-screen pb-20">
      <BackgroundOrbs />

      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className={`text-3xl font-bold tracking-tight text-white ${minecraft.className} leading-relaxed`}>
          My Wallet
        </h2>
        <p className="text-white/60">Manage your capital and track transactions.</p>
      </div>

      {/* MAIN CONTENT GRID (Balance & Address) */}
      <div className="grid gap-6 md:grid-cols-2">
            
            {/* Balance Card */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0F0F0F]/80 backdrop-blur-xl shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white/60 text-sm font-medium flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-400" /> Total Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        {isLoadingBalance ? (
                            <Skeleton className="h-16 w-1/2 bg-white/10" />
                        ) : (
                            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 tracking-tight">
                                {balanceData ? parseFloat(formatEther(BigInt(balanceData.value))).toFixed(4) : "0.0000"} 
                                <span className="text-lg text-white/40 font-medium ml-2">ETH</span>
                            </h1>
                        )}
                        <p className="text-sm text-white/40 font-mono mt-2 flex items-center gap-2">
                            Sepolia Testnet
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="border-white/10 bg-[#0F0F0F]/60 backdrop-blur-xl h-full flex flex-col justify-center">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <ShieldCheck className="w-6 h-6 text-white/60" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Wallet Address</p>
                            <div className="flex items-center gap-2">
                                <code className="text-sm md:text-base text-white font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 truncate">
                                    {address ? formatFullAddress(address) : "Not connected"}
                                </code>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white" onClick={copyAddress}>
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="border-white/10 text-white hover:bg-white/10 whitespace-nowrap"
                        onClick={() => window.open(explorerUrl, "_blank")}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" /> Explorer
                    </Button>
                </CardContent>
            </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-[#0F0F0F]/40 backdrop-blur-sm hover:bg-[#0F0F0F]/60 transition-colors group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 group-hover:text-orange-400 transition-colors">Capital Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{totalDeployed.toFixed(2)} <span className="text-sm font-normal text-white/40">ETH</span></div>
                <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[70%]" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0F0F0F]/40 backdrop-blur-sm hover:bg-[#0F0F0F]/60 transition-colors group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 group-hover:text-blue-400 transition-colors">Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {portfolioInvoices.filter((inv) => inv.status === 1 || inv.status === 2).length}
                </div>
                <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[45%]" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0F0F0F]/40 backdrop-blur-sm hover:bg-[#0F0F0F]/60 transition-colors group">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white/60 group-hover:text-emerald-400 transition-colors">Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
                Sepolia <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TECH SPECS FOOTER */}
      <Card className="border-white/5 bg-black/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-sm uppercase tracking-widest opacity-50">Chain Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><Globe className="w-4 h-4 text-white/40"/></div>
                <div>
                    <p className="text-xs text-white/40">Network</p>
                    <p className="text-sm font-mono text-white">Sepolia Testnet</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><TrendingUp className="w-4 h-4 text-white/40"/></div>
                <div>
                    <p className="text-xs text-white/40">Currency</p>
                    <p className="text-sm font-mono text-white">SepoliaETH</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><ExternalLink className="w-4 h-4 text-white/40"/></div>
                <div>
                    <p className="text-xs text-white/40">Explorer</p>
                    <a href={explorerUrl} target="_blank" className="text-sm font-mono text-blue-400 hover:underline">Etherscan -&gt;</a>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}