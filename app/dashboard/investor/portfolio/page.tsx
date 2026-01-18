"use client"

import { useEffect, useState, MouseEvent } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { TrendingUp, PieChart, ShieldCheck, DollarSign, Wallet, FileText, MessageCircle, X, Clock, CheckCircle2, ExternalLink } from "lucide-react"
import { fetchAllInvoices, fetchInvestmentAmount, Invoice, getStatusLabel, calculateDaysRemaining } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import InvoiceCard from "@/components/marketplace/InvoiceCard"
import { DashboardChatSection } from "@/components/chat/DashboardChatSection"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 1. IMPORT MINECRAFT-STYLE FONT
import { Press_Start_2P } from 'next/font/google'

const minecraft = Press_Start_2P({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

// --- 3D BACKGROUND COMPONENT ---
// CHANGED: "fixed" to "absolute" to prevent covering the sidebar
const BackgroundOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a0a0a]">
      {/* Orb 1: Orange/Red Glow */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0], 
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]" 
      />
      {/* Orb 2: Purple */}
      <motion.div 
        animate={{ 
          x: [0, -70, 0], 
          y: [0, 100, 0], 
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" 
      />
      {/* Orb 3: Blue/Deep */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, 50, 0], 
          opacity: [0.3, 0.6, 0.3] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px]" 
      />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  )
}

// --- VISUAL COMPONENTS ---

// 1. Linear Progress Bar
const LinearBar = ({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) => {
  const progress = Math.min(value / max, 1) * 100

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-medium text-white/60">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
        <motion.div
          className={`h-full rounded-full ${color.replace("stroke-", "bg-")}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ boxShadow: "0 0 10px rgba(255,255,255,0.3)" }} 
        />
      </div>
    </div>
  )
}

// 2. GLOW CARD (Replicating Screenshot Effect)
const GlowCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    return (
      <div className={`relative group ${className}`}>
        <div 
            className="relative h-full overflow-hidden rounded-2xl bg-[#0F0F0F]/80 backdrop-blur-xl border border-white/5 transition-all duration-500"
            style={{
                boxShadow: `
                    inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 
                    inset 0 -20px 40px -20px rgba(255, 84, 27, 0.15), 
                    0 20px 40px -20px rgba(0,0,0,0.8)
                `
            }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <div className="absolute -bottom-20 left-0 right-0 h-40 bg-[#FF541B] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </div>
    )
  }

// 3. Parallax Tilt Wrapper
const TiltWrapper = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 })
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"])

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
    <div className="perspective-1000 h-full">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

function formatAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// --- MAIN PAGE COMPONENT ---

export default function InvestorPortfolioPage() {
  const { address, isConnected } = useAccount()
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [investments, setInvestments] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
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
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [address, isConnected, toast])

  const portfolioInvoices = allInvoices.filter((inv) => investments[inv.id])
  const activeInvestments = portfolioInvoices.filter((inv) => inv.status === 2 || inv.status === 3)
  const totalDeployed = Object.values(investments).reduce(
    (sum, amount) => sum + parseFloat(amount),
    0
  )
  const portfolioValue = portfolioInvoices.reduce((sum, inv) => sum + parseFloat(inv.fundedAmount), 0)
  const settledCount = portfolioInvoices.filter((inv) => inv.status === 4 || inv.status === 5).length

  // Stats Data
  const statsData = [
    {
      label: "Total Capital",
      value: `${totalDeployed.toFixed(2)} SepoliaETH`,
      subtext: `${portfolioInvoices.length} investments`,
      icon: TrendingUp,
      color: "text-orange-400",
      barColor: "bg-orange-500",
      percentage: totalDeployed > 0 ? (totalDeployed / (totalDeployed + 1000)) * 100 : 0
    },
    {
      label: "Active Investments",
      value: activeInvestments.length.toString(),
      subtext: "Currently funded",
      icon: CheckCircle2,
      color: "text-green-400",
      barColor: "bg-green-500",
      percentage: portfolioInvoices.length > 0 ? (activeInvestments.length / portfolioInvoices.length) * 100 : 0
    },
    {
      label: "Portfolio Value",
      value: `${portfolioValue.toFixed(2)} SepoliaETH`,
      subtext: "Total funded",
      icon: TrendingUp,
      color: "text-blue-400",
      barColor: "bg-blue-500",
      percentage: 75 
    },
    {
      label: "Settled",
      value: settledCount.toString(),
      subtext: "Completed",
      icon: Clock,
      color: "text-purple-400",
      barColor: "bg-purple-500",
      percentage: portfolioInvoices.length > 0 ? (settledCount / portfolioInvoices.length) * 100 : 0
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 relative overflow-hidden">
        <BackgroundOrbs />
        <div className="relative">
             <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
             <Wallet className="h-12 w-12 text-muted-foreground relative z-10" />
        </div>
        <h3 className="text-lg font-medium text-white">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view your investment portfolio.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 relative overflow-hidden min-h-screen">
        <BackgroundOrbs />
        <div>
          <Skeleton className="h-9 w-64 mb-2 bg-white/10" />
          <Skeleton className="h-5 w-96 bg-white/5" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 relative min-h-screen pb-20 overflow-hidden" // overflow-hidden ensures background doesn't spill
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. 3D Background - Now ABSOLUTE so it stays in this container */}
      <BackgroundOrbs />

      <motion.div variants={itemVariants}>
        <h2 className={`text-3xl font-bold tracking-tight text-white ${minecraft.className} leading-relaxed pt-2 drop-shadow-lg`}>
            My Portfolio
        </h2>
        <p className="text-white/60 mt-2">Track your active capital and expected returns</p>
      </motion.div>

      {/* --- STATS CARDS WITH SCREENSHOT EFFECT & PARALLAX --- */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        {statsData.map((stat) => (
          <TiltWrapper key={stat.label}>
            {/* GlowCard implements the screenshot design */}
            <GlowCard className="h-full">
              <div className="p-6 flex flex-col justify-between h-full gap-4">
                <div className="flex flex-row items-center justify-between space-y-0">
                  <span className="text-sm font-medium text-white/70">{stat.label}</span>
                  <stat.icon className={`size-4 ${stat.color} opacity-80`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tracking-wide drop-shadow-md mb-2">
                    {stat.value}
                  </div>
                  {/* Added LinearBar here for extra visual flair matching previous requests */}
                  <LinearBar value={stat.percentage} color={stat.barColor} />
                  <p className="text-xs text-white/40 mt-2">{stat.subtext}</p>
                </div>
              </div>
            </GlowCard>
          </TiltWrapper>
        ))}
      </motion.div>

      {/* Action Center */}
      {portfolioInvoices.length > 0 && (
        <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-[#0a0a0a]/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className={`text-white ${minecraft.className} text-sm md:text-base`}>Action Center</CardTitle>
                <CardDescription className="text-white/40">
                Invoices you can currently interact with (invested, fundraising, repaid, or refundable).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                {portfolioInvoices.map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
                </div>
            </CardContent>
            </Card>
        </motion.div>
      )}

      {/* Investments Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-[#0a0a0a]/60 backdrop-blur-xl">
            <CardHeader>
            <CardTitle className={`text-white ${minecraft.className} text-sm md:text-base`}>My Investments</CardTitle>
            <CardDescription className="text-white/40">Invoices you are currently funding</CardDescription>
            </CardHeader>
            <CardContent>
            {portfolioInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium text-white">No investments yet</h3>
                <p className="text-sm text-white/40 text-center max-w-md">
                    You haven't invested in any invoices yet. Browse the marketplace to start investing.
                </p>
                <Link href="/dashboard/investor/marketplace">
                    <Button className="bg-orange-600 hover:bg-orange-500 text-white">Browse Marketplace</Button>
                </Link>
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/60">Invoice ID</TableHead>
                    <TableHead className="text-white/60">MSME Address</TableHead>
                    <TableHead className="text-white/60">Buyer Address</TableHead>
                    <TableHead className="text-right text-white/60">Invested Amount</TableHead>
                    <TableHead className="text-right text-white/60">Total Invoice</TableHead>
                    <TableHead className="text-white/60">Due Date</TableHead>
                    <TableHead className="text-center text-white/60">Status</TableHead>
                    <TableHead className="text-right text-white/60">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {portfolioInvoices.map((invoice) => {
                    const daysRemaining = calculateDaysRemaining(invoice.dueDate)
                    const statusLabel = getStatusLabel(invoice.status)
                    const isLate = daysRemaining < 0 && invoice.status === 3

                    return (
                        <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium font-mono text-xs text-orange-400">#{invoice.id}</TableCell>
                        <TableCell className="font-mono text-xs text-white/70">{formatAddress(invoice.msme)}</TableCell>
                        <TableCell className="font-mono text-xs text-white/70">{formatAddress(invoice.buyer)}</TableCell>
                        <TableCell className="text-right font-semibold text-white">
                            {parseFloat(investments[invoice.id]).toFixed(4)} SepoliaETH
                        </TableCell>
                        <TableCell className="text-right text-white/70">
                            {parseFloat(invoice.amount).toFixed(2)} SepoliaETH
                        </TableCell>
                        <TableCell className="text-white/70">{invoice.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={isLate ? "destructive" : statusLabel === "Funded" ? "default" : "outline"} className="border-white/20">
                            {isLate ? "Late" : statusLabel}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="border-white/10 hover:bg-white/10 text-white hover:text-orange-400"
                            title="Opens the original invoice uploaded by the MSME for verification"
                            >
                            <a 
                                href={`https://ipfs.io/ipfs/sample-invoice-${invoice.id}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                <FileText className="size-3" />
                                View
                                <ExternalLink className="size-2.5" />
                            </a>
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
      </motion.div>

      {/* --- FLOATING CHAT WIDGET --- */}
      {address && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[350px] md:w-[450px] shadow-2xl rounded-xl overflow-hidden border border-purple-500/20 bg-[#1a1a1a]/95 backdrop-blur-xl"
                    >
                         <DashboardChatSection walletAddress={address} role="investor" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Button
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg shadow-purple-500/25 bg-purple-500 hover:bg-purple-600 text-white hover:scale-110 transition-transform"
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
      )}
    </motion.div>
  )
}