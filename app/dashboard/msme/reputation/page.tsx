"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react"

export default function MSMEReputationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reputation</h2>
        <p className="text-muted-foreground">Your creditworthiness and platform standing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              MSME Credit Score
            </CardTitle>
            <CardDescription>Based on settlement history and buyer quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-bold text-primary">842</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="text-3xl font-bold">A</p>
                <p className="text-xs text-muted-foreground">Excellent</p>
              </div>
            </div>
            <Progress value={84.2} className="h-3" />
            <p className="text-sm text-muted-foreground">You are in the top 12% of all MSMEs on the platform</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-green-500" />
              Score Trend
            </CardTitle>
            <CardDescription>Reputation progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: "Dec 2024", score: 842 },
                { month: "Nov 2024", score: 830 },
                { month: "Oct 2024", score: 815 },
                { month: "Sep 2024", score: 805 },
                { month: "Aug 2024", score: 790 },
                { month: "Jul 2024", score: 780 },
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
            <CardTitle className="text-sm font-medium">On-Time Settlement Rate</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">92 of 98 on time</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Count</CardTitle>
            <AlertTriangle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No defaults recorded</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Buyer Quality</CardTitle>
            <Award className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A-</div>
            <p className="text-xs text-muted-foreground">High-rated buyers</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Success Ratio</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">98 of 100 funded</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Reputation Breakdown</CardTitle>
          <CardDescription>Key factors determining your MSME credit score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Settlement History</span>
              <span className="text-sm font-semibold">95/100</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Buyer Quality</span>
              <span className="text-sm font-semibold">88/100</span>
            </div>
            <Progress value={88} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Transaction Volume</span>
              <span className="text-sm font-semibold">82/100</span>
            </div>
            <Progress value={82} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Platform Activity</span>
              <span className="text-sm font-semibold">78/100</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
