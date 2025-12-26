"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2 } from "lucide-react"

const paymentHistory = [
  { id: "INV-7821", amount: 45200, paymentDate: "2024-12-24", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7820", amount: 31500, paymentDate: "2024-12-21", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7819", amount: 22800, paymentDate: "2024-12-18", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7818", amount: 58000, paymentDate: "2024-12-14", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7817", amount: 19400, paymentDate: "2024-12-11", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7816", amount: 76500, paymentDate: "2024-12-08", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7815", amount: 42100, paymentDate: "2024-12-05", paymentMethod: "USDC", status: "Completed" },
  { id: "INV-7814", amount: 91200, paymentDate: "2024-12-01", paymentMethod: "USDC", status: "Completed" },
]

export default function BigBuyerHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
        <p className="text-muted-foreground">Complete record of all invoice payments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payments Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground mt-1">Since platform launch</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.8M</div>
            <p className="text-xs text-muted-foreground mt-1">All-time transaction volume</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On-Time Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">96.5%</div>
            <p className="text-xs text-muted-foreground mt-1">211 of 219 on time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Last 8 completed invoice payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell className="text-right font-semibold">${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-500">
                      <CheckCircle2 className="size-4" />
                      <span className="text-sm">{payment.status}</span>
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
