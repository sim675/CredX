"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Download, Upload, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const transactions = [
  { id: "0x9a4f...2e1c", type: "Return", amount: 4389, date: "2024-12-22 15:42", status: "Completed" },
  { id: "0x3b7d...8c2a", type: "Investment", amount: -3500, date: "2024-12-20 10:15", status: "Completed" },
  { id: "0x7e2c...5f9b", type: "Deposit", amount: 50000, date: "2024-12-18 09:30", status: "Completed" },
  { id: "0x1d8a...4b3e", type: "Return", amount: 3640, date: "2024-12-15 14:20", status: "Completed" },
  { id: "0x6c9f...7a2d", type: "Investment", amount: -5800, date: "2024-12-12 11:45", status: "Completed" },
  { id: "0x2a5e...9d1f", type: "Withdrawal", amount: -20000, date: "2024-12-10 16:30", status: "Completed" },
]

export default function InvestorWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
        <p className="text-muted-foreground">Manage your investment capital and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-primary" />
              Stablecoin Balance
            </CardTitle>
            <CardDescription>Available funds for investment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">USDC Balance</p>
              <p className="text-4xl font-bold">$125,000</p>
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
            <CardDescription>Blockchain wallet for transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-2 rounded border border-border/50 flex-1">0x9a4f...2e1c</code>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Capital Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$184,200</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime investments</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Withdrawable Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,000</div>
            <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Returns Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$8,450</div>
            <p className="text-xs text-muted-foreground mt-1">All-time profit</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$85,000</div>
            <p className="text-xs text-muted-foreground mt-1">To external wallet</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet activity and investment records</CardDescription>
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
                    <Badge
                      variant={
                        tx.type === "Return"
                          ? "default"
                          : tx.type === "Investment"
                            ? "secondary"
                            : tx.type === "Deposit"
                              ? "outline"
                              : "outline"
                      }
                    >
                      {tx.type}
                    </Badge>
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
