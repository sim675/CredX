import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, Clock, Wallet, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function MSMEDashboard() {
  const stats = [
    { label: "Total Invoices Issued", value: "12", icon: FileText, color: "text-blue-500" },
    { label: "Active Funding", value: "$45,200", icon: TrendingUp, color: "text-primary" },
    { label: "Pending Verification", value: "3", icon: Clock, color: "text-amber-500" },
    { label: "Available Payout", value: "$12,850", icon: Wallet, color: "text-emerald-500" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MSME Dashboard</h1>
          <p className="text-muted-foreground">Manage your invoices and liquidity status.</p>
        </div>
        <Link href="/dashboard/msme/tokenize">
          <Button className="gap-2">
            <PlusCircle className="size-4" /> Tokenize New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Active Invoices</CardTitle>
            <CardDescription>Track the status of your recently tokenized invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "INV-2025-001",
                  buyer: "Global Retail Corp",
                  amount: "$12,500",
                  status: "Funded",
                  date: "Dec 20, 2025",
                },
                {
                  id: "INV-2025-004",
                  buyer: "TechFlow Systems",
                  amount: "$8,200",
                  status: "Verified",
                  date: "Dec 24, 2025",
                },
                {
                  id: "INV-2025-009",
                  buyer: "Nexa Logistics",
                  amount: "$15,000",
                  status: "In Verification",
                  date: "Dec 25, 2025",
                },
              ].map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {invoice.id} - {invoice.buyer}
                    </p>
                    <p className="text-xs text-muted-foreground">Due: {invoice.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold">{invoice.amount}</p>
                    <Badge variant={invoice.status === "Funded" ? "default" : "secondary"}>{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Reputation Score</CardTitle>
            <CardDescription>Your creditworthiness on the protocol.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative size-32 mb-4">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="50.2"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold">842</span>
                <span className="text-[10px] text-muted-foreground">EXCELLENT</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> On-time Settlement
                </span>
                <span className="font-medium">98%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="size-3 text-primary" /> Risk Category
                </span>
                <span className="font-medium">Low (Tier A)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
