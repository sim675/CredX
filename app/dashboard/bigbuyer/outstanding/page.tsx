"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, CreditCard } from "lucide-react"

const outstandingInvoices = [
  { id: "INV-7830", msme: "TechSupply Co.", amount: 125000, dueDate: "2025-01-15", daysRemaining: 19, status: "Due" },
  { id: "INV-7829", msme: "Global Parts Ltd.", amount: 87500, dueDate: "2025-01-20", daysRemaining: 24, status: "Due" },
  { id: "INV-7828", msme: "Metro Supplies", amount: 64200, dueDate: "2025-01-08", daysRemaining: 12, status: "Due" },
  {
    id: "INV-7827",
    msme: "Eagle Manufacturing",
    amount: 156000,
    dueDate: "2025-01-25",
    daysRemaining: 29,
    status: "Due",
  },
  { id: "INV-7826", msme: "Prime Logistics", amount: 43800, dueDate: "2024-12-28", daysRemaining: -2, status: "Late" },
  {
    id: "INV-7825",
    msme: "Bright Electronics",
    amount: 98000,
    dueDate: "2025-01-12",
    daysRemaining: 16,
    status: "Due",
  },
  { id: "INV-7824", msme: "Swift Transport", amount: 71500, dueDate: "2025-01-18", daysRemaining: 22, status: "Due" },
]

export default function BigBuyerOutstandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Outstanding Invoices</h2>
        <p className="text-muted-foreground">View and pay invoices owed to MSMEs</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Invoices Awaiting Payment</CardTitle>
          <CardDescription>Total outstanding: $646,000 across 7 invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>MSME Name</TableHead>
                <TableHead className="text-right">Invoice Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Days Remaining</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.msme}</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-center">
                    <span className={invoice.daysRemaining < 0 ? "text-red-500 font-semibold" : ""}>
                      {invoice.daysRemaining}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={invoice.status === "Late" ? "destructive" : "secondary"}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline">
                        <Eye className="size-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="default">
                        <CreditCard className="size-3 mr-1" />
                        Pay
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
