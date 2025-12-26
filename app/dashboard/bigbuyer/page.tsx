"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Clock, TrendingUp, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function BigBuyerOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Monitor your payment obligations and reputation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices Received</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">From 45 MSMEs</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">Across 23 invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments (30d)</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850K</div>
            <p className="text-xs text-muted-foreground">12 invoices due</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Payment Rate</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-muted-foreground">211 of 219 paid on time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Buyer Reputation Score</CardTitle>
            <CardDescription>Your on-chain payment reliability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-5xl font-bold text-primary">A+</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">965</p>
              </div>
            </div>
            <Progress value={96.5} className="h-2" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm text-muted-foreground">On-Time %</p>
                <p className="text-lg font-semibold">96.5%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Delay</p>
                <p className="text-lg font-semibold">0.8 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Payment Activity</CardTitle>
            <CardDescription>Last 5 invoice payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "INV-7821", msme: "TechSupply Co.", amount: "$45,200", date: "2 days ago", status: "On-Time" },
                { id: "INV-7820", msme: "Global Parts Ltd.", amount: "$31,500", date: "5 days ago", status: "On-Time" },
                { id: "INV-7819", msme: "Metro Supplies", amount: "$22,800", date: "8 days ago", status: "On-Time" },
                {
                  id: "INV-7818",
                  msme: "Eagle Manufacturing",
                  amount: "$58,000",
                  date: "12 days ago",
                  status: "On-Time",
                },
                { id: "INV-7817", msme: "Prime Logistics", amount: "$19,400", date: "15 days ago", status: "On-Time" },
              ].map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{payment.msme}</p>
                    <p className="text-xs text-muted-foreground">{payment.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{payment.amount}</p>
                    <p className="text-xs text-green-500">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
