"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, ExternalLink } from "lucide-react"

const activeInvoices = [
  {
    id: "INV-2025-001",
    buyer: "Global Retail Corp",
    value: 12500,
    funded: 10625,
    dueDate: "2025-02-20",
    daysRemaining: 55,
    status: "Active",
  },
  {
    id: "INV-2025-004",
    buyer: "TechFlow Systems",
    value: 8200,
    funded: 7380,
    dueDate: "2025-02-15",
    daysRemaining: 50,
    status: "Active",
  },
  {
    id: "INV-2025-006",
    buyer: "Nexa Logistics",
    value: 15000,
    funded: 13500,
    dueDate: "2025-02-28",
    daysRemaining: 63,
    status: "Active",
  },
  {
    id: "INV-2025-008",
    buyer: "Prime Manufacturing",
    value: 9800,
    funded: 8820,
    dueDate: "2025-02-10",
    daysRemaining: 45,
    status: "Active",
  },
  {
    id: "INV-2025-002",
    buyer: "Metro Supplies Inc",
    value: 6400,
    funded: 5760,
    dueDate: "2024-12-28",
    daysRemaining: -2,
    status: "Late",
  },
]

export default function MSMEActiveInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Invoices</h2>
        <p className="text-muted-foreground">Track invoices that are funded but not yet paid by buyers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Active Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$51,900</div>
            <p className="text-xs text-muted-foreground mt-1">5 invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Funded Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$46,085</div>
            <p className="text-xs text-muted-foreground mt-1">Received upfront</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Days to Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52 days</div>
            <p className="text-xs text-muted-foreground mt-1">Expected timeline</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Active Invoice Tracker</CardTitle>
          <CardDescription>Invoices awaiting payment from buyers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead className="text-right">Invoice Value</TableHead>
                <TableHead className="text-right">Funded Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Days Remaining</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.buyer}</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${invoice.funded.toLocaleString()}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-center">
                    <span className={invoice.daysRemaining < 0 ? "text-red-500 font-semibold" : ""}>
                      {invoice.daysRemaining}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={invoice.status === "Late" ? "destructive" : "default"}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Eye className="size-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="size-3" />
                      </Button>
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
