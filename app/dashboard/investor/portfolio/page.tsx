"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react"

const portfolioInvoices = [
  {
    id: "INV-7830",
    msme: "TechSupply Co.",
    buyer: "Global Retail Corp",
    invested: 3500,
    expectedReturn: 3675,
    dueDate: "2025-02-15",
    status: "Active",
  },
  {
    id: "INV-7828",
    msme: "Metro Supplies",
    buyer: "TechFlow Systems",
    invested: 2200,
    expectedReturn: 2310,
    dueDate: "2025-02-08",
    status: "Active",
  },
  {
    id: "INV-7825",
    msme: "Bright Electronics",
    buyer: "Nexa Logistics",
    invested: 5000,
    expectedReturn: 5250,
    dueDate: "2025-02-20",
    status: "Active",
  },
  {
    id: "INV-7822",
    msme: "Swift Transport",
    buyer: "Prime Manufacturing",
    invested: 3800,
    expectedReturn: 3990,
    dueDate: "2025-02-12",
    status: "Active",
  },
  {
    id: "INV-7820",
    msme: "Eagle Manufacturing",
    buyer: "Metro Supplies Inc",
    invested: 4500,
    expectedReturn: 4725,
    dueDate: "2024-12-28",
    status: "Late",
  },
  {
    id: "INV-7818",
    msme: "Prime Logistics",
    buyer: "Bright Electronics",
    invested: 2800,
    expectedReturn: 2940,
    dueDate: "2025-02-18",
    status: "Active",
  },
]

export default function InvestorPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Portfolio</h2>
        <p className="text-muted-foreground">Track your active capital and expected returns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capital Deployed</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,800</div>
            <p className="text-xs text-muted-foreground">6 active invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22,890</div>
            <p className="text-xs text-muted-foreground">+$1,090 profit</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted Avg APY</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4%</div>
            <p className="text-xs text-muted-foreground">Portfolio average</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Maturity</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48 days</div>
            <p className="text-xs text-muted-foreground">Expected timeline</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Active Investments</CardTitle>
          <CardDescription>Invoices you are currently funding</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>MSME Name</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead className="text-right">Invested Amount</TableHead>
                <TableHead className="text-right">Expected Return</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.msme}</TableCell>
                  <TableCell>{invoice.buyer}</TableCell>
                  <TableCell className="text-right font-semibold">${invoice.invested.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-500 font-semibold">
                    ${invoice.expectedReturn.toLocaleString()}
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={invoice.status === "Late" ? "destructive" : "default"}>{invoice.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Risk Allocation</CardTitle>
            <CardDescription>Portfolio distribution by risk tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Low Risk (Tier A)</span>
                </div>
                <span className="text-sm font-semibold">$12,300 (56%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "56%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">Medium Risk (Tier B)</span>
                </div>
                <span className="text-sm font-semibold">$7,000 (32%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "32%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">High Risk (Tier C)</span>
                </div>
                <span className="text-sm font-semibold">$2,500 (12%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: "12%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>MSME Diversification</CardTitle>
            <CardDescription>Capital spread across businesses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Bright Electronics", amount: 5000, percentage: 23 },
              { name: "Eagle Manufacturing", amount: 4500, percentage: 21 },
              { name: "Swift Transport", amount: 3800, percentage: 17 },
              { name: "TechSupply Co.", amount: 3500, percentage: 16 },
              { name: "Prime Logistics", amount: 2800, percentage: 13 },
              { name: "Metro Supplies", amount: 2200, percentage: 10 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-semibold">${item.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
