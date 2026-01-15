"use client"

import { useEffect, useState, useRef } from "react"
import { useAccount, useBalance, usePublicClient } from "wagmi"
import { formatEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, ExternalLink, Copy, Check, Camera, Upload, User, TrendingUp, Clock, Globe } from "lucide-react"
import { fetchInvoicesByMSME, Invoice } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { cn } from "@/lib/utils"

// 1. Import Rye Font
import { Rye } from 'next/font/google'

// 2. Configure Rye Font
const rye = Rye({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

// --- Custom Progress Bar Component ---
const ProgressBar = ({ 
  value, 
  max = 100, 
  colorClass = "bg-primary", 
  bgClass = "bg-white/10" 
}: { 
  value: number; 
  max?: number; 
  colorClass?: string;
  bgClass?: string;
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 w-full rounded-full overflow-hidden ${bgClass} mt-3`}>
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatFullAddress(addr: string) {
  return `${addr.slice(0, 10)}...${addr.slice(-8)}`
}

export default function MSMEWalletPage() {
  const { address, isConnected } = useAccount()
  const { user } = useAuth()
  const publicClient = usePublicClient()
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  })
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Profile Picture State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isConnected || !address) {
        setIsLoadingInvoices(false)
        return
      }

      try {
        setIsLoadingInvoices(true)
        const msmeInvoices = await fetchInvoicesByMSME(address, publicClient || undefined)
        setInvoices(msmeInvoices)
        setIsLoadingInvoices(false)
      } catch (error) {
        console.error("Error loading invoices:", error)
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive",
        })
        setIsLoadingInvoices(false)
      }
    }

    loadInvoices()
  }, [address, isConnected, publicClient, toast])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Handle Profile Picture Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        })
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        toast({
          title: "Profile Updated",
          description: "Your new profile picture has been set locally.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate stats from blockchain data
  const totalLiquidityReceived = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.fundedAmount),
    0
  )
  
  const activeInvoices = invoices.filter(
    (inv) => inv.status === 1 || inv.status === 2
  )
  
  const pendingSettlements = activeInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.fundedAmount),
    0
  )

  // Calculate percentages for bars
  // For liquidity, we treat 10k MATIC as a "goal" just for visual progress example, or 100% if no goal.
  // Let's use 100% visual fill for Total Liquidity as it's an accumulation.
  // For Pending, we show what % of total liquidity is currently pending.
  const pendingPercentage = totalLiquidityReceived > 0 
    ? (pendingSettlements / totalLiquidityReceived) * 100 
    : 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative z-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transform scale-50 -z-10" />
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white">Connect your wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view your wallet balance and transaction history.
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25" asChild>
          <Link href="/connect">Connect Wallet</Link>
        </Button>
      </div>
    )
  }

  const polygonScanUrl = `https://amoy.polygonscan.com/address/${address}`

  return (
    <div className="space-y-8 relative z-10 pb-20">
      
      {/* Ambient Backgrounds */}
      <div className="absolute top-0 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 -z-10 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div>
        {/* 3. Apply Rye Font Here */}
        <h2 className={cn(
          "text-3xl font-bold tracking-tight text-white drop-shadow-sm uppercase",
          rye.className
        )}>
          My Wallet
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your assets, view balances, and track blockchain activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* WALLET BALANCE CARD */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500 opacity-70" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wallet className="size-5" />
              </div>
              Wallet Balance
            </CardTitle>
            <CardDescription className="text-white/50">Your native POL balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Balance</p>
              {isLoadingBalance ? (
                <Skeleton className="h-12 w-48 bg-white/5" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold text-white tracking-tight">
                    {balanceData ? parseFloat(formatEther(BigInt(balanceData.value))).toFixed(4) : "0.0000"} 
                  </p>
                  <span className="text-xl font-medium text-primary">POL</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5 text-white"
                onClick={() => window.open(polygonScanUrl, "_blank")}
              >
                <ExternalLink className="size-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CONNECTED WALLET CARD */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
               <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Globe className="size-5" />
              </div>
              Connected Wallet
            </CardTitle>
            <CardDescription className="text-white/50">Your active blockchain identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Public Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-black/40 px-4 py-3 rounded-lg border border-white/10 flex-1 font-mono text-blue-200">
                  {address ? formatFullAddress(address) : "Not connected"}
                </code>
                {address && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-white/10 text-white"
                    onClick={copyAddress}
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            {address && (
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase">Network</p>
                      <p className="text-sm font-medium text-white">Polygon Amoy</p>
                  </div>
                   <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-[10px] text-muted-foreground uppercase">Chain ID</p>
                      <p className="text-sm font-medium text-white">80002</p>
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* STATS ROW */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Liquidity */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg hover:bg-[#1a1a1a]/90 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-purple-200/70 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="size-4 text-purple-400" />
                Total Liquidity Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <Skeleton className="h-8 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {totalLiquidityReceived.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MATIC</span>
                </div>
                <ProgressBar value={100} colorClass="bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-2">Lifetime funding received</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Settlements */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg hover:bg-[#1a1a1a]/90 transition-all duration-300">
          <CardHeader className="pb-2">
             <CardTitle className="text-xs font-medium text-amber-200/70 uppercase tracking-wider flex items-center gap-2">
                <Clock className="size-4 text-amber-400" />
                Pending Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <Skeleton className="h-8 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {pendingSettlements.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MATIC</span>
                </div>
                <ProgressBar value={pendingPercentage} colorClass="bg-amber-500" />
                <p className="text-[10px] text-muted-foreground mt-2">
                   From active invoices
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg hover:bg-[#1a1a1a]/90 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider flex items-center gap-2">
                <Globe className="size-4 text-emerald-400" />
                Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
                 Online <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            </div>
            <ProgressBar value={100} colorClass="bg-emerald-500" />
            <p className="text-[10px] text-muted-foreground mt-2">Polygon Amoy Testnet</p>
          </CardContent>
        </Card>
      </div>

      {/* WALLET INFORMATION & PROFILE PICTURE */}
      <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 shadow-lg overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        <CardHeader>
          <CardTitle className="text-lg text-white">Wallet & Profile Information</CardTitle>
          <CardDescription className="text-white/50">
            Personalize your identity and view technical details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4 w-full md:w-auto md:min-w-[200px]">
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-white/5 shadow-2xl group-hover:border-primary/50 transition-colors duration-300">
                        <AvatarImage 
                              src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`} 
                              className="object-cover h-full w-full" 
                              alt="Profile"
                            />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                            {user?.name?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover Overlay for Upload */}
                    <div 
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                    >
                        <Camera className="h-8 w-8 text-white mb-1" />
                    </div>
                    
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>
                <div className="text-center">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAvatarClick}
                        className="border-white/10 hover:bg-white/5 text-xs h-8"
                    >
                        <Upload className="w-3 h-3 mr-2" />
                        Change Photo
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2">Max size 5MB. Supports JPG, PNG.</p>
                </div>
            </div>

            {/* Technical Details */}
            <div className="flex-1 space-y-6 w-full border-l border-white/5 pl-0 md:pl-8">
               <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Display Name</p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 border border-white/5">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-white">{user?.name || "Anonymous User"}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Type</p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-white capitalize">{user?.role || "MSME"} Account</span>
                        </div>
                    </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-medium text-white border-b border-white/5 pb-2">Technical Details</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Currency</p>
                        <p className="text-sm font-medium text-white">POL (Polygon)</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Standard</p>
                        <p className="text-sm font-medium text-white">ERC-20 / ERC-721</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Explorer</p>
                        <Button
                            variant="link"
                            className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                            onClick={() => window.open(polygonScanUrl, "_blank")}
                        >
                            View on PolygonScan
                            <ExternalLink className="size-3 ml-1" />
                        </Button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}