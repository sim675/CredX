"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info, Loader2, UploadCloud, FileText, X, CheckCircle2, Wallet, Calendar, Percent, Coins, Eye, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { useRouter } from "next/navigation"
import InvoiceMarketplaceABI from "@/lib/contracts/InvoiceMarketplace.json"
import { addOrUpdatePendingInvoice, updatePendingInvoiceStatus, removePendingInvoice } from "@/lib/pendingInvoices"

// 1. Import the Rye font (Optional: assumes you want the western style here too based on context)
import { Rye } from 'next/font/google'

const rye = Rye({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap', 
})

type InvoiceFormState = {
  buyerAddress: string
  amount: string
  dueDate: string
  discountRate: string
  metadataURI: string
  visibility: "public" | "private"
  exclusiveInvestor: string
}

export default function TokenizeInvoice() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<
    | "idle"
    | "ipfs"
    | "awaiting_signature"
    | "pending"
    | "confirming"
    | "timeout"
    | "success"
    | "error"
  >("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const AMOY_EXPLORER_BASE_URL = "https://amoy.polygonscan.com"
  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<InvoiceFormState>({
    buyerAddress: "",
    amount: "",
    dueDate: "",
    discountRate: "",
    metadataURI: "",
    visibility: "public",
    exclusiveInvestor: "",
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
        setFormData(prev => ({ 
            ...prev, 
            metadataURI: prev.metadataURI || `Invoice: ${droppedFile.name}` 
        }))
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive"
        })
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files[0]) return
    const selectedFile = files[0]
    setFile(selectedFile)
    setFormData(prev => ({ 
        ...prev, 
        metadataURI: prev.metadataURI || `Invoice: ${selectedFile.name}` 
    }))
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({ title: "Missing Invoice", description: "Please upload the actual invoice PDF.", variant: "destructive" })
      return
    }

    if (!ethers.isAddress(formData.buyerAddress)) {
      toast({ title: "Invalid buyer address", description: "Please enter a valid wallet address.", variant: "destructive" })
      return
    }

    const amountInWei = ethers.parseEther(formData.amount || "0")
    if (amountInWei <= 0n) {
      toast({ title: "Invalid amount", description: "Amount must be greater than 0.", variant: "destructive" })
      return
    }

    const selectedDate = new Date(formData.dueDate)
    const dueDateTimestamp = Math.floor(selectedDate.getTime() / 1000)
    if (dueDateTimestamp <= Math.floor(Date.now() / 1000)) {
      toast({ title: "Invalid Date", description: "Due date must be in the future.", variant: "destructive" })
      return
    }

    try {
      setIsSubmitting(true)
      setTxStatus("ipfs")

      if (!(window as any).ethereum) {
        throw new Error("Wallet not found. Please install or unlock MetaMask (or a compatible wallet).")
      }

      const browserProvider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await browserProvider.getSigner()
      const msmeAddress = await signer.getAddress()

      // 1. Prepare IPFS Data
      const ipfsFormData = new FormData()
      ipfsFormData.append("file", file)
      ipfsFormData.append("buyerAddress", formData.buyerAddress)
      ipfsFormData.append("amount", formData.amount)
      ipfsFormData.append("dueDate", formData.dueDate)
      ipfsFormData.append("discountRate", formData.discountRate)
      ipfsFormData.append("description", formData.metadataURI || `Invoice from ${formData.buyerAddress}`)

      const exclusiveInv = formData.visibility === "public" ? ethers.ZeroAddress : formData.exclusiveInvestor
      ipfsFormData.append("exclusiveInvestor", exclusiveInv)
      ipfsFormData.append("msmeAddress", msmeAddress)

      // 2. Upload to IPFS API
      const ipfsResponse = await fetch("/api/invoices/ipfs", {
        method: "POST",
        body: ipfsFormData,
      })

      const ipfsJson = await ipfsResponse.json()
      if (!ipfsResponse.ok) {
        const message =
          (ipfsJson && typeof ipfsJson.error === "string" && ipfsJson.error) ||
          (ipfsJson && typeof ipfsJson.details === "string" && ipfsJson.details) ||
          "IPFS upload failed"
        throw new Error(message)
      }

      const metadataUri = ipfsJson.metadataUri

      // 3. Blockchain Transaction
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
      if (!contractAddress) {
        throw new Error("Contract address is not configured. Please contact support.")
      }

      const contract = new ethers.Contract(contractAddress, InvoiceMarketplaceABI.abi, signer)
      const discountRateBps = Math.floor(Number(formData.discountRate) * 100)

      setTxStatus("awaiting_signature")

      let tx
      try {
        tx = await contract.createInvoice(
          formData.buyerAddress,
          amountInWei,
          dueDateTimestamp,
          discountRateBps,
          metadataUri,
          exclusiveInv
        )
      } catch (txError: any) {
        if (txError?.code === "ACTION_REJECTED" || txError?.code === 4001) {
          throw new Error("You rejected the transaction in your wallet.")
        }
        throw txError
      }

      setTxHash(tx.hash)
      setTxStatus("pending")

      addOrUpdatePendingInvoice({
        txHash: tx.hash,
        msmeAddress,
        buyerAddress: formData.buyerAddress,
        amount: formData.amount,
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString(),
        status: "pending",
      })

      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology"
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl)

      setTxStatus("confirming")

      let receipt: any = null
      const timeoutMs = 180_000 
      const pollIntervalMs = 5_000
      const startTime = Date.now()

      try {
        while (!receipt && Date.now() - startTime < timeoutMs) {
          receipt = await rpcProvider.getTransactionReceipt(tx.hash)

          if (receipt) break
          await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
        }
      } catch (waitError: any) {
        console.error("Transaction wait error:", waitError)
        updatePendingInvoiceStatus(tx.hash, "timeout")
        setTxStatus("timeout")
        toast({
          title: "Network delay",
          description:
            "Your transaction is taking longer than usual to confirm. You can safely close this page and track it on the block explorer using the link below.",
        })
        return
      }

      if (!receipt) {
        updatePendingInvoiceStatus(tx.hash, "timeout")
        setTxStatus("timeout")
        toast({
          title: "Network delay",
          description:
            "We could not confirm the transaction in time. Please check the transaction status in the explorer.",
        })
        return
      }

      const statusValue = (receipt as any).status
      const isSuccess = statusValue === 1 || statusValue === 1n

      if (!isSuccess) {
        updatePendingInvoiceStatus(tx.hash, "failed")
        setTxStatus("error")
        toast({
          title: "Transaction failed on-chain",
          description: "The transaction was mined but failed. Please check the explorer for full details.",
          variant: "destructive",
        })
        return
      }

      let invoiceId: number | null = null
      try {
        const iface = new ethers.Interface(InvoiceMarketplaceABI.abi as any)
        for (const log of receipt.logs ?? []) {
          try {
            const parsed = iface.parseLog(log)
            if (parsed?.name === "InvoiceCreated") {
              const rawId = parsed.args?.id as bigint | number
              invoiceId = typeof rawId === "bigint" ? Number(rawId) : Number(rawId)
              break
            }
          } catch {
            // Ignore
          }
        }
      } catch (parseError) {
        console.error("Error decoding InvoiceCreated event:", parseError)
      }

      if (invoiceId == null) {
        try {
          const nextId = await contract.nextInvoiceId()
          invoiceId = Number(nextId)
        } catch (idError) {
          console.error("Failed to read nextInvoiceId", idError)
        }
      }

      try {
        if (invoiceId != null) {
          await fetch("/api/notifications/invoices/created", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              invoiceId,
              msmeAddress,
              buyerAddress: formData.buyerAddress,
              amount: formData.amount,
              dueDate: formData.dueDate,
              discountRate: formData.discountRate,
            }),
          })
        }
      } catch (notificationError) {
        console.error("Invoice created notification error:", notificationError)
      }

      removePendingInvoice(tx.hash)

      setTxStatus("success")
      toast({ title: "Success!", description: "Invoice tokenized successfully." })

      setTimeout(() => {
        router.refresh()
        router.push("/dashboard/msme/active")
      }, 3000)

    } catch (error: any) {
      console.error("Submission error:", error)
      setTxStatus("error")
      let description = "An unexpected error occurred"
      if (error?.message) {
        description = error.message
      }
      toast({ 
        title: "Error", 
        description, 
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Success State UI ---
  if (txStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-300 relative z-10">
        <div className="absolute top-10 left-10 -z-10 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="bg-primary/20 border border-primary/50 p-6 rounded-full backdrop-blur-md">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Invoice Tokenized!</h1>
        <p className="text-white/60 text-center max-w-sm">
          Your invoice has been successfully recorded on the Polygon Amoy blockchain.
        </p>
        {txHash && (
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" asChild>
            <a href={`${AMOY_EXPLORER_BASE_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 pb-20">
      
      {/* Decorative Blur Background */}
      <div className="absolute top-10 left-10 -z-10 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 -z-10 w-[300px] h-[300px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* FIXED: Added 'items-center', 'text-center' to align header text to the center 
        relative to the card below. Also applied rye font.
      */}
      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <h1 className={`text-5xl font-bold tracking-tight text-white drop-shadow-sm uppercase ${rye.className}`}>
            Tokenize Invoice
        </h1>
        <p className="text-muted-foreground text-lg">Convert your unpaid receivables into instant on-chain liquidity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          
          {/* GLASSMORPHISM CARD */}
          <Card className="backdrop-blur-xl border-white/10 bg-[#121212]/80 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-600 opacity-80" />
            
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Invoice Details
              </CardTitle>
              <CardDescription className="text-white/50">
                Enter the details exactly as they appear on your physical invoice.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
              
              {/* --- IPFS File Uploader Section --- */}
              <div className="space-y-3">
                <Label className="text-white/90 text-sm font-medium">Upload Invoice (PDF)</Label>
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
                      flex flex-col items-center justify-center gap-3
                      group
                      ${isDragging 
                        ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(255,122,24,0.2)]" 
                        : "border-white/10 bg-black/20 hover:bg-white/5 hover:border-primary/50"}
                    `}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={handleFileInput}
                    />
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/50">
                        <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-white/80 group-hover:text-white">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF only (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-primary/5 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/20 text-primary border border-primary/20">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{file.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={removeFile}
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-full h-10 w-10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* --- Visibility Section (Styled for Glassmorphism) --- */}
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Visibility</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant={formData.visibility === "public" ? "default" : "outline"} 
                        onClick={() => setFormData(p => ({...p, visibility: "public"}))}
                        className={formData.visibility === "public" 
                            ? "bg-primary text-white hover:bg-primary/90 flex-1" 
                            : "bg-transparent border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 flex-1"
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" /> Public
                      </Button>
                      <Button 
                        type="button" 
                        variant={formData.visibility === "private" ? "default" : "outline"} 
                        onClick={() => setFormData(p => ({...p, visibility: "private"}))}
                        className={formData.visibility === "private" 
                            ? "bg-primary text-white hover:bg-primary/90 flex-1" 
                            : "bg-transparent border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 flex-1"
                        }
                      >
                         <Lock className="w-4 h-4 mr-2" /> Private
                      </Button>
                    </div>
                 </div>

                 {formData.visibility === "private" && (
                    <div className="space-y-2 group">
                        <Label htmlFor="exclusiveInvestor" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Exclusive Investor Wallet</Label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                id="exclusiveInvestor"
                                name="exclusiveInvestor" 
                                value={formData.exclusiveInvestor} 
                                onChange={handleChange} 
                                placeholder="0x..." 
                                className="pl-10 font-mono bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 h-11"
                            />
                        </div>
                    </div>
                 )}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                   <div className="space-y-2 group">
                    <Label htmlFor="buyerAddress" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Buyer's Wallet Address</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="buyerAddress" 
                        name="buyerAddress"
                        value={formData.buyerAddress}
                        onChange={handleChange}
                        placeholder="0x..." 
                        required 
                        className="pl-10 font-mono bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="dueDate" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Due Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="dueDate" 
                        name="dueDate"
                        type="date" 
                        value={formData.dueDate}
                        onChange={handleChange}
                        required 
                        className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 h-11 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <Label htmlFor="amount" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Amount (MATIC)</Label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="amount" 
                        name="amount"
                        type="number" 
                        step="any"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="1000.00" 
                        required 
                        className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 h-11 font-bold tracking-wide"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="discountRate" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Discount Rate (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        id="discountRate" 
                        name="discountRate"
                        type="number" 
                        step="0.01"
                        value={formData.discountRate}
                        onChange={handleChange}
                        placeholder="5.0" 
                        required 
                        className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/30 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadataURI" className="text-xs uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                <textarea
                  id="metadataURI"
                  name="metadataURI"
                  value={formData.metadataURI}
                  onChange={handleChange}
                  placeholder="Add a description or reference for this invoice"
                  className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-4 items-start backdrop-blur-sm">
                <Info className="size-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1 text-blue-200">Important Information</p>
                  <ul className="text-xs text-blue-200/60 space-y-1 list-disc pl-4 marker:text-blue-500">
                    <li>By creating this invoice, you agree to list it on the public marketplace.</li>
                    <li>Once funded, the buyer will have until the due date to repay the full amount.</li>
                    <li>Early repayments will include the specified discount rate.</li>
                    <li>A 1.5% protocol fee will be deducted from the funded amount.</li>
                  </ul>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 items-end mt-4">
            <div className="flex justify-end gap-4 w-full md:w-auto">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white w-full md:w-32 h-12"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-48 h-12 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/20 text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {txStatus === "ipfs" ? "Uploading..." : "Processing..."}
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
            </div>
            
            {(isSubmitting || txStatus === "pending" || txStatus === "confirming" || txStatus === "awaiting_signature") && (
              <div className="w-full md:w-auto p-3 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
                <p className="text-xs text-muted-foreground text-center md:text-right flex items-center justify-end gap-2">
                  {txStatus === "ipfs" && <> <UploadCloud className="w-3 h-3 animate-bounce"/> Uploading to IPFS...</>}
                  {txStatus === "awaiting_signature" && "Check your wallet to sign the transaction."}
                  {txStatus === "pending" && "Transaction submitted. Waiting for blockchain confirmation..."}
                  {txStatus === "confirming" && "Finalizing on network..."}
                  {txStatus === "timeout" && (
                    <span className="text-orange-400">Taking longer than usual. Check explorer.</span>
                  )}
                  {txHash && (
                    <a
                      href={`${AMOY_EXPLORER_BASE_URL}/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 underline text-primary hover:text-primary/80"
                    >
                      View TX
                    </a>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}