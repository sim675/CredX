"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, DollarSign, AlertCircle, CheckCircle2, Wallet, FileText } from "lucide-react"
import { fetchAllInvoices, fetchInvestmentAmount, Invoice, getStatusLabel } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"

// 1. IMPORT MINECRAFT FONT
import { Press_Start_2P } from 'next/font/google'

const minecraft = Press_Start_2P({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

// 2. CUSTOM CARD COMPONENT WITH DYNAMIC COLORED GLOW
const GlowStatCard = ({ title, value, subtext, icon: Icon, iconColor, glowHex }: any) => {
  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-[#0F0F0F] border border-white/5"
      style={{
        // Replicating the "Inner shadow" but using the dynamic glowHex color
        // We append '40' to the hex to create roughly 25% opacity for the shadow
        boxShadow: `
          inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 
          inset 0 -20px 40px -20px ${glowHex}40,
          0 10px 20px -10px rgba(0,0,0,0.5)
        `
      }}
    >
       {/* Bottom Glow Gradient using the specific color */}
       <div 
         className="absolute -bottom-10 left-0 right-0 h-20 blur-[50px] opacity-20 pointer-events-none" 
         style={{ backgroundColor: glowHex }}
       />

       <div className="relative z-10 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            {/* Icon also uses the class passed in (e.g. text-green-400) */}
            <Icon className={`size-4 ${iconColor}`} />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-wide drop-shadow-sm">{value}</div>
            <p className="text-xs text-white/50 mt-1">{subtext}</p>
          </div>
       </div>
    </div>
  )
}

export default function InvestorReturnsPage() {
  const { address, isConnected } = useAccount()
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [investments, setInvestments] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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

        // Fetch investment amounts for each invoice
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
          description: "Failed to load returns data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [address, isConnected, toast])

  // Filter invoices where user has investments and are settled (Repaid or Defaulted)
  const portfolioInvoices = allInvoices.filter((inv) => investments[inv.id])
  // In new enum: 4 = Repaid, 5 = Defaulted
  const settledInvestments = portfolioInvoices.filter((inv) => inv.status === 4 || inv.status === 5)
  const repaidInvestments = settledInvestments.filter((inv) => inv.status === 4)
  const defaultedInvestments = settledInvestments.filter((inv) => inv.status === 5)

  // Calculate stats from blockchain data
  const totalPrincipalDeployed = settledInvestments.reduce(
    (sum, inv) => sum + parseFloat(investments[inv.id]),
    0
  )

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view your investment returns.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-3xl font-bold tracking-tight text-white leading-relaxed ${minecraft.className}`}>
            Returns
        </h2>
        <p className="text-muted-foreground mt-2">Track your financial performance and earnings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* 1. Settled Investments - GREEN GLOW */}
        <GlowStatCard 
            title="Settled Investments"
            value={settledInvestments.length}
            subtext="Completed investments"
            icon={DollarSign}
            iconColor="text-green-400"
            glowHex="#4ade80" // Green-400
        />

        {/* 2. Total Principal - ORANGE GLOW */}
        <GlowStatCard 
            title="Total Principal"
            value={`${totalPrincipalDeployed.toFixed(2)} MATIC`}
            subtext="In settled investments"
            icon={TrendingUp}
            iconColor="text-orange-400"
            glowHex="#fb923c" // Orange-400
        />

        {/* 3. Repaid - GREEN GLOW */}
        <GlowStatCard 
            title="Repaid"
            value={repaidInvestments.length}
            subtext="Successfully repaid"
            icon={CheckCircle2}
            iconColor="text-green-400"
            glowHex="#4ade80" // Green-400
        />

        {/* 4. Defaulted - RED GLOW */}
        <GlowStatCard 
            title="Defaulted"
            value={defaultedInvestments.length}
            subtext="Defaulted investments"
            icon={AlertCircle}
            iconColor="text-red-500"
            glowHex="#ef4444" // Red-500
        />
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <CardDescription>Completed investments and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          {settledInvestments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No settled investments</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any investments that have been repaid or defaulted yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead>Invoice ID</TableHead>
                  <TableHead className="text-right">Principal Invested</TableHead>
                  <TableHead className="text-right">Invoice Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settledInvestments.map((inv) => (
                  <TableRow key={inv.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium font-mono text-xs text-primary">#{inv.id}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {parseFloat(investments[inv.id]).toFixed(4)} SepoliaETH
                    </TableCell>
                    <TableCell className="text-right">{parseFloat(inv.amount).toFixed(2)} SepoliaETH</TableCell>
                    <TableCell>{inv.dueDate.toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={inv.status === 3 ? "secondary" : "destructive"}>
                        {getStatusLabel(inv.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}