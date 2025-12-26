"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"

const settledInvestments = [
  { id: "INV-7815", principal: 4200, returnEarned: 189, settlementDate: "2024-12-22", roi: 4.5 },
  { id: "INV-7812", principal: 3500, returnEarned: 140, settlementDate: "2024-12-18", roi: 4.0 },
  { id: "INV-7809", principal: 5800, returnEarned: 319, settlementDate: "2024-12-15", roi: 5.5 },
  { id: "INV-7805", principal: 2900, returnEarned: 145, settlementDate: "2024-12-10", roi: 5.0 },
  { id: "INV-7802", principal: 4600, returnEarned: 207, settlementDate: "2024-12-05", roi: 4.5 },
  { id: "INV-7798", principal: 3100, returnEarned: 124, settlementDate: "2024-12-01", roi: 4.0 },
]

export default function InvestorReturnsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Returns</h2>
        <p className="text-muted-foreground">Track your financial performance and earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns Earned</CardTitle>
            <DollarSign className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$8,450</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6%</div>
            <p className="text-xs text-muted-foreground">Per invoice cycle</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Payment Penalties</CardTitle>
            <AlertCircle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$320</div>
            <p className="text-xs text-muted-foreground">Earned from delays</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Losses</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">No defaults recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Returns Summary</CardTitle>
            <CardDescription>Lifetime financial performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-accent/5">
              <div>
                <p className="text-sm text-muted-foreground">Total Principal Deployed</p>
                <p className="text-2xl font-bold">$184,200</p>
              </div>
              <TrendingUp className="size-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-accent/5">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns + Principal</p>
                <p className="text-2xl font-bold text-green-500">$192,650</p>
              </div>
              <DollarSign className="size-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-primary/5">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold text-primary">$8,450</p>
              </div>
              <CheckCircle2 className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Returns by risk tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Low Risk (Tier A)</span>
                </div>
                <span className="text-sm font-semibold">$3,200 (38%)</span>
              </div>
              <p className="text-xs text-muted-foreground ml-5">Avg ROI: 3.8%</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Medium Risk (Tier B)</span>
                </div>
                <span className="text-sm font-semibold">$3,850 (46%)</span>
              </div>
              <p className="text-xs text-muted-foreground ml-5">Avg ROI: 5.2%</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">High Risk (Tier C)</span>
                </div>
                <span className="text-sm font-semibold">$1,400 (16%)</span>
              </div>
              <p className="text-xs text-muted-foreground ml-5">Avg ROI: 7.8%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
          <CardDescription>Completed investments and returns earned</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Return Earned</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead className="text-right">ROI %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settledInvestments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">{investment.id}</TableCell>
                  <TableCell className="text-right">${investment.principal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold text-green-500">
                    +${investment.returnEarned.toLocaleString()}
                  </TableCell>
                  <TableCell>{investment.settlementDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{investment.roi}%</Badge>
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
