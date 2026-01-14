"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info, Loader2, UploadCloud, FileText, X, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { useRouter } from "next/navigation"
import InvoiceMarketplaceABI from "@/lib/contracts/InvoiceMarketplace.json"

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

      // 1. Prepare IPFS Data with ALL fields to avoid "Validation failed" error
      const ipfsFormData = new FormData()
      ipfsFormData.append("file", file)
      ipfsFormData.append("buyerAddress", formData.buyerAddress)
      ipfsFormData.append("amount", formData.amount)
      ipfsFormData.append("dueDate", formData.dueDate)
      ipfsFormData.append("discountRate", formData.discountRate)
      ipfsFormData.append("description", formData.metadataURI || `Invoice from ${formData.buyerAddress}`)
      
      const exclusiveInv = formData.visibility === "public" ? ethers.ZeroAddress : formData.exclusiveInvestor
      ipfsFormData.append("exclusiveInvestor", exclusiveInv)

      // 2. Upload to IPFS API
      const ipfsResponse = await fetch("/api/invoices/ipfs", { 
        method: "POST", 
        body: ipfsFormData 
      })
      
      const ipfsJson = await ipfsResponse.json()
      if (!ipfsResponse.ok) {
        throw new Error(ipfsJson.error || ipfsJson.details || "IPFS upload failed")
      }

      const metadataUri = ipfsJson.metadataUri

      // 3. Blockchain Transaction
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string
      
      const contract = new ethers.Contract(
        contractAddress,
        InvoiceMarketplaceABI.abi,
        signer
      )

      const discountRateBps = Math.floor(Number(formData.discountRate) * 100)

      setTxStatus("awaiting_signature")
      
      const tx = await contract.createInvoice(
        formData.buyerAddress,
        amountInWei,
        dueDateTimestamp,
        discountRateBps,
        metadataUri,
        exclusiveInv
      )

      setTxHash(tx.hash)
      setTxStatus("pending")
      await tx.wait()
      
      setTxStatus("success")
      toast({ title: "Success!", description: "Invoice tokenized successfully." })
      
      setTimeout(() => {
        router.refresh()
        router.push("/dashboard/msme/active")
      }, 3000)

    } catch (error: any) {
      console.error("Submission error:", error)
      setTxStatus("error")
      toast({ 
        title: "Error", 
        description: error.message || "An unexpected error occurred", 
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (txStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-primary/10 p-6 rounded-full">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Invoice Tokenized!</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Your invoice has been successfully recorded on the Polygon Amoy blockchain.
        </p>
        {txHash && (
          <Button variant="outline" asChild>
            <a href={`${AMOY_EXPLORER_BASE_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tokenize New Invoice</h1>
        <p className="text-muted-foreground">Convert your unpaid receivables into instant liquidity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label>Upload Invoice (PDF)</Label>
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:bg-muted/50"}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileInput} />
                    <UploadCloud className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile}><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={formData.visibility === "public" ? "default" : "outline"} onClick={() => setFormData(p => ({...p, visibility: "public"}))}>Public</Button>
                    <Button type="button" variant={formData.visibility === "private" ? "default" : "outline"} onClick={() => setFormData(p => ({...p, visibility: "private"}))}>Private</Button>
                  </div>
                </div>
                {formData.visibility === "private" && (
                  <div className="space-y-2">
                    <Label>Exclusive Investor Wallet</Label>
                    <Input name="exclusiveInvestor" value={formData.exclusiveInvestor} onChange={handleChange} placeholder="0x..." />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Buyer's Wallet Address</Label>
                <Input name="buyerAddress" value={formData.buyerAddress} onChange={handleChange} placeholder="0x..." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (MATIC)</Label>
                  <Input name="amount" type="number" step="any" value={formData.amount} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Discount Rate (%)</Label>
                  <Input name="discountRate" type="number" step="0.01" value={formData.discountRate} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <textarea name="metadataURI" value={formData.metadataURI} onChange={handleChange} className="w-full p-2 border rounded-md bg-transparent min-h-[80px]" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {txStatus === "ipfs" ? "Uploading to IPFS..." : "Confirming Transaction..."}
              </>
            ) : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  )
} 