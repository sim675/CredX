"use client"

import { useEffect, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle, Wallet, FileText, ExternalLink, History, TrendingUp } from "lucide-react"
import { fetchInvoicesByMSME, Invoice, getStatusLabel } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

// --- Custom Neon Progress Bar Component ---
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
    <div className={`h-2 w-full rounded-full overflow-hidden ${bgClass}`}>
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

export default function MSMEHistoryPage() {
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
        // Filter for settled invoices: Repaid (3) or Defaulted (4)
        const settledInvoices = msmeInvoices.filter(
          (inv) => inv.status === 3 || inv.status === 4
        )
        setInvoices(settledInvoices)
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

  // Calculate stats from blockchain data
  const totalSettled = invoices.length
  const totalLiquidityReceived = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.fundedAmount),
    0
  )
  const repaidInvoices = invoices.filter((inv) => inv.status === 3)
  const onTimeCount = repaidInvoices.length 
  const onTimeRate = totalSettled > 0 ? Math.round((onTimeCount / totalSettled) * 100) : 0
  const defaultedCount = invoices.filter((inv) => inv.status === 4).length
  
  // Calculate default rate for the progress bar
  const defaultRate = totalSettled > 0 ? Math.round((defaultedCount / totalSettled) * 100) : 0

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 relative z-10">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full transform scale-50 -z-10" />
        <div className="p-6 rounded-full bg-primary/10 border border-primary/20">
          <Wallet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-white">Connect your wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view your settled invoice history.
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
        <div className="absolute top-0 left-0 -z-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" />
        <div>
          <Skeleton className="h-10 w-64 mb-2 bg-white/5" />
          <Skeleton className="h-5 w-96 bg-white/5" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-8 relative z-10 pb-20">
      
      {/* Ambient Backgrounds */}
      <div className="absolute top-0 left-0 -z-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 -z-10 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm font-pirate">Settled History</h2>
        <p className="text-muted-foreground mt-1">
          Complete financial record of settled and closed invoices.
        </p>
      </div>

      {/* --- STATS CARDS WITH BARS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Settled */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-200/70 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3 h-3 text-blue-400" />
              Invoices Settled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-bold text-white">{totalSettled}</div>
              <span className="text-[10px] text-muted-foreground">Lifetime</span>
            </div>
            <ProgressBar value={100} colorClass="bg-blue-500" />
            <p className="text-[10px] text-muted-foreground mt-2">
              {totalSettled === 0 ? "No invoices settled yet" : "Total processed invoices"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Liquidity */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-purple-200/70 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-400" />
              Liquidity Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-bold text-white">
                {totalLiquidityReceived.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">MATIC</span>
              </div>
            </div>
            <ProgressBar value={100} colorClass="bg-purple-500" />
            <p className="text-[10px] text-muted-foreground mt-2">
              Lifetime funding received
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Success Rate */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-bold text-white">{onTimeRate}%</div>
              <span className="text-[10px] text-emerald-400/80 font-medium">
                {onTimeCount}/{totalSettled} Repaid
              </span>
            </div>
            <ProgressBar value={onTimeRate} colorClass="bg-emerald-500" />
            <p className="text-[10px] text-muted-foreground mt-2">
              Successfully repaid invoices
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Defaults */}
        <Card className="backdrop-blur-xl border-white/5 bg-[#121212]/80 hover:bg-[#1a1a1a]/90 transition-all duration-300 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-red-200/70 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-400" />
              Defaults
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-2xl font-bold text-white">{defaultedCount}</div>
              <span className="text-[10px] text-red-400/80 font-medium">
                {defaultRate}% Rate
              </span>
            </div>
            <ProgressBar value={defaultRate} colorClass="bg-red-500" />
            <p className="text-[10px] text-muted-foreground mt-2">
              Invoices failed to repay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- TABLE --- */}
      <Card className="backdrop-blur-xl bg-card/40 border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        
        <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
          <CardTitle className="text-xl font-semibold text-white/90">Settlement Records</CardTitle>
          <CardDescription className="text-muted-foreground">
            Historical transparency of all completed invoices on-chain.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
               <div className="p-4 rounded-full bg-white/5 border border-white/10">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-white/80">No settled invoices</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                You don't have any invoices that have been repaid or defaulted yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Invoice ID</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Buyer</TableHead>
                  {/* Restored: Assigned Investor Column */}
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-center">Assigned Investor</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Value</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Received</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60">Due Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-center">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-white/60 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const statusLabel = getStatusLabel(invoice.status)
                  const isRepaid = invoice.status === 3
                  const isDefaulted = invoice.status === 4

                  return (
                    <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white/90">
                        #{invoice.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatAddress(invoice.buyer)}
                      </TableCell>
                      {/* Restored: Assigned Investor Logic */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {invoice.isPrivate && invoice.exclusiveInvestor
                          ? formatAddress(invoice.exclusiveInvestor)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-white/90">
                        {parseFloat(invoice.amount).toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">MATIC</span>
                      </TableCell>
                      <TableCell className="text-right text-white/80">
                        {parseFloat(invoice.fundedAmount).toFixed(2)} MATIC
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {invoice.dueDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                           {isRepaid ? (
                            <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 flex gap-1 pl-1">
                               <CheckCircle2 className="w-3 h-3" /> Repaid
                            </Badge>
                          ) : isDefaulted ? (
                             <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 flex gap-1 pl-1">
                               <AlertCircle className="w-3 h-3" /> Defaulted
                            </Badge>
                          ) : (
                            <Badge variant="outline">{statusLabel}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-8 text-xs hover:bg-white/10 hover:text-white"
                        >
                          <Link 
                            href={`/dashboard/msme/active/${invoice.id}`}
                            className="flex items-center gap-1"
                          >
                            <FileText className="size-3" />
                            Details
                            <ExternalLink className="size-2.5 opacity-50" />
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