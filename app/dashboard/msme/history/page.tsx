"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle } from "lucide-react"

const settledInvoices = [
  {
    id: "INV-2024-098",
    buyer: "Global Retail Corp",
    value: 14000,
    received: 12600,
    settlementDate: "2024-12-18",
    fees: 210,
    outcome: "On-time",
  },
  {
    id: "INV-2024-095",
    buyer: "TechFlow Systems",
    value: 9500,
    received: 8550,
    settlementDate: "2024-12-12",
    fees: 142.5,
    outcome: "On-time",
  },
  {
    id: "INV-2024-092",
    buyer: "Nexa Logistics",
    value: 18500,
    received: 16650,
    settlementDate: "2024-12-05",
    fees: 277.5,
    outcome: "On-time",
  },
  {
    id: "INV-2024-089",
    buyer: "Prime Manufacturing",
    value: 7200,
    received: 6480,
    settlementDate: "2024-11-28",
    fees: 108,
    outcome: "On-time",
  },
  {
    id: "INV-2024-086",
    buyer: "Metro Supplies Inc",
    value: 11000,
    received: 9900,
    settlementDate: "2024-11-22",
    fees: 165,
    outcome: "Late",
  },
  {
    id: "INV-2024-083",
    buyer: "Bright Electronics",
    value: 13400,
    received: 12060,
    settlementDate: "2024-11-15",
    fees: 201,
    outcome: "On-time",
  },
]

export default function MSMEHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settled History</h2>
        <p className="text-muted-foreground">Complete financial record of settled invoices</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invoices Settled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground mt-1">Since platform launch</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Liquidity Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime funding</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fees Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-muted-foreground mt-1">1.5% protocol fee</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On-Time Settlement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">94%</div>
            <p className="text-xs text-muted-foreground mt-1">92 of 98 on time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Settlement Records</CardTitle>
          <CardDescription>Historical transparency of completed invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead className="text-right">Invoice Value</TableHead>
                <TableHead className="text-right">Amount Received</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead className="text-right">Fees Paid</TableHead>
                <TableHead className="text-center">Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settledInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.buyer}</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${invoice.received.toLocaleString()}</TableCell>
                  <TableCell>{invoice.settlementDate}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${invoice.fees.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {invoice.outcome === "On-time" ? (
                        <>
                          <CheckCircle2 className="size-4 text-green-500" />
                          <Badge variant="secondary">{invoice.outcome}</Badge>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-4 text-amber-500" />
                          <Badge variant="outline">{invoice.outcome}</Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
