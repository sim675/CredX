"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Clock, Landmark, FileText, Wallet, ArrowRight, ExternalLink } from "lucide-react"
import {
  fetchAllInvoices,
  Invoice,
  getStatusLabel,
  calculateDaysRemaining,
  YieldRange,
  DurationRange,
} from "@/lib/invoice"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { InvoiceFilters } from "@/components/marketplace/InvoiceFilters"
import InvoiceCard from "@/components/marketplace/InvoiceCard"

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
  const { address, isConnected } = useAccount()
  const [publicInvoices, setPublicInvoices] = useState<Invoice[]>([])
  const [privateInvoices, setPrivateInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    yieldRanges: [],
    durationRanges: [],
    verifiedBuyer: false,
    sortBy: "yield"
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isConnected || !address) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const allInvoices = await fetchAllInvoices()
        // Status 2 == Fundraising in the new enum
        const fundraising = allInvoices.filter((inv) => inv.status === 2)

        const zeroAddress = "0x0000000000000000000000000000000000000000"
        const lowerAddress = address.toLowerCase()

        const publicList: Invoice[] = []
        const privateList: Invoice[] = []

        for (const inv of fundraising) {
          const exclusive = (inv.exclusiveInvestor || zeroAddress).toLowerCase()
          const isZero = exclusive === zeroAddress
          const isForInvestor = exclusive === lowerAddress

          if (isZero) {
            publicList.push(inv)
          } else if (isForInvestor) {
            privateList.push(inv)
          }
        }

        setPublicInvoices(publicList)
        setPrivateInvoices(privateList)
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

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const filterAndSort = (source: Invoice[]) => {
    let result = [...source]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(inv => 
        inv.id.toString().toLowerCase().includes(searchLower) ||
        inv.msme.toLowerCase().includes(searchLower) ||
        inv.buyer.toLowerCase().includes(searchLower)
      )
    }

    // Apply yield filter
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

    // Apply duration filter
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

    // Apply verified buyer filter
    if (filters.verifiedBuyer) {
      result = result.filter(inv => inv.buyerVerified)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'yield':
          return (parseFloat(b.interestRate) || 0) - (parseFloat(a.interestRate) || 0)
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'risk':
          // Assuming lower risk score is better
          return (a.riskScore || 0) - (b.riskScore || 0)
        default:
          return 0
      }
    })

    return result
  }

  const filteredPublicInvoices = useMemo(
    () => filterAndSort(publicInvoices),
    [publicInvoices, search, filters]
  )

  const filteredPrivateInvoices = useMemo(
    () => filterAndSort(privateInvoices),
    [privateInvoices, search, filters]
  )

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
            <Card key={i} className="border-border/50 hover:border-primary/50 transition-colors">
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
      ) : filteredPublicInvoices.length === 0 && filteredPrivateInvoices.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No public or private invoices available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {search
                ? "No invoices match your search criteria."
                : "There are currently no public or assigned private invoices available for investment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Public Invoices</h2>
              <Badge variant="outline">Open to all investors</Badge>
            </div>
            {filteredPublicInvoices.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-3">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-base font-medium">No public invoices available</h3>
                  <p className="text-xs text-muted-foreground text-center max-w-md">
                    There are currently no public invoices available for investment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {filteredPublicInvoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            )}
          </div>

          {filteredPrivateInvoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Private Invoices</h2>
                <Badge variant="destructive" className="text-xs">
                  Exclusive Deals
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {filteredPrivateInvoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
