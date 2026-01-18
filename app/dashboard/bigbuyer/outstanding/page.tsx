"use client"

import { useEffect, useState, useCallback } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Wallet, FileText, DollarSign, Clock, CheckCircle2, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react"
import { fetchInvoicesByBuyer, Invoice, getStatusLabel, calculateDaysRemaining } from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { useInvoiceNFT } from "@/lib/contracts/useInvoiceNFT"
import { SuccessReceiptModal, RepaymentReceiptData } from "@/components/repayment/SuccessReceiptModal"
import { Press_Start_2P } from "next/font/google"

const minecraft = Press_Start_2P({ 
  weight: "400", 
  subsets: ["latin"] 
})

const EXPLORER_BASE_URL = "https://sepolia.etherscan.io"

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Calculate total amount due including interest
function calculateAmountDue(invoice: Invoice): number {
  const principal = parseFloat(invoice.amount)
  // interestRate is stored as percentage (e.g., "5" for 5%)
  const interestRate = parseFloat(invoice.interestRate || "0")
  const interest = (principal * interestRate) / 100
  return principal + interest
}

export default function BigBuyerOutstandingPage() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { getReadContract: getInvoiceNFTContract, getWriteContract: getInvoiceNFTWriteContract } = useInvoiceNFT()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [repaying, setRepaying] = useState<number | null>(null)
  const [txStatus, setTxStatus] = useState<"idle" | "signing" | "pending" | "confirming">("idle")
  const { toast } = useToast()
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [receiptData, setReceiptData] = useState<RepaymentReceiptData | null>(null)

  const loadInvoices = useCallback(async () => {
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
  }, [address, isConnected, toast])

  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const handleRepay = async (invoice: Invoice) => {
    if (!walletClient || !address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }

    try {
      setRepaying(invoice.id)
      setTxStatus("signing")
      
      // Get the InvoiceNFT contract for reading invoice data
      const invoiceNFTRead = getInvoiceNFTContract()
      
      // Fetch invoice data from InvoiceNFT contract
      const invoiceData = await invoiceNFTRead.invoiceData(invoice.id)
      const invoiceAmount: bigint = invoiceData.amount
      
      // Check if already repaid
      if (invoiceData.repaid) {
        toast({
          title: "Already Repaid",
          description: "This invoice has already been repaid",
          variant: "destructive",
        })
        setRepaying(null)
        setTxStatus("idle")
        return
      }

      // Get write contract and repay via InvoiceNFT
      const invoiceNFTWrite = await getInvoiceNFTWriteContract()
      
      setTxStatus("signing")
      const tx = await invoiceNFTWrite.repayInvoice(invoice.id, { 
        value: invoiceAmount,
        gasLimit: 300000 
      })
      
      setTxStatus("pending")
      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      })

      setTxStatus("confirming")
      const receipt = await tx.wait()

      // Calculate amounts for receipt
      const totalPaidWei = invoiceAmount
      const totalPaid = ethers.formatEther(totalPaidWei)
      const principal = ethers.formatEther(invoiceAmount)
      
      // Get interest from invoice data (discountRate is in basis points)
      const interestRate = parseFloat(invoice.interestRate || "0")
      const principalNum = parseFloat(principal)
      const interestAmount = ((principalNum * interestRate) / 100).toString()
      
      // Fee calculation (5% protocol fee)
      const feeWei = (totalPaidWei * BigInt(500)) / BigInt(10000)
      const msmeAmountWei = totalPaidWei - feeWei
      
      const protocolFee = ethers.formatEther(feeWei)
      const amountToInvestors = ethers.formatEther(msmeAmountWei)

      // Prepare receipt data
      const receiptInfo: RepaymentReceiptData = {
        invoiceId: invoice.id,
        txHash: receipt.hash,
        totalAmountPaid: totalPaid,
        principalAmount: principal,
        interestAmount: interestAmount,
        amountToInvestors: amountToInvestors,
        protocolFee: protocolFee,
        msmeAddress: invoice.msme,
        explorerBaseUrl: EXPLORER_BASE_URL,
      }

      // Send notification (non-blocking)
      try {
        await fetch("/api/notifications/invoices/repaid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice.id,
            buyerAddress: address,
          }),
        })
      } catch (notificationError) {
        console.error("Invoice repaid notification error:", notificationError)
      }

      // Show success modal
      setReceiptData(receiptInfo)
      setShowSuccessModal(true)

    } catch (error: any) {
      console.error("Repay error:", error)
      
      let errorMessage = "Failed to repay invoice"
      if (error?.code === "ACTION_REJECTED" || error?.code === 4001) {
        errorMessage = "Transaction was rejected in your wallet"
      } else if (error?.reason) {
        errorMessage = error.reason
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRepaying(null)
      setTxStatus("idle")
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    setReceiptData(null)
    // Refresh invoices after modal closes
    loadInvoices()
  }

  // Calculate total outstanding with interest (only for FUNDED invoices - status 3)
  const totalOutstanding = invoices
    .filter((inv) => inv.status === 3)
    .reduce((sum, inv) => sum + calculateAmountDue(inv), 0)

  // Calculate total principal for all outstanding invoices
  const totalPrincipal = invoices.reduce(
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
    <>
      {/* Success Receipt Modal */}
      <SuccessReceiptModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        receiptData={receiptData}
      />

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
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Amount Due (With Interest)</p>
              <div className="text-3xl font-bold tracking-tighter text-white mt-2">{totalOutstanding.toFixed(4)} MATIC</div>
              <p className="text-xs text-neutral-500 mt-2">
                Principal: {totalPrincipal.toFixed(4)} MATIC
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
                Total due: {totalOutstanding.toFixed(4)} MATIC (Principal: {totalPrincipal.toFixed(4)} + Interest) across {invoices.filter(i => i.status === 3).length} funded {invoices.filter(i => i.status === 3).length === 1 ? "invoice" : "invoices"}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                ℹ️ A 5% protocol fee is automatically deducted and sent to the CGOV staking vault
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
                <div className="rounded-lg border border-orange-500/10 bg-white/[0.02] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-orange-500/20 hover:bg-white/[0.02]">
                        <TableHead className="text-orange-300">Invoice ID</TableHead>
                        <TableHead className="text-orange-300">MSME Address</TableHead>
                        <TableHead className="text-orange-300 text-right">Principal</TableHead>
                        <TableHead className="text-orange-300 text-right">Interest</TableHead>
                        <TableHead className="text-orange-300 text-right">Amount Due</TableHead>
                        <TableHead className="text-orange-300">Due Date</TableHead>
                        <TableHead className="text-orange-300 text-center">Status</TableHead>
                        <TableHead className="text-orange-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => {
                        const daysRemaining = calculateDaysRemaining(invoice.dueDate)
                        const statusLabel = getStatusLabel(invoice.status)
                        const isLate = daysRemaining < 0 && invoice.status === 3
                        const canRepay = invoice.status === 3
                        const principal = parseFloat(invoice.amount)
                        const interestRate = parseFloat(invoice.interestRate || "0")
                        const interest = (principal * interestRate) / 100
                        const amountDue = principal + interest
                        const isCurrentlyRepaying = repaying === invoice.id

                        return (
                          <TableRow
                            key={invoice.id}
                            className="border-b border-orange-500/10 hover:bg-white/[0.05] transition-colors"
                          >
                            <TableCell className="font-medium font-mono text-xs text-white">#{invoice.id}</TableCell>
                            <TableCell className="font-mono text-xs text-orange-200">{formatAddress(invoice.msme)}</TableCell>
                            <TableCell className="text-right text-white">
                              {principal.toFixed(4)} MATIC
                            </TableCell>
                            <TableCell className="text-right text-green-400">
                              +{interest.toFixed(4)} MATIC
                            </TableCell>
                            <TableCell className="text-right font-semibold text-white">
                              {amountDue.toFixed(4)} MATIC
                            </TableCell>
                            <TableCell className="text-orange-200">{invoice.dueDate.toLocaleDateString()}</TableCell>
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
                                  title="Opens the original invoice details"
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
                                    onClick={() => handleRepay(invoice)}
                                    disabled={isCurrentlyRepaying}
                                    className="bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)] min-w-[100px]"
                                  >
                                    {isCurrentlyRepaying ? (
                                      <>
                                        <Loader2 className="size-3 mr-1 animate-spin" />
                                        {txStatus === "signing" && "Sign..."}
                                        {txStatus === "pending" && "Pending..."}
                                        {txStatus === "confirming" && "Confirming..."}
                                        {txStatus === "idle" && "Processing..."}
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="size-3 mr-1" />
                                        Repay
                                      </>
                                    )}
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
    </>
  )
}