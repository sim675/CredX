"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Clock, Landmark, TrendingUp } from "lucide-react"

const MARKETPLACE_INVOICES = [
  {
    id: "INV-2025-012",
    issuer: "Organic Foods Ltd",
    value: "$15,200",
    yield: "14.5% APY",
    duration: "45 Days",
    risk: "Tier A",
    buyerRating: "AAA",
    category: "FMCG",
  },
  {
    id: "INV-2025-015",
    issuer: "Quantum Chipsets",
    value: "$42,000",
    yield: "18.2% APY",
    duration: "60 Days",
    risk: "Tier B+",
    buyerRating: "AA",
    category: "Tech",
  },
  {
    id: "INV-2025-018",
    issuer: "Blue Water Shipping",
    value: "$8,500",
    yield: "12.8% APY",
    duration: "30 Days",
    risk: "Tier A",
    buyerRating: "A+",
    category: "Logistics",
  },
  {
    id: "INV-2025-022",
    issuer: "EcoPower Systems",
    value: "$24,000",
    yield: "16.5% APY",
    duration: "90 Days",
    risk: "Tier B",
    buyerRating: "A",
    category: "Energy",
  },
]

export default function InvoiceMarketplace() {
  return (
    <Suspense fallback={null}>
      <InvoiceMarketplaceContent />
    </Suspense>
  )
}

function InvoiceMarketplaceContent() {
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Marketplace</h1>
          <p className="text-muted-foreground">Discover and fund tokenized RWA invoices.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search issuers or ratings..."
              className="pl-9 w-[250px] bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {MARKETPLACE_INVOICES.map((invoice) => (
          <Card
            key={invoice.id}
            className="border-border/50 bg-card/50 hover:border-primary/50 transition-colors group"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{invoice.issuer}</CardTitle>
                  <CardDescription className="font-mono text-xs">{invoice.id}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {invoice.risk}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Landmark className="size-3" /> Face Value
                  </p>
                  <p className="text-xl font-bold">{invoice.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-primary mb-1 flex items-center gap-1">
                    <TrendingUp className="size-3" /> Yield
                  </p>
                  <p className="text-xl font-bold text-primary">{invoice.yield}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-[10px] uppercase">Duration</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {invoice.duration}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-[10px] uppercase">Buyer Rating</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">{invoice.buyerRating}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-[10px] uppercase">Industry</span>
                  <span>{invoice.category}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full group-hover:scale-[1.01] transition-transform">Fund Invoice</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
