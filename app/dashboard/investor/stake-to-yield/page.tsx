"use client"

import { useEffect, useState, useCallback } from "react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  Loader2,
  Zap,
  DollarSign
} from "lucide-react"
import { useCredXUtilityToken } from "@/lib/contracts/useCredXUtilityToken"
import { useUtilityStaker } from "@/lib/contracts/useUtilityStaker"
import { useCGOV } from "@/lib/contracts/useCGOV"
import { useStakingRewards } from "@/lib/contracts/useStakingRewards"
import { UTILITY_STAKER_ADDRESS, STAKING_REWARDS_ADDRESS } from "@/lib/contracts/addresses"
import { cn } from "@/lib/utils"

type StepStatus = "pending" | "active" | "completed"

interface Step {
  id: string
  title: string
  description: string
  status: StepStatus
}

export default function StakeToYieldPage() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  // Contract hooks
  const { getReadContract: getUtilityTokenContract, getWriteContract: getUtilityTokenWriteContract } = useCredXUtilityToken()
  const { getReadContract: getUtilityStakerContract, getWriteContract: getUtilityStakerWriteContract } = useUtilityStaker()
  const { getReadContract: getCGOVContract, getWriteContract: getCGOVWriteContract } = useCGOV()
  const { getReadContract: getStakingRewardsContract, getWriteContract: getStakingRewardsWriteContract } = useStakingRewards()

  // Balances
  const [credxBalance, setCredxBalance] = useState<string>("0")
  const [credxStaked, setCredxStaked] = useState<string>("0")
  const [pendingCGOV, setPendingCGOV] = useState<string>("0")
  const [cgovBalance, setCgovBalance] = useState<string>("0")
  const [cgovStaked, setCgovStaked] = useState<string>("0")
  const [earnedMATIC, setEarnedMATIC] = useState<string>("0")

  // Allowances
  const [credxAllowance, setCredxAllowance] = useState<string>("0")
  const [cgovAllowance, setCgovAllowance] = useState<string>("0")

  // Input amounts
  const [credxStakeAmount, setCredxStakeAmount] = useState("")
  const [cgovStakeAmount, setCgovStakeAmount] = useState("")

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Active step for stepper UI
  const [activeStep, setActiveStep] = useState(0)

  const loadData = useCallback(async (showLoading: boolean = false) => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    try {
      if (showLoading) setIsLoading(true)

      const utilityToken = getUtilityTokenContract()
      const utilityStaker = getUtilityStakerContract()
      const cgov = getCGOVContract()
      const stakingRewards = getStakingRewardsContract()

      const [
        credxBal,
        credxStakedBal,
        cgovPending,
        credxAllow,
        cgovBal,
        cgovStakedBal,
        maticEarned,
        cgovAllow,
      ] = await Promise.all([
        utilityToken.balanceOf(address),
        utilityStaker.stakedBalance(address),
        utilityStaker.earned(address),
        utilityToken.allowance(address, UTILITY_STAKER_ADDRESS),
        cgov.balanceOf(address),
        stakingRewards.stakedBalance(address),
        stakingRewards.earned(address),
        cgov.allowance(address, STAKING_REWARDS_ADDRESS),
      ])

      setCredxBalance(ethers.formatEther(credxBal))
      setCredxStaked(ethers.formatEther(credxStakedBal))
      setPendingCGOV(ethers.formatEther(cgovPending))
      setCredxAllowance(ethers.formatEther(credxAllow))
      setCgovBalance(ethers.formatEther(cgovBal))
      setCgovStaked(ethers.formatEther(cgovStakedBal))
      setEarnedMATIC(ethers.formatEther(maticEarned))
      setCgovAllowance(ethers.formatEther(cgovAllow))

      // Determine active step based on state
      if (parseFloat(ethers.formatEther(cgovStakedBal)) > 0) {
        setActiveStep(4) // Earning MATIC
      } else if (parseFloat(ethers.formatEther(cgovBal)) > 0) {
        setActiveStep(3) // Ready to stake CGOV
      } else if (parseFloat(ethers.formatEther(cgovPending)) > 0 || parseFloat(ethers.formatEther(credxStakedBal)) > 0) {
        setActiveStep(2) // Has pending CGOV or staked CREDX
      } else if (parseFloat(ethers.formatEther(credxBal)) > 0) {
        setActiveStep(1) // Has CREDX, ready to stake
      } else {
        setActiveStep(0) // No CREDX - needs admin minting
      }
    } catch (error) {
      console.error("Failed to load staking data:", error)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [isConnected, address, getUtilityTokenContract, getUtilityStakerContract, getCGOVContract, getStakingRewardsContract])

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => loadData(false), 10000)
    return () => clearInterval(interval)
  }, [loadData])

  // Step A: Already have CREDX - display balance
  // Step B: Approve and stake CREDX
  const handleApproveCREDX = async () => {
    try {
      setIsApproving(true)
      const tokenContract = await getUtilityTokenWriteContract()
      const tx = await tokenContract.approve(UTILITY_STAKER_ADDRESS, ethers.MaxUint256)
      await tx.wait()
      toast({ title: "Success", description: "CREDX approved for staking" })
      await loadData(false)
    } catch (error: any) {
      console.error("Approval failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Approval failed", variant: "destructive" })
    } finally {
      setIsApproving(false)
    }
  }

  const handleStakeCREDX = async () => {
    if (!credxStakeAmount || parseFloat(credxStakeAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" })
      return
    }
    try {
      setIsStaking(true)
      const stakerContract = await getUtilityStakerWriteContract()
      const amount = ethers.parseEther(credxStakeAmount)
      const tx = await stakerContract.stake(amount)
      await tx.wait()
      toast({ title: "Success", description: `Staked ${credxStakeAmount} CREDX successfully` })
      setCredxStakeAmount("")
      await loadData(false)
    } catch (error: any) {
      console.error("Staking failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Staking failed", variant: "destructive" })
    } finally {
      setIsStaking(false)
    }
  }

  // Step C: Claim CGOV rewards
  const handleClaimCGOV = async () => {
    try {
      setIsClaiming(true)
      const stakerContract = await getUtilityStakerWriteContract()
      const tx = await stakerContract.claimRewards()
      await tx.wait()
      toast({ title: "Success", description: "CGOV rewards claimed successfully" })
      await loadData(false)
    } catch (error: any) {
      console.error("Claim failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Claim failed", variant: "destructive" })
    } finally {
      setIsClaiming(false)
    }
  }

  // Step D: Approve and stake CGOV
  const handleApproveCGOV = async () => {
    try {
      setIsApproving(true)
      const cgovContract = await getCGOVWriteContract()
      const tx = await cgovContract.approve(STAKING_REWARDS_ADDRESS, ethers.MaxUint256)
      await tx.wait()
      toast({ title: "Success", description: "CGOV approved for staking" })
      await loadData(false)
    } catch (error: any) {
      console.error("Approval failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Approval failed", variant: "destructive" })
    } finally {
      setIsApproving(false)
    }
  }

  const handleStakeCGOV = async () => {
    if (!cgovStakeAmount || parseFloat(cgovStakeAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" })
      return
    }
    try {
      setIsStaking(true)
      const stakingContract = await getStakingRewardsWriteContract()
      const amount = ethers.parseEther(cgovStakeAmount)
      const tx = await stakingContract.stake(amount)
      await tx.wait()
      toast({ title: "Success", description: `Staked ${cgovStakeAmount} CGOV successfully` })
      setCgovStakeAmount("")
      await loadData(false)
    } catch (error: any) {
      console.error("Staking failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Staking failed", variant: "destructive" })
    } finally {
      setIsStaking(false)
    }
  }

  // Earnings: Claim MATIC
  const handleClaimMATIC = async () => {
    try {
      setIsClaiming(true)
      const stakingContract = await getStakingRewardsWriteContract()
      const tx = await stakingContract.getReward()
      await tx.wait()
      toast({ title: "Success", description: "MATIC rewards claimed successfully" })
      await loadData(false)
    } catch (error: any) {
      console.error("Claim failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Claim failed", variant: "destructive" })
    } finally {
      setIsClaiming(false)
    }
  }

  const needsCREDXApproval = parseFloat(credxAllowance) < parseFloat(credxStakeAmount || "0")
  const needsCGOVApproval = parseFloat(cgovAllowance) < parseFloat(cgovStakeAmount || "0")

  const steps: Step[] = [
    {
      id: "credx-balance",
      title: "CREDX Balance",
      description: "Receive CREDX tokens from admin",
      status: parseFloat(credxBalance) > 0 || parseFloat(credxStaked) > 0 ? "completed" : activeStep === 0 ? "active" : "pending"
    },
    {
      id: "stake-credx",
      title: "Stake CREDX",
      description: "Stake CREDX in UtilityStaker",
      status: parseFloat(credxStaked) > 0 ? "completed" : activeStep === 1 ? "active" : "pending"
    },
    {
      id: "claim-cgov",
      title: "Claim CGOV",
      description: "Claim earned CGOV rewards",
      status: parseFloat(cgovBalance) > 0 || parseFloat(cgovStaked) > 0 ? "completed" : activeStep === 2 ? "active" : "pending"
    },
    {
      id: "stake-cgov",
      title: "Stake CGOV",
      description: "Stake CGOV for Real-Yield",
      status: parseFloat(cgovStaked) > 0 ? "completed" : activeStep === 3 ? "active" : "pending"
    },
    {
      id: "earn-matic",
      title: "Earn MATIC",
      description: "Receive 5% protocol fees",
      status: parseFloat(cgovStaked) > 0 ? "active" : "pending"
    }
  ]

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to access the Stake-to-Yield pipeline.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader>
                <Skeleton className="h-4 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stake-to-Yield Pipeline</h1>
        <p className="text-muted-foreground">
          Complete the staking journey to earn real yield from protocol fees.
        </p>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CREDX Balance</CardTitle>
            <Coins className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(credxBalance).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to stake</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CREDX Staked</CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(credxStaked).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Generating CGOV</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGOV Balance</CardTitle>
            <Coins className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(cgovBalance).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">
              Pending: {parseFloat(pendingCGOV).toFixed(4)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned MATIC</CardTitle>
            <DollarSign className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{parseFloat(earnedMATIC).toFixed(6)}</div>
            <p className="text-xs text-muted-foreground">Real yield from 5% fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Stepper Progress */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    step.status === "completed" && "bg-emerald-500 border-emerald-500",
                    step.status === "active" && "bg-primary/20 border-primary animate-pulse",
                    step.status === "pending" && "bg-muted border-muted-foreground/30"
                  )}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="size-5 text-white" />
                    ) : step.status === "active" ? (
                      <Zap className="size-5 text-primary" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className={cn(
                      "text-xs font-medium",
                      step.status === "completed" && "text-emerald-400",
                      step.status === "active" && "text-primary",
                      step.status === "pending" && "text-muted-foreground"
                    )}>{step.title}</p>
                    <p className="text-[10px] text-muted-foreground hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className={cn(
                    "size-5 mx-2",
                    steps[index + 1].status !== "pending" ? "text-emerald-500" : "text-muted-foreground/30"
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Step A: CREDX Balance */}
        <Card className={cn(
          "border-border/50",
          activeStep === 0 && "ring-2 ring-primary/50"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step A</Badge>
                CREDX Balance
              </CardTitle>
              {parseFloat(credxBalance) > 0 && <CheckCircle2 className="size-5 text-emerald-500" />}
            </div>
            <CardDescription>CREDX tokens minted by Admin to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{parseFloat(credxBalance).toFixed(2)} CREDX</div>
            {parseFloat(credxBalance) === 0 && parseFloat(credxStaked) === 0 && (
              <p className="text-sm text-amber-500">
                ⚠️ Contact the platform admin to receive CREDX tokens for staking.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Step B: Stake CREDX */}
        <Card className={cn(
          "border-border/50",
          activeStep === 1 && "ring-2 ring-primary/50"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step B</Badge>
                Stake CREDX
              </CardTitle>
              {parseFloat(credxStaked) > 0 && <CheckCircle2 className="size-5 text-emerald-500" />}
            </div>
            <CardDescription>Stake CREDX in UtilityStaker to generate CGOV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Stake</label>
              <Input
                type="number"
                placeholder="0.0"
                value={credxStakeAmount}
                onChange={(e) => setCredxStakeAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Available: {parseFloat(credxBalance).toFixed(2)} CREDX | Staked: {parseFloat(credxStaked).toFixed(2)} CREDX
              </p>
            </div>
            {needsCREDXApproval && parseFloat(credxStakeAmount) > 0 ? (
              <Button onClick={handleApproveCREDX} className="w-full" disabled={isApproving}>
                {isApproving ? <><Loader2 className="size-4 mr-2 animate-spin" />Approving...</> : "Approve CREDX"}
              </Button>
            ) : (
              <Button
                onClick={handleStakeCREDX}
                className="w-full"
                disabled={isStaking || !credxStakeAmount || parseFloat(credxStakeAmount) <= 0 || parseFloat(credxStakeAmount) > parseFloat(credxBalance)}
              >
                {isStaking ? <><Loader2 className="size-4 mr-2 animate-spin" />Staking...</> : "Stake CREDX"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step C: Claim CGOV */}
        <Card className={cn(
          "border-border/50",
          activeStep === 2 && "ring-2 ring-primary/50"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step C</Badge>
                Claim CGOV Rewards
              </CardTitle>
              {parseFloat(cgovBalance) > 0 && <CheckCircle2 className="size-5 text-emerald-500" />}
            </div>
            <CardDescription>Claim earned CGOV tokens from UtilityStaker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div>
                <p className="text-sm text-muted-foreground">Pending CGOV</p>
                <p className="text-2xl font-bold text-purple-400">{parseFloat(pendingCGOV).toFixed(6)}</p>
              </div>
              <Gift className="size-8 text-purple-500" />
            </div>
            <Button
              onClick={handleClaimCGOV}
              className="w-full"
              variant="outline"
              disabled={isClaiming || parseFloat(pendingCGOV) <= 0}
            >
              {isClaiming ? <><Loader2 className="size-4 mr-2 animate-spin" />Claiming...</> : "Claim CGOV"}
            </Button>
          </CardContent>
        </Card>

        {/* Step D: Stake CGOV */}
        <Card className={cn(
          "border-border/50",
          activeStep === 3 && "ring-2 ring-primary/50"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step D</Badge>
                Stake CGOV
              </CardTitle>
              {parseFloat(cgovStaked) > 0 && <CheckCircle2 className="size-5 text-emerald-500" />}
            </div>
            <CardDescription>Stake CGOV in StakingRewards for Real-Yield</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Stake</label>
              <Input
                type="number"
                placeholder="0.0"
                value={cgovStakeAmount}
                onChange={(e) => setCgovStakeAmount(e.target.value)}
                min="0"
                step="0.0001"
              />
              <p className="text-xs text-muted-foreground">
                Available: {parseFloat(cgovBalance).toFixed(4)} CGOV | Staked: {parseFloat(cgovStaked).toFixed(4)} CGOV
              </p>
            </div>
            {needsCGOVApproval && parseFloat(cgovStakeAmount) > 0 ? (
              <Button onClick={handleApproveCGOV} className="w-full" disabled={isApproving}>
                {isApproving ? <><Loader2 className="size-4 mr-2 animate-spin" />Approving...</> : "Approve CGOV"}
              </Button>
            ) : (
              <Button
                onClick={handleStakeCGOV}
                className="w-full"
                disabled={isStaking || !cgovStakeAmount || parseFloat(cgovStakeAmount) <= 0 || parseFloat(cgovStakeAmount) > parseFloat(cgovBalance)}
              >
                {isStaking ? <><Loader2 className="size-4 mr-2 animate-spin" />Staking...</> : "Stake CGOV → Start Earning"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings View */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-500" />
            Real-Yield Earnings
          </CardTitle>
          <CardDescription>
            Accumulated MATIC from 5% protocol fees on invoice repayments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your CGOV Staked</p>
              <p className="text-xl font-bold">{parseFloat(cgovStaked).toFixed(4)} CGOV</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Earned MATIC</p>
              <p className="text-3xl font-bold text-emerald-400">{parseFloat(earnedMATIC).toFixed(6)}</p>
            </div>
          </div>
          <Button
            onClick={handleClaimMATIC}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isClaiming || parseFloat(earnedMATIC) <= 0}
          >
            {isClaiming ? (
              <><Loader2 className="size-4 mr-2 animate-spin" />Claiming...</>
            ) : (
              <>Claim {parseFloat(earnedMATIC).toFixed(6)} MATIC</>
            )}
          </Button>
          {parseFloat(cgovStaked) === 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Complete Steps A-D above to start earning MATIC from protocol fees.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
