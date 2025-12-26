"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

export default function BigBuyerReputationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reputation</h2>
        <p className="text-muted-foreground">Your on-chain payment reliability and trust score</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              Buyer Reliability Score
            </CardTitle>
            <CardDescription>Based on payment history and punctuality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-bold text-primary">A+</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Numeric Score</p>
                <p className="text-3xl font-bold">965</p>
                <p className="text-xs text-muted-foreground">out of 1000</p>
              </div>
            </div>
            <Progress value={96.5} className="h-3" />
            <p className="text-sm text-muted-foreground">You are in the top 5% of all buyers on the platform</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-500" />
              Reputation Trend
            </CardTitle>
            <CardDescription>Score progression over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: "Dec 2024", score: 965 },
                { month: "Nov 2024", score: 958 },
                { month: "Oct 2024", score: 951 },
                { month: "Sep 2024", score: 945 },
                { month: "Aug 2024", score: 940 },
                { month: "Jul 2024", score: 935 },
              ].map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.month}</span>
                  <div className="flex items-center gap-3">
                    <Progress value={(item.score / 1000) * 100} className="w-32 h-2" />
                    <span className="text-sm font-semibold w-10">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Payment %</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.5%</div>
            <p className="text-xs text-muted-foreground">211 of 219 on time</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Delay</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.8 days</div>
            <p className="text-xs text-muted-foreground">Across late payments</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Supported</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Total funded invoices</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MSMEs Served</CardTitle>
            <Award className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Unique businesses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Reputation Breakdown</CardTitle>
          <CardDescription>Factors contributing to your buyer score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Payment Punctuality</span>
              <span className="text-sm font-semibold">98/100</span>
            </div>
            <Progress value={98} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Payment Consistency</span>
              <span className="text-sm font-semibold">96/100</span>
            </div>
            <Progress value={96} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Transaction Volume</span>
              <span className="text-sm font-semibold">95/100</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Platform Tenure</span>
              <span className="text-sm font-semibold">92/100</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
