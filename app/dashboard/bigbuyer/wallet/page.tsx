"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Download, Upload, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const transactions = [
  { id: "0x7a2f...8d4c", type: "Payment", amount: -45200, date: "2024-12-24 14:32", status: "Confirmed" },
  { id: "0x3b9e...2a1f", type: "Payment", amount: -31500, date: "2024-12-21 09:15", status: "Confirmed" },
  { id: "0x8c4d...7b3a", type: "Deposit", amount: 500000, date: "2024-12-20 11:22", status: "Confirmed" },
  { id: "0x1f6a...9e2b", type: "Payment", amount: -22800, date: "2024-12-18 16:45", status: "Confirmed" },
  { id: "0x5d8c...4a7f", type: "Payment", amount: -58000, date: "2024-12-14 10:30", status: "Confirmed" },
  { id: "0x2e9b...6c3d", type: "Payment", amount: -19400, date: "2024-12-11 13:18", status: "Confirmed" },
]

export default function BigBuyerWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet & Payments</h2>
        <p className="text-muted-foreground">Manage your payment wallet and transaction history</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Available funds for invoice payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
              <p className="text-4xl font-bold">$1,850,000</p>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1">
                <Upload className="size-4 mr-2" />
                Deposit
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="size-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Connected Wallet</CardTitle>
            <CardDescription>Blockchain wallet for payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-2 rounded border border-border/50 flex-1">0x742d...3f8a</code>
                <Button size="sm" variant="outline">
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Network</p>
              <Badge variant="secondary">Ethereum Mainnet</Badge>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Disconnect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid (All-Time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.8M</div>
            <p className="text-xs text-muted-foreground mt-1">234 transactions</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Outstanding Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$646K</div>
            <p className="text-xs text-muted-foreground mt-1">7 pending payments</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Transaction Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$54.7K</div>
            <p className="text-xs text-muted-foreground mt-1">Per invoice payment</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet activity and payment records</CardDescription>
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
                    <Badge variant={tx.type === "Deposit" ? "secondary" : "outline"}>{tx.type}</Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${tx.amount > 0 ? "text-green-500" : ""}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{tx.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">{tx.status}</Badge>
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
