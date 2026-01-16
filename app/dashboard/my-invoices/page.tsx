"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, FileText, Calendar, DollarSign, ExternalLink } from "lucide-react"
import { useInvoiceNFT } from "@/lib/contracts/useInvoiceNFT"

interface InvoiceMetadata {
  amount?: string
  dueDate?: string
  pdfLink?: string
  description?: string
  [key: string]: any
}

interface InvoiceNFT {
  tokenId: string
  tokenURI: string
  metadata?: InvoiceMetadata
}

export default function MyInvoicesPage() {
  const { address, isConnected } = useAccount()
  const { getReadContract } = useInvoiceNFT()
  const { toast } = useToast()

  const [invoices, setInvoices] = useState<InvoiceNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    const loadInvoices = async () => {
      try {
        setIsLoading(true)
        const nftContract = getReadContract()

        // Get balance
        const balance = await nftContract.balanceOf(address)
        const balanceNumber = Number(balance)

        if (balanceNumber === 0) {
          setInvoices([])
          setIsLoading(false)
          return
        }

        // Fetch all token IDs owned by the user
        const tokenPromises: Promise<InvoiceNFT | null>[] = []
        const maxTokensToCheck = 1000 

        for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
          tokenPromises.push(
            (async () => {
              try {
                const owner = await nftContract.ownerOf(tokenId)
                if (owner.toLowerCase() === address.toLowerCase()) {
                  const tokenURI = await nftContract.tokenURI(tokenId)
                  return { tokenId: tokenId.toString(), tokenURI }
                }
                return null
              } catch {
                return null
              }
            })()
          )
        }

        const results = await Promise.all(tokenPromises)
        const validInvoices = results.filter((inv): inv is InvoiceNFT => inv !== null)

        // Fetch metadata for each invoice
        const invoicesWithMetadata = await Promise.all(
          validInvoices.map(async (invoice) => {
            try {
              let metadata: InvoiceMetadata = {}
              
              let metadataUrl = invoice.tokenURI
              if (metadataUrl.startsWith("ipfs://")) {
                metadataUrl = `https://ipfs.io/ipfs/${metadataUrl.replace("ipfs://", "")}`
              }

              const response = await fetch(metadataUrl)
              if (response.ok) {
                metadata = await response.json()
              }
              
              return { ...invoice, metadata }
            } catch (error) {
              console.error(`Failed to fetch metadata for token ${invoice.tokenId}:`, error)
              return invoice
            }
          })
        )

        setInvoices(invoicesWithMetadata)
      } catch (error) {
        console.error("Failed to load invoices:", error)
        toast({
          title: "Error",
          description: "Failed to load your invoices",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [isConnected, address, getReadContract, toast])

  const formatDate = (timestamp: string | number | undefined) => {
    if (!timestamp) return "N/A"
    const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString()
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view your CINVOICE NFTs.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground">View your CINVOICE NFTs and associated invoice details.</p>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No invoices found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You don't have any invoice NFTs yet. Invoices are minted when you invest in invoice financing.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <Card key={invoice.tokenId} className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Invoice #{invoice.tokenId}</CardTitle>
                  <Badge variant="outline">CINVOICE</Badge>
                </div>
                <CardDescription>Token ID: {invoice.tokenId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.metadata ? (
                  <>
                    {invoice.metadata.amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-sm font-medium">{invoice.metadata.amount} MATIC</p>
                        </div>
                      </div>
                    )}
                    {invoice.metadata.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="text-sm font-medium">{formatDate(invoice.metadata.dueDate)}</p>
                        </div>
                      </div>
                    )}
                    {invoice.metadata.description && (
                      <p className="text-sm text-muted-foreground">{invoice.metadata.description}</p>
                    )}
                    {invoice.metadata.pdfLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (invoice.metadata?.pdfLink) {
                            window.open(invoice.metadata.pdfLink, "_blank");
                          }
                        }}
                      >
                        <ExternalLink className="size-4 mr-2" />
                        View PDF
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No metadata available</p>
                )}
                {invoice.tokenURI && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(invoice.tokenURI, "_blank")}
                  >
                    View Metadata Source
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}