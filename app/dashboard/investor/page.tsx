import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, PieChart, ShieldCheck, ArrowUpRight, DollarSign } from "lucide-react"

export default function InvestorDashboard() {
  const portfolioStats = [
    { label: "Total Deployed", value: "$124,500", icon: DollarSign, color: "text-primary" },
    { label: "Active Investments", value: "24", icon: ShieldCheck, color: "text-emerald-500" },
    { label: "Weighted APY", value: "14.2%", icon: TrendingUp, color: "text-blue-500" },
    { label: "Expected Returns", value: "$8,420", icon: PieChart, color: "text-amber-500" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investor Overview</h1>
        <p className="text-muted-foreground">Manage your decentralized RWA portfolio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat) => (
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Yield realized over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-4">
            {/* Mock chart visualization using Tailwind */}
            {[45, 62, 58, 75, 90, 82, 95, 110, 105, 120, 135, 150].map((h, i) => (
              <div key={i} className="group relative flex-1">
                <div
                  className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm"
                  style={{ height: `${h}px` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border p-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap">
                  Day {i + 1}: ${h * 10}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Portfolio Risk Profile</CardTitle>
            <CardDescription>Allocation across risk tiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier A (Low Risk)</span>
                <span className="font-medium text-emerald-500">65%</span>
              </div>
              <Progress value={65} className="bg-emerald-500/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier B (Medium Risk)</span>
                <span className="font-medium text-amber-500">25%</span>
              </div>
              <Progress value={25} className="bg-amber-500/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tier C (High Risk)</span>
                <span className="font-medium text-primary">10%</span>
              </div>
              <Progress value={10} className="bg-primary/10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Investments</CardTitle>
            <CardDescription>Performance of your current RWA deployments.</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            View All <ArrowUpRight className="size-3" />
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="h-10 px-2 text-left font-medium">Invoice ID</th>
                  <th className="h-10 px-2 text-left font-medium">Entity</th>
                  <th className="h-10 px-2 text-left font-medium">Invested</th>
                  <th className="h-10 px-2 text-left font-medium">Est. APY</th>
                  <th className="h-10 px-2 text-left font-medium">Maturity</th>
                  <th className="h-10 px-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  {
                    id: "INV-8821",
                    name: "SolarTech Mfg",
                    amount: "$5,000",
                    apy: "12.5%",
                    days: "14",
                    status: "Healthy",
                  },
                  {
                    id: "INV-9243",
                    name: "Global Logistics",
                    amount: "$12,000",
                    apy: "14.8%",
                    days: "22",
                    status: "Healthy",
                  },
                  {
                    id: "INV-7732",
                    name: "BioPharma Solutions",
                    amount: "$2,500",
                    apy: "18.2%",
                    days: "4",
                    status: "Action Required",
                  },
                ].map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-mono text-xs">{inv.id}</td>
                    <td className="p-4">{inv.name}</td>
                    <td className="p-4 font-medium">{inv.amount}</td>
                    <td className="p-4 text-primary">{inv.apy}</td>
                    <td className="p-4 text-muted-foreground">{inv.days} days</td>
                    <td className="p-4 text-right">
                      <Badge variant={inv.status === "Healthy" ? "outline" : "destructive"}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
