"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, Landmark, FileText, Wallet, ArrowRight, ExternalLink, Loader2 } from "lucide-react"
import { 
  fetchFundraisingInvoices, 
  Invoice, 
  getStatusLabel, 
  calculateDaysRemaining, 
  YieldRange, 
  DurationRange 
} from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { InvoiceFilters } from "@/components/marketplace/InvoiceFilters"

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

type SortOption = "yield" | "dueDate" | "risk"

interface FilterState {
  yieldRanges: YieldRange[]
  durationRanges: DurationRange[]
  verifiedBuyer: boolean
  sortBy: SortOption
}

export default function InvoiceMarketplace() {
  const { isConnected } = useAccount()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // PERSON A: State for transaction reliability
  const [pendingTxId, setPendingTxId] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<FilterState>({
    yieldRanges: [],
    durationRanges: [],
    verifiedBuyer: false,
    sortBy: "yield"
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true)
        const fundraisingInvoices = await fetchFundraisingInvoices()
        setInvoices(fundraisingInvoices)
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
  }, [toast])

  

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  //FIXED: Accepts string or number to prevent TS(2345)
  const handleInvestInitiation = (id: string | number) => {
    setPendingTxId(id.toString())
    toast({
      title: "Preparing Transaction",
      description: "Setting up your investment for Invoice #" + id,
    })
  }

  

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices]

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(inv => 
        inv.id.toString().toLowerCase().includes(searchLower) ||
        inv.msme.toLowerCase().includes(searchLower) ||
        inv.buyer.toLowerCase().includes(searchLower)
      )
    }

    if (filters.yieldRanges.length > 0) {
      result = result.filter(inv => {
        const yieldValue = parseFloat(inv.interestRate) || 0
        return filters.yieldRanges.some(range => {
          if (range === 'high') return yieldValue >= 15
          if (range === 'medium') return yieldValue >= 8 && yieldValue < 15
          if (range === 'low') return yieldValue < 8
          return true
        })
      })
    }

    if (filters.durationRanges.length > 0) {
      result = result.filter(inv => {
        const dueDate = new Date(inv.dueDate)
        const today = new Date()
        const daysToDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return filters.durationRanges.some(range => {
          if (range === 'short') return daysToDue < 30
          if (range === 'medium') return daysToDue >= 30 && daysToDue <= 60
          if (range === 'long') return daysToDue > 60
          return true
        })
      })
    }

    if (filters.verifiedBuyer) {
      result = result.filter(inv => inv.buyerVerified)
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'yield':
          return (parseFloat(b.interestRate) || 0) - (parseFloat(a.interestRate) || 0)
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'risk':
          return (a.riskScore || 0) - (b.riskScore || 0)
        default:
          return 0
      }
    })

    return result
  }, [invoices, search, filters])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view available invoices to invest in.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Marketplace</h1>
            <p className="text-muted-foreground">Discover and fund tokenized RWA invoices.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, MSME, or buyer..."
                className="pl-9 w-full md:w-[250px] bg-background/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <InvoiceFilters onFilterChange={handleFilterChange} />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedInvoices.length === 0 ? (
        <Card className="border-border/50 text-center py-12">
          <CardContent className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No invoices available</h3>
            <p className="text-sm text-muted-foreground">
              {search ? "No invoices match your search." : "Check back later for new opportunities."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredAndSortedInvoices.map((invoice) => {
            const daysRemaining = calculateDaysRemaining(invoice.dueDate)
            const fundingProgress = parseFloat(invoice.fundedAmount) / parseFloat(invoice.amount)
            const progressPercent = Math.min(fundingProgress * 100, 100)
            
            // FIXED: Ensuring comparison of string to string to solve TS(2367)
            const isThisPending = pendingTxId === invoice.id.toString()

            return (
              <Card
                key={invoice.id.toString()}
                className="border-border/50 bg-card/50 hover:border-primary/50 transition-colors group"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Invoice #{invoice.id}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        MSME: {formatAddress(invoice.msme)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Face Value</p>
                      <p className="text-lg font-bold">{parseFloat(invoice.amount).toFixed(2)} MATIC</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Yield</p>
                      <p className="text-lg font-bold text-green-500">
                        {parseFloat(invoice.interestRate || '0').toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Funded</p>
                      <p className="text-lg font-bold">{progressPercent.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Term</p>
                      <p className="text-lg font-bold">{daysRemaining}d</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Funding Progress</span>
                        <span>{progressPercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Buyer:</span>
                        <span>{formatAddress(invoice.buyer)}</span>
                        {invoice.buyerVerified && (
                          <Badge variant="outline" className="text-xs h-5 px-1.5">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <a href={`https://ipfs.io/ipfs/sample-invoice-${invoice.id}.pdf`} target="_blank" rel="noreferrer">
                        <FileText className="size-3.5 mr-2" />
                        View Original Invoice
                      </a>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors" 
                    disabled={isThisPending}
                    asChild={!isThisPending}
                    onClick={() => handleInvestInitiation(invoice.id)}
                  >
                    {isThisPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      <Link 
                        href={`/dashboard/investor/invest/${invoice.id}`} 
                        className="flex items-center justify-center gap-2"
                      >
                        Invest Now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}