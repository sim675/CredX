"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Download, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const transactions = [
  { id: "0x3f8a...2c9d", type: "Invoice Funded", amount: 10625, date: "2024-12-20 10:45", status: "Completed" },
  { id: "0x7b2e...5a1c", type: "Withdrawal", amount: -5000, date: "2024-12-18 14:22", status: "Completed" },
  { id: "0x9d4c...8f3b", type: "Invoice Funded", amount: 7380, date: "2024-12-15 09:30", status: "Completed" },
  { id: "0x1a6f...4e2d", type: "Invoice Funded", amount: 13500, date: "2024-12-12 11:15", status: "Completed" },
  { id: "0x5c8b...7a9e", type: "Withdrawal", amount: -8000, date: "2024-12-10 16:40", status: "Completed" },
  { id: "0x2e7d...3b4f", type: "Invoice Funded", amount: 8820, date: "2024-12-08 13:25", status: "Completed" },
]

export default function MSMEWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
        <p className="text-muted-foreground">Manage your liquidity and transaction history</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Available funds for withdrawal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
              <p className="text-4xl font-bold">$22,450</p>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1">
                <Download className="size-4 mr-2" />
                Withdraw
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <ExternalLink className="size-4 mr-2" />
                View Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Connected Account</CardTitle>
            <CardDescription>Linked bank account for settlements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bank Account</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-2 rounded border border-border/50 flex-1">
                  HDFC Bank ****4521
                </code>
                <Button size="sm" variant="outline">
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <code className="text-xs bg-muted px-3 py-2 rounded border border-border/50 block">
                0x742d35Cc6634C0532925a3b844Bc9e7595f3f8a
              </code>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Update Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$46,085</div>
            <p className="text-xs text-muted-foreground mt-1">From active invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.15M</div>
            <p className="text-xs text-muted-foreground mt-1">To bank account</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Funding Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">From verification</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet activity and funding records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type.includes("Funded") ? "default" : "secondary"}>{tx.type}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${tx.amount > 0 ? "text-green-500" : ""}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{tx.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{tx.status}</Badge>
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
