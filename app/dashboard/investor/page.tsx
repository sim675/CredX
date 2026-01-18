"use client"

import { useEffect, useState, MouseEvent } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { TrendingUp, PieChart, ShieldCheck, DollarSign, Wallet, FileText, MessageCircle, X } from "lucide-react"
import { fetchAllInvoices, fetchInvestmentAmount, Invoice } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { DashboardChatSection } from "@/components/chat/DashboardChatSection"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"

// 1. IMPORT THE MINECRAFT FONT
import { Press_Start_2P } from "next/font/google"

// 2. CONFIGURE THE FONT
const minecraft = Press_Start_2P({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap" 
})

// ... [Keep your LinearBar and TiltCard components exactly as they were] ...

const LinearBar = ({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) => {
  const progress = Math.min(value / max, 1) * 100

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/30">
        <motion.div
          className={`h-full rounded-full ${color.replace("stroke-", "bg-")}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"])
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"])
  const glareOpacity = useTransform(mouseX, [-0.5, 0.5], [0, 0.4]) 

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseXFromCenter = e.clientX - rect.left - width / 2
    const mouseYFromCenter = e.clientY - rect.top - height / 2
    x.set(mouseXFromCenter / width)
    y.set(mouseYFromCenter / height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="relative perspective-1000"> 
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative transform transition-all duration-200 ease-out will-change-transform ${className}`}
      >
        {children}
        <motion.div 
            style={{
                background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.3) 0%, transparent 80%)`,
                opacity: glareOpacity,
                pointerEvents: "none"
            }}
            className="absolute inset-0 rounded-xl z-20 mix-blend-overlay"
        />
      </motion.div>
    </div>
  )
}

// ... [Main Component Starts Here] ...

export default function InvestorDashboard() {
  // ... [Keep all your hooks (useAccount, useState, useEffect, etc.) exactly as they were] ...
  const { address, isConnected } = useAccount()
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [investments, setInvestments] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { toast } = useToast()

  // ... [Keep useEffect and data loading logic unchanged] ...
  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError(null)
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
        console.error(error)
        setError("Failed to load investment data. Please try again later.")
        toast({ title: "Error", description: "Failed to load investment data", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [address, isConnected, toast])

  // ... [Keep variable calculations (portfolioInvoices, etc.) unchanged] ...
  const portfolioInvoices = allInvoices.filter((inv) => investments[inv.id])
  const totalDeployed = Object.values(investments).reduce((sum, amount) => sum + parseFloat(amount), 0)
  const activeInvestments = portfolioInvoices.filter((inv) => inv.status === 2 || inv.status === 3)
  const fundedSum = portfolioInvoices.reduce((sum, inv) => sum + parseFloat(inv.fundedAmount), 0)

  // ... [Keep portfolioStats unchanged] ...
  const portfolioStats = [
    { label: "Total Deployed", value: `${totalDeployed.toFixed(2)} SepoliaETH`, icon: DollarSign, color: "text-primary", barColor: "bg-primary", percentage: totalDeployed > 0 ? (totalDeployed / (totalDeployed + 1000)) * 100 : 0 },
    { label: "Active Investments", value: activeInvestments.length.toString(), icon: ShieldCheck, color: "text-emerald-500", barColor: "bg-emerald-500", percentage: portfolioInvoices.length > 0 ? (activeInvestments.length / portfolioInvoices.length) * 100 : 0 },
    { label: "Portfolio Size", value: portfolioInvoices.length.toString(), icon: PieChart, color: "text-amber-500", barColor: "bg-amber-500", percentage: 75 },
    { label: "Funded Amount", value: `${fundedSum.toFixed(2)} SepoliaETH`, icon: TrendingUp, color: "text-blue-500", barColor: "bg-blue-500", percentage: totalDeployed > 0 ? (fundedSum / totalDeployed) * 100 : 0 },
  ]

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }

  // ... [Keep the "Not Connected" and "Loading" views unchanged] ...
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative">
             <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
             <Wallet className="h-12 w-12 text-muted-foreground relative z-10" />
        </div>
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">Connect your wallet to view your investment portfolio.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div><Skeleton className="h-9 w-64 mb-2" /><Skeleton className="h-5 w-96" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => (<Card key={i} className="border-border/50"><CardHeader><Skeleton className="h-4 w-32 mb-2" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>))}</div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 relative min-h-screen pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <svg className="invisible absolute w-0 h-0"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" /></filter></svg>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ filter: "url(#noiseFilter)" }} />
      </div>

      <motion.div variants={itemVariants} className="space-y-1">
        {/* 3. APPLY THE MINECRAFT FONT HERE */}
        {/* Added 'minecraft.className' and slightly reduced size to 'text-xl md:text-2xl' because pixel fonts are naturally wide */}
        <h1 className={`${minecraft.className} text-xl md:text-2xl font-bold tracking-tight leading-relaxed py-1`}>
            Investor Overview
        </h1>
        <p className="text-muted-foreground">Manage your decentralized RWA portfolio.</p>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
            <Card className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-destructive">{"There's a problem"}</CardTitle><CardDescription>{error}</CardDescription></CardHeader>
            </Card>
        </motion.div>
      )}

      {/* ... [Rest of the JSX remains exactly unchanged] ... */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={itemVariants}>
        {portfolioStats.map((stat) => (
          <TiltCard key={stat.label} className="h-full">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md h-full shadow-lg hover:shadow-primary/5 transition-shadow relative z-10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`size-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <LinearBar value={stat.percentage} color={stat.barColor} />
              </CardContent>
            </Card>
          </TiltCard>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Active Investments</CardTitle><CardDescription>Your current portfolio investments.</CardDescription></div>
            <Button variant="outline" asChild className="hover:scale-105 transition-transform"><Link href="/dashboard/investor/portfolio">View Portfolio</Link></Button>
            </CardHeader>
            <CardContent>
            {activeInvestments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium">No active investments</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">You don't have any active investments yet. Browse the marketplace to start investing.</p>
                <Button asChild className="bg-primary/90 hover:bg-primary hover:scale-105 transition-all"><Link href="/dashboard/investor/marketplace">Browse Marketplace</Link></Button>
                </div>
            ) : (
                <div className="relative w-full overflow-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="h-10 px-2 text-left font-medium">Invoice ID</th>
                        <th className="h-10 px-2 text-left font-medium">MSME</th>
                        <th className="h-10 px-2 text-left font-medium">Invested</th>
                        <th className="h-10 px-2 text-left font-medium">Total Amount</th>
                        <th className="h-10 px-2 text-left font-medium">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                    <AnimatePresence>
                        {activeInvestments.map((inv, index) => (
                        <motion.tr 
                            key={inv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-muted/30 transition-colors"
                        >
                            <td className="p-4 font-mono text-xs text-primary/80">#{inv.id}</td>
                            <td className="p-4 font-mono text-xs opacity-70">{inv.msme.slice(0, 6)}...{inv.msme.slice(-4)}</td>
                            <td className="p-4 font-medium">{parseFloat(investments[inv.id]).toFixed(4)} SepoliaETH</td>
                            <td className="p-4">{parseFloat(inv.amount).toFixed(2)} SepoliaETH</td>
                            <td className="p-4"><Badge variant={inv.status === 1 ? "outline" : "default"} className="animate-in fade-in">{inv.status === 1 ? "Fundraising" : "Funded"}</Badge></td>
                        </motion.tr>
                        ))}
                    </AnimatePresence>
                    </tbody>
                </table>
                </div>
            )}
            </CardContent>
        </Card>
      </motion.div>

      {address && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[350px] md:w-[450px] shadow-2xl rounded-xl overflow-hidden border border-border/50"
                    >
                         <DashboardChatSection walletAddress={address} role="investor" />
                    </motion.div>
                )}
            </AnimatePresence>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg shadow-purple-500/25 bg-purple-500 hover:bg-purple-600 text-white hover:scale-110 transition-transform" onClick={() => setIsChatOpen(!isChatOpen)}>
                {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
      )}
    </motion.div>
  )
}