"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, Coins, TrendingUp, LogOut, Gift } from "lucide-react"
import { useGovernanceToken } from "@/lib/contracts/useGovernanceToken"
import { useStakingRewards } from "@/lib/contracts/useStakingRewards"
import { STAKING_REWARDS_ADDRESS } from "@/lib/contracts/addresses"

export default function GovernanceStakingPage() {
  const { address, isConnected } = useAccount()
  const { getReadContract: getTokenContract, getWriteContract: getTokenWriteContract, tokenAddress } = useGovernanceToken()
  const { getReadContract: getStakingContract, getWriteContract: getStakingWriteContract } = useStakingRewards()
  const { toast } = useToast()

  const [cgovBalance, setCgovBalance] = useState<string>("0")
  const [stakedBalance, setStakedBalance] = useState<string>("0")
  const [pendingRewards, setPendingRewards] = useState<string>("0")
  const [allowance, setAllowance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(true)
  const [isStaking, setIsStaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [stakeAmount, setStakeAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address || !tokenAddress) {
      setIsLoading(false)
      return
    }

    const loadData = async (showLoading: boolean = false) => {
      try {
        if (showLoading) {
          setIsLoading(true)
        }
        setError(null)
        const tokenContractInstance = getTokenContract()
        const stakingContractInstance = getStakingContract()

        // Fetch balances
        const [balance, staked, rewards, tokenAllowance] = await Promise.all([
          tokenContractInstance.balanceOf(address),
          stakingContractInstance.balances(address),
          stakingContractInstance.earned(address),
          tokenContractInstance.allowance(address, STAKING_REWARDS_ADDRESS),
        ])

        setCgovBalance(ethers.formatEther(balance))
        setStakedBalance(ethers.formatEther(staked))
        setPendingRewards(ethers.formatEther(rewards))
        setAllowance(ethers.formatEther(tokenAllowance))
      } catch (error) {
        console.error("Failed to load staking data:", error)
        setError("Failed to load staking data. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load staking data",
          variant: "destructive",
        })
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    }

    loadData(true)
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadData(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [isConnected, address, tokenAddress, getTokenContract, getStakingContract, toast])

  const handleApprove = async () => {
    if (!address || !tokenAddress) return

    try {
      const tokenWriteContract = await getTokenWriteContract()
      const tx = await tokenWriteContract.approve(STAKING_REWARDS_ADDRESS, ethers.MaxUint256)
      await tx.wait()

      toast({
        title: "Success",
        description: "Approval successful",
      })

      // Reload data using read contract
      const tokenReadContract = getTokenContract()
      const newAllowance = await tokenReadContract.allowance(address, STAKING_REWARDS_ADDRESS)
      setAllowance(ethers.formatEther(newAllowance))
    } catch (error: any) {
      console.error("Approval failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to approve tokens",
        variant: "destructive",
      })
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      })
      return
    }

    try {
      setIsStaking(true)
      const tokenWriteContract = await getTokenWriteContract()
      const stakingWriteContract = await getStakingWriteContract()

      const amount = ethers.parseEther(stakeAmount)

      // Check if approval is needed
      const currentAllowance = await tokenWriteContract.allowance(address!, STAKING_REWARDS_ADDRESS)
      if (currentAllowance < amount) {
        toast({
          title: "Approval Needed",
          description: "Please approve tokens first",
          variant: "destructive",
        })
        setIsStaking(false)
        return
      }

      const tx = await stakingWriteContract.stake(amount)
      await tx.wait()

      toast({
        title: "Success",
        description: `Staked ${stakeAmount} CGOV successfully`,
      })

      setStakeAmount("")
      // Reload data
      const [staked, balance] = await Promise.all([
        stakingWriteContract.balances(address!),
        tokenWriteContract.balanceOf(address!),
      ])
      setStakedBalance(ethers.formatEther(staked))
      setCgovBalance(ethers.formatEther(balance))
    } catch (error: any) {
      console.error("Staking failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to stake tokens",
        variant: "destructive",
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true)
      const stakingWriteContract = await getStakingWriteContract()
      const tx = await stakingWriteContract.getReward()
      await tx.wait()

      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      })

      // Reload data
      const [rewards, balance] = await Promise.all([
        stakingWriteContract.earned(address!),
        getTokenContract().balanceOf(address!),
      ])
      setPendingRewards(ethers.formatEther(rewards))
      setCgovBalance(ethers.formatEther(balance))
    } catch (error: any) {
      console.error("Claim failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to claim rewards",
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const handleExit = async () => {
    try {
      setIsExiting(true)
      const stakingWriteContract = await getStakingWriteContract()
      const tx = await stakingWriteContract.exit()
      await tx.wait()

      toast({
        title: "Success",
        description: "Exited staking pool successfully",
      })

      // Reload data
      const [staked, rewards, balance] = await Promise.all([
        stakingWriteContract.balances(address!),
        stakingWriteContract.earned(address!),
        getTokenContract().balanceOf(address!),
      ])
      setStakedBalance(ethers.formatEther(staked))
      setPendingRewards(ethers.formatEther(rewards))
      setCgovBalance(ethers.formatEther(balance))
    } catch (error: any) {
      console.error("Exit failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to exit staking pool",
        variant: "destructive",
      })
    } finally {
      setIsExiting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to view and manage your governance tokens and staking rewards.
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
          {[...Array(3)].map((_, i) => (
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

  const needsApproval = parseFloat(allowance) < parseFloat(stakeAmount || "0")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Governance & Staking</h1>
        <p className="text-muted-foreground">Stake CGOV tokens to earn MATIC rewards and participate in governance.</p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">{"There's a problem"}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGOV Balance</CardTitle>
            <Coins className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(cgovBalance).toFixed(4)} CGOV</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked Amount</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stakedBalance).toFixed(4)} CGOV</div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Gift className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(pendingRewards).toFixed(6)} MATIC</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Stake CGOV Tokens</CardTitle>
            <CardDescription>Stake your CGOV tokens to earn MATIC rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Stake</label>
              <Input
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="0"
                step="0.0001"
              />
              <p className="text-xs text-muted-foreground">
                Available: {parseFloat(cgovBalance).toFixed(4)} CGOV
              </p>
            </div>
            {needsApproval && parseFloat(stakeAmount) > 0 ? (
              <Button onClick={handleApprove} className="w-full" disabled={isStaking}>
                Approve CGOV
              </Button>
            ) : (
              <Button
                onClick={handleStake}
                className="w-full"
                disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
              >
                {isStaking ? "Staking..." : "Stake CGOV"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Rewards & Exit</CardTitle>
            <CardDescription>Claim your rewards or exit the staking pool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Rewards</span>
                <Badge variant="outline">{parseFloat(pendingRewards).toFixed(6)} MATIC</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Staked Amount</span>
                <Badge variant="outline">{parseFloat(stakedBalance).toFixed(4)} CGOV</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleClaimRewards}
                variant="outline"
                className="flex-1"
                disabled={isClaiming || parseFloat(pendingRewards) <= 0}
              >
                {isClaiming ? "Claiming..." : "Claim Rewards"}
              </Button>
              <Button
                onClick={handleExit}
                variant="destructive"
                className="flex-1"
                disabled={isExiting || parseFloat(stakedBalance) <= 0}
              >
                {isExiting ? "Exiting..." : <><LogOut className="size-4 mr-2" />Exit</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}