"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Shield, Pause, Play, Coins, Settings } from "lucide-react"
import { useInvoiceContract } from "@/lib/contracts/useInvoiceContract"
import { useGovernanceToken } from "@/lib/contracts/useGovernanceToken"
import { useAuth } from "@/hooks/use-auth"

export default function AdminPanelPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { user } = useAuth()
  const { getReadContract: getMarketplaceContract, getWriteContract: getMarketplaceWriteContract } = useInvoiceContract()
  const { getReadContract: getTokenContract, getWriteContract: getTokenWriteContract, tokenAddress } = useGovernanceToken()
  const { toast } = useToast()

  const [isOwner, setIsOwner] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPausing, setIsPausing] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintAmount, setMintAmount] = useState("")
  const [mintAddress, setMintAddress] = useState("")

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    const checkOwner = async () => {
      try {
        setIsLoading(true)
        const marketplaceContract = getMarketplaceContract()
        const owner = await marketplaceContract.owner()
        const paused = await marketplaceContract.paused()

        setIsOwner(owner.toLowerCase() === address.toLowerCase())
        setIsPaused(paused)
      } catch (error) {
        console.error("Failed to check owner status:", error)
        setIsOwner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkOwner()
  }, [isConnected, address, getMarketplaceContract])

  // Redirect non-owners away from admin page
  useEffect(() => {
    if (!isLoading && isConnected && !isOwner) {
      // Small delay to show the unauthorized message briefly
      const timer = setTimeout(() => {
        // Redirect to role-specific dashboard
        const role = user?.role
        if (role === "msme") {
          router.push("/dashboard/msme")
        } else if (role === "investor") {
          router.push("/dashboard/investor")
        } else if (role === "bigbuyer") {
          router.push("/dashboard/bigbuyer")
        } else {
          router.push("/dashboard")
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isConnected, isOwner, router, user?.role])

  const handlePause = async () => {
    try {
      setIsPausing(true)
      const contract = await getMarketplaceWriteContract()
      const tx = await contract.pause()
      await tx.wait()

      toast({
        title: "Success",
        description: "Marketplace paused successfully",
      })

      setIsPaused(true)
    } catch (error: any) {
      console.error("Pause failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to pause marketplace",
        variant: "destructive",
      })
    } finally {
      setIsPausing(false)
    }
  }

  const handleUnpause = async () => {
    try {
      setIsPausing(true)
      const contract = await getMarketplaceWriteContract()
      const tx = await contract.unpause()
      await tx.wait()

      toast({
        title: "Success",
        description: "Marketplace unpaused successfully",
      })

      setIsPaused(false)
    } catch (error: any) {
      console.error("Unpause failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to unpause marketplace",
        variant: "destructive",
      })
    } finally {
      setIsPausing(false)
    }
  }

  const handleMint = async () => {
    if (!mintAmount || !mintAddress || parseFloat(mintAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsMinting(true)
      const tokenContract = await getTokenWriteContract()
      const amount = ethers.parseEther(mintAmount)
      const tx = await tokenContract.mint(mintAddress, amount)
      await tx.wait()

      toast({
        title: "Success",
        description: `Minted ${mintAmount} CGOV to ${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`,
      })

      setMintAmount("")
      setMintAddress("")
    } catch (error: any) {
      console.error("Mint failed:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to mint tokens",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Connect your wallet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Connect your wallet to access the admin panel.
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
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">Access Denied</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You are not authorized to access the admin panel. Only the contract owner can access this page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Manage marketplace settings and mint governance tokens.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Marketplace Control
            </CardTitle>
            <CardDescription>Pause or unpause the marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={isPaused ? "destructive" : "default"}>
                {isPaused ? "Paused" : "Active"}
              </Badge>
            </div>
            {isPaused ? (
              <Button onClick={handleUnpause} className="w-full" disabled={isPausing}>
                <Play className="size-4 mr-2" />
                {isPausing ? "Unpausing..." : "Unpause Marketplace"}
              </Button>
            ) : (
              <Button onClick={handlePause} variant="destructive" className="w-full" disabled={isPausing}>
                <Pause className="size-4 mr-2" />
                {isPausing ? "Pausing..." : "Pause Marketplace"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-5" />
              Mint CGOV Tokens
            </CardTitle>
            <CardDescription>Mint governance tokens for testing purposes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Address</label>
              <Input
                type="text"
                placeholder="0x..."
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (CGOV)</label>
              <Input
                type="number"
                placeholder="1000"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                min="0"
                step="0.0001"
              />
            </div>
            <Button
              onClick={handleMint}
              className="w-full"
              disabled={isMinting || !mintAmount || !mintAddress}
            >
              {isMinting ? "Minting..." : "Mint CGOV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

