"use client"

import { useEffect, useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Wallet, FileText, DollarSign, Clock, CheckCircle2, ArrowUpRight, ExternalLink } from "lucide-react"
import { fetchInvoicesByBuyer, Invoice, getStatusLabel, calculateDaysRemaining } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import InvoiceMarketplaceABI from "@/lib/contracts/InvoiceMarketplace.json"
// 1. Import the font
import { Press_Start_2P } from "next/font/google"

// 2. Configure the font
const minecraft = Press_Start_2P({ 
  weight: "400", 
  subsets: ["latin"] 
})

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function BigBuyerOutstandingPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [repaying, setRepaying] = useState<number | null>(null)
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
        // Filter for outstanding: Fundraising (2) or Funded (3) in new enum
        const outstanding = buyerInvoices.filter(
          (inv) => inv.status === 2 || inv.status === 3
        )
        setInvoices(outstanding)
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
  }, [address, isConnected, toast])

  const handleRepay = async (invoiceId: number) => {
    if (!walletClient || !address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }

    try {
      setRepaying(invoiceId)
      const provider = new ethers.BrowserProvider(walletClient as any)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        InvoiceMarketplaceABI.abi,
        signer
      )

      // Fetch latest on-chain invoice data to compute principal + yield
      const onchainInvoice = await contract.invoices(invoiceId)
      const principalWei: bigint = onchainInvoice.amount
      const discountRateBps: bigint = onchainInvoice.discountRate

      const tenThousand = BigInt(10000)
      const totalOwedWei = principalWei + (principalWei * discountRateBps) / tenThousand

      const tx = await contract.repayInvoice(invoiceId, { value: totalOwedWei })
      await tx.wait()

      if (address) {
        try {
          await fetch("/api/notifications/invoices/repaid", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              invoiceId,
              buyerAddress: address,
            }),
          })
        } catch (notificationError) {
          console.error("Invoice repaid notification error:", notificationError)
        }
      }

      toast({
        title: "Success",
        description: "Invoice repaid successfully",
      })

      // Reload invoices
      const buyerInvoices = await fetchInvoicesByBuyer(address!)
      const outstanding = buyerInvoices.filter(
        (inv) => inv.status === 2 || inv.status === 3
      )
      setInvoices(outstanding)
    } catch (error: any) {
      console.error("Repay error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to repay invoice",
        variant: "destructive",
      })
    } finally {
      setRepaying(null)
    }
  }

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  )

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view outstanding invoices.
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    // FIX 1: Changed overflow-hidden to overflow-x-hidden to prevent cutting off bottom content
    <div className="min-h-screen bg-transparent relative text-white selection:bg-orange-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Background image with low opacity */}
        <div className="absolute inset-0 w-full h-full">
          <img src="/bitcoin.jpeg" alt="bitcoin background" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-yellow-600/15 blur-[100px] rounded-full" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-orange-400/10 blur-[120px] rounded-full" />
      </div>

      {/* FIX 2: Added pb-20 (padding-bottom) so scrolling goes all the way down */}
      <main className="relative z-10 p-6 space-y-8 pb-20 overflow-visible">
        <div>
          {/* 3. Applied the font here */}
          <h1 className={`${minecraft.className} text-2xl md:text-3xl text-white uppercase leading-normal pt-2`}>
            Outstanding Invoices
          </h1>
          <p className="text-neutral-500 font-medium mt-2">View and pay invoices owed to MSMEs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <DollarSign className="size-6 text-orange-500" />
              </div>
              <ArrowUpRight className="size-5 text-neutral-600 group-hover:text-orange-400" />
            </div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total Outstanding</p>
            <div className="text-3xl font-bold tracking-tighter text-white mt-2">{totalOutstanding.toFixed(2)} MATIC</div>
            <p className="text-xs text-neutral-500 mt-2">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <Clock className="size-6 text-orange-500" />
              </div>
              <ArrowUpRight className="size-5 text-neutral-600 group-hover:text-orange-400" />
            </div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Fundraising</p>
            <div className="text-3xl font-bold tracking-tighter text-white mt-2">{invoices.filter((inv) => inv.status === 2).length}</div>
            <p className="text-xs text-neutral-500 mt-2">Awaiting funding</p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] group p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <CheckCircle2 className="size-6 text-orange-500" />
              </div>
              <ArrowUpRight className="size-5 text-neutral-600 group-hover:text-orange-400" />
            </div>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Funded</p>
            <div className="text-3xl font-bold tracking-tighter text-white mt-2">{invoices.filter((inv) => inv.status === 3).length}</div>
            <p className="text-xs text-neutral-500 mt-2">Ready to repay</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl transition-all duration-300 hover:border-orange-500/50 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]" />
              <h3 className="text-xl font-bold tracking-tight text-white">Invoices Awaiting Payment</h3>
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-none px-4 py-1">{invoices.length} Active</Badge>
          </div>

          <div>
             
            <p className="text-orange-400 font-bold mb-2">Outstanding Summary</p>
            <p className="text-neutral-500">
              Total outstanding: {totalOutstanding.toFixed(2)} MATIC across {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>

          <div className="mt-6">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-70">
                <FileText className="h-12 w-12 text-orange-500" />
                <h3 className="text-lg font-medium text-white">No outstanding invoices</h3>
                <p className="text-sm text-neutral-500 text-center max-w-md">
                  You don't have any invoices that require payment.
                </p>
              </div>
            ) : (
              // FIX 3: Changed bg-black/20 to bg-white/[0.02] (glassy) to see the background blobs
              <div className="rounded-lg border border-orange-500/10 bg-white/[0.02] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-orange-500/20 hover:bg-white/[0.02]">
                      <TableHead className="text-orange-300">Invoice ID</TableHead>
                      <TableHead className="text-orange-300">MSME Address</TableHead>
                      <TableHead className="text-orange-300 text-right">Invoice Amount</TableHead>
                      <TableHead className="text-orange-300">Due Date</TableHead>
                      <TableHead className="text-orange-300 text-center">Days Remaining</TableHead>
                      <TableHead className="text-orange-300 text-center">Status</TableHead>
                      <TableHead className="text-orange-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const daysRemaining = calculateDaysRemaining(invoice.dueDate)
                      const statusLabel = getStatusLabel(invoice.status)
                      // Late/repay only for funded invoices (status 3 in new enum)
                      const isLate = daysRemaining < 0 && invoice.status === 3
                      const canRepay = invoice.status === 3

                      return (
                        <TableRow
                          key={invoice.id}
                          // FIX 4: Changed hover state to a lighter white opacity for glass effect
                          className="border-b border-orange-500/10 hover:bg-white/[0.05] transition-colors"
                        >
                          <TableCell className="font-medium font-mono text-xs text-white">#{invoice.id}</TableCell>
                          <TableCell className="font-mono text-xs text-orange-200">{formatAddress(invoice.msme)}</TableCell>
                          <TableCell className="text-right font-semibold text-white">
                            {parseFloat(invoice.amount).toFixed(2)} MATIC
                          </TableCell>
                          <TableCell className="text-orange-200">{invoice.dueDate.toLocaleDateString()}</TableCell>
                          <TableCell className="text-center">
                            <span className={isLate ? "text-red-400 font-semibold" : "text-orange-300"}>
                              {daysRemaining}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={isLate ? "destructive" : statusLabel === "Funded" ? "default" : "outline"}
                              className={`${isLate ? "animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}`}
                            >
                              {isLate ? "Late" : statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                <Button
                                size="sm"
                                variant="outline"
                                asChild
                                title="Opens the original invoice uploaded by MSME for verification"
                                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                              >
                                <a 
                                  href={`/dashboard/bigbuyer/history/${invoice.id}`}
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <FileText className="size-3" />
                                  View
                                  <ExternalLink className="size-2.5" />
                                </a>
                              </Button>
                              {canRepay && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleRepay(invoice.id)}
                                  disabled={repaying === invoice.id}
                                  className="bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                                >
                                  <CreditCard className="size-3 mr-1" />
                                  {repaying === invoice.id ? "Repaying..." : "Repay"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}