"use client"

import { useEffect, useState, useCallback } from "react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, Coins, TrendingUp, LogOut, Gift, ArrowRight, Zap } from "lucide-react"
import { useCredXUtilityToken } from "@/lib/contracts/useCredXUtilityToken"
import { useUtilityStaker } from "@/lib/contracts/useUtilityStaker"
import { useCGOV } from "@/lib/contracts/useCGOV"
import { useStakingRewards } from "@/lib/contracts/useStakingRewards"
import { UTILITY_STAKER_ADDRESS, STAKING_REWARDS_ADDRESS } from "@/lib/contracts/addresses"

export default function GovernanceStakingPage() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  // Contract hooks
  const { getReadContract: getUtilityTokenContract, getWriteContract: getUtilityTokenWriteContract } = useCredXUtilityToken()
  const { getReadContract: getUtilityStakerContract, getWriteContract: getUtilityStakerWriteContract } = useUtilityStaker()
  const { getReadContract: getCGOVContract, getWriteContract: getCGOVWriteContract } = useCGOV()
  const { getReadContract: getStakingRewardsContract, getWriteContract: getStakingRewardsWriteContract } = useStakingRewards()

  // Tier 2 State (Utility Token -> CGOV)
  const [utilityBalance, setUtilityBalance] = useState<string>("0")
  const [utilityStaked, setUtilityStaked] = useState<string>("0")
  const [pendingCGOV, setPendingCGOV] = useState<string>("0")
  const [utilityAllowance, setUtilityAllowance] = useState<string>("0")
  const [utilityStakeAmount, setUtilityStakeAmount] = useState("")

  // Tier 3 State (CGOV -> MATIC)
  const [cgovBalance, setCgovBalance] = useState<string>("0")
  const [cgovStaked, setCgovStaked] = useState<string>("0")
  const [pendingMATIC, setPendingMATIC] = useState<string>("0")
  const [cgovAllowance, setCgovAllowance] = useState<string>("0")
  const [cgovStakeAmount, setCgovStakeAmount] = useState("")

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isApproving, setIsApproving] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading: boolean = false) => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    try {
      if (showLoading) setIsLoading(true)
      setError(null)

      const utilityToken = getUtilityTokenContract()
      const utilityStaker = getUtilityStakerContract()
      const cgov = getCGOVContract()
      const stakingRewards = getStakingRewardsContract()

      // Fetch all balances in parallel
      const [
        utilityBal,
        utilityStakedBal,
        cgovPending,
        utilityAllow,
        cgovBal,
        cgovStakedBal,
        maticPending,
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

      setUtilityBalance(ethers.formatEther(utilityBal))
      setUtilityStaked(ethers.formatEther(utilityStakedBal))
      setPendingCGOV(ethers.formatEther(cgovPending))
      setUtilityAllowance(ethers.formatEther(utilityAllow))
      setCgovBalance(ethers.formatEther(cgovBal))
      setCgovStaked(ethers.formatEther(cgovStakedBal))
      setPendingMATIC(ethers.formatEther(maticPending))
      setCgovAllowance(ethers.formatEther(cgovAllow))
    } catch (error) {
      console.error("Failed to load staking data:", error)
      setError("Failed to load staking data. Please try again later.")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [isConnected, address, getUtilityTokenContract, getUtilityStakerContract, getCGOVContract, getStakingRewardsContract])

  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => loadData(false), 10000)
    return () => clearInterval(interval)
  }, [loadData])

  // ===== TIER 2: Utility Token -> CGOV =====
  const handleApproveUtility = async () => {
    try {
      setIsApproving(true)
      const tokenContract = await getUtilityTokenWriteContract()
      const tx = await tokenContract.approve(UTILITY_STAKER_ADDRESS, ethers.MaxUint256)
      await tx.wait()

      toast({ title: "Success", description: "Utility Token approved for staking" })
      await loadData(false)
    } catch (error: any) {
      console.error("Approval failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Approval failed", variant: "destructive" })
    } finally {
      setIsApproving(false)
    }
  }

  const handleStakeUtility = async () => {
    if (!utilityStakeAmount || parseFloat(utilityStakeAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" })
      return
    }

    try {
      setIsStaking(true)
      const stakerContract = await getUtilityStakerWriteContract()
      const amount = ethers.parseEther(utilityStakeAmount)
      const tx = await stakerContract.stake(amount)
      await tx.wait()

      toast({ title: "Success", description: `Staked ${utilityStakeAmount} CREDX successfully` })
      setUtilityStakeAmount("")
      await loadData(false)
    } catch (error: any) {
      console.error("Staking failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Staking failed", variant: "destructive" })
    } finally {
      setIsStaking(false)
    }
  }

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

  const handleExitUtility = async () => {
    try {
      setIsExiting(true)
      const stakerContract = await getUtilityStakerWriteContract()
      const tx = await stakerContract.exit()
      await tx.wait()

      toast({ title: "Success", description: "Exited Utility staking pool" })
      await loadData(false)
    } catch (error: any) {
      console.error("Exit failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Exit failed", variant: "destructive" })
    } finally {
      setIsExiting(false)
    }
  }

  // ===== TIER 3: CGOV -> MATIC =====
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

  const handleExitCGOV = async () => {
    try {
      setIsExiting(true)
      const stakingContract = await getStakingRewardsWriteContract()
      const tx = await stakingContract.exit()
      await tx.wait()

      toast({ title: "Success", description: "Exited CGOV staking pool" })
      await loadData(false)
    } catch (error: any) {
      console.error("Exit failed:", error)
      toast({ title: "Error", description: error?.reason || error?.message || "Exit failed", variant: "destructive" })
    } finally {
      setIsExiting(false)
    }
  }

  // Check if approval is needed
  const needsUtilityApproval = parseFloat(utilityAllowance) < parseFloat(utilityStakeAmount || "0")
  const needsCGOVApproval = parseFloat(cgovAllowance) < parseFloat(cgovStakeAmount || "0")

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view and manage your staking positions.
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
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
        <h1 className="text-3xl font-bold tracking-tight">Governance & Staking</h1>
        <p className="text-muted-foreground">
          Stake tokens to earn rewards through the 3-tier Real-Yield system.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">{"There's a problem"}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CREDX Balance</CardTitle>
            <Coins className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(utilityBalance).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Utility Tokens</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CREDX Staked</CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(utilityStaked).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In Tier 2</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending CGOV</CardTitle>
            <Gift className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(pendingCGOV).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Claimable</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGOV Balance</CardTitle>
            <Coins className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(cgovBalance).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">Governance</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGOV Staked</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(cgovStaked).toFixed(4)}</div>
            <p className="text-xs text-muted-foreground">In Tier 3</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending MATIC</CardTitle>
            <Gift className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{parseFloat(pendingMATIC).toFixed(6)}</div>
            <p className="text-xs text-muted-foreground">Real Yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Flow Diagram */}
      <Card className="border-border/50 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-400">Tier 1</div>
              <div className="text-muted-foreground">CREDX</div>
            </div>
            <ArrowRight className="size-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-semibold text-purple-400">Tier 2</div>
              <div className="text-muted-foreground">CGOV</div>
            </div>
            <ArrowRight className="size-5 text-muted-foreground" />
            <div className="text-center">
              <div className="font-semibold text-emerald-400">Tier 3</div>
              <div className="text-muted-foreground">MATIC</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tier2" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tier2" className="flex items-center gap-2">
            <Zap className="size-4" />
            Tier 2: CREDX → CGOV
          </TabsTrigger>
          <TabsTrigger value="tier3" className="flex items-center gap-2">
            <Zap className="size-4" />
            Tier 3: CGOV → MATIC
          </TabsTrigger>
        </TabsList>

        {/* Tier 2: Utility Token -> CGOV */}
        <TabsContent value="tier2" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Stake CREDX Tokens</CardTitle>
                <CardDescription>Stake Utility Tokens to earn CGOV governance tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount to Stake</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={utilityStakeAmount}
                    onChange={(e) => setUtilityStakeAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: {parseFloat(utilityBalance).toFixed(2)} CREDX
                  </p>
                </div>
                {needsUtilityApproval && parseFloat(utilityStakeAmount) > 0 ? (
                  <Button onClick={handleApproveUtility} className="w-full" disabled={isApproving}>
                    {isApproving ? "Approving..." : "Approve CREDX"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStakeUtility}
                    className="w-full"
                    disabled={isStaking || !utilityStakeAmount || parseFloat(utilityStakeAmount) <= 0}
                  >
                    {isStaking ? "Staking..." : "Stake CREDX"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>CGOV Rewards & Exit</CardTitle>
                <CardDescription>Claim earned CGOV or exit the staking pool</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending CGOV</span>
                    <Badge variant="outline">{parseFloat(pendingCGOV).toFixed(6)} CGOV</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Staked CREDX</span>
                    <Badge variant="outline">{parseFloat(utilityStaked).toFixed(4)} CREDX</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClaimCGOV}
                    variant="outline"
                    className="flex-1"
                    disabled={isClaiming || parseFloat(pendingCGOV) <= 0}
                  >
                    {isClaiming ? "Claiming..." : "Claim CGOV"}
                  </Button>
                  <Button
                    onClick={handleExitUtility}
                    variant="destructive"
                    className="flex-1"
                    disabled={isExiting || parseFloat(utilityStaked) <= 0}
                  >
                    {isExiting ? "Exiting..." : <><LogOut className="size-4 mr-2" />Exit</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tier 3: CGOV -> MATIC */}
        <TabsContent value="tier3" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>Stake CGOV Tokens</CardTitle>
                <CardDescription>Stake CGOV to earn MATIC rewards from protocol fees</CardDescription>
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
                    Available: {parseFloat(cgovBalance).toFixed(4)} CGOV
                  </p>
                </div>
                {needsCGOVApproval && parseFloat(cgovStakeAmount) > 0 ? (
                  <Button onClick={handleApproveCGOV} className="w-full" disabled={isApproving}>
                    {isApproving ? "Approving..." : "Approve CGOV"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStakeCGOV}
                    className="w-full"
                    disabled={isStaking || !cgovStakeAmount || parseFloat(cgovStakeAmount) <= 0}
                  >
                    {isStaking ? "Staking..." : "Stake CGOV"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>MATIC Rewards & Exit</CardTitle>
                <CardDescription>Claim accumulated MATIC or exit the staking pool</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending MATIC</span>
                    <Badge variant="outline">{parseFloat(pendingMATIC).toFixed(6)} MATIC</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Staked CGOV</span>
                    <Badge variant="outline">{parseFloat(cgovStaked).toFixed(4)} CGOV</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClaimMATIC}
                    variant="outline"
                    className="flex-1"
                    disabled={isClaiming || parseFloat(pendingMATIC) <= 0}
                  >
                    {isClaiming ? "Claiming..." : "Claim MATIC"}
                  </Button>
                  <Button
                    onClick={handleExitCGOV}
                    variant="destructive"
                    className="flex-1"
                    disabled={isExiting || parseFloat(cgovStaked) <= 0}
                  >
                    {isExiting ? "Exiting..." : <><LogOut className="size-4 mr-2" />Exit</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}