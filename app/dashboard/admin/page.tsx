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
import { Shield, Coins, UserPlus, CheckCircle2 } from "lucide-react"
import { useInvoiceContract } from "@/lib/contracts/useInvoiceContract"
import { useCredXUtilityToken } from "@/lib/contracts/useCredXUtilityToken"
import { useAuth } from "@/hooks/use-auth"

export default function AdminPanelPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { user } = useAuth()
  const { getReadContract: getMarketplaceContract } = useInvoiceContract()
  const { getReadContract: getUtilityTokenContract, getWriteContract: getUtilityTokenWriteContract, contractAddress: utilityTokenAddress } = useCredXUtilityToken()
  const { toast } = useToast()

  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMinting, setIsMinting] = useState(false)
  const [mintAmount, setMintAmount] = useState("")
  const [mintAddress, setMintAddress] = useState("")
  const [tokenAdmin, setTokenAdmin] = useState<string | null>(null)

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
        
        // Also check if the user is the utility token admin
        const tokenContract = getUtilityTokenContract()
        const admin = await tokenContract.admin()
        setTokenAdmin(admin)

        // User is considered owner if they own the marketplace
        setIsOwner(owner.toLowerCase() === address.toLowerCase())
      } catch (error) {
        console.error("Failed to check owner status:", error)
        setIsOwner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkOwner()
  }, [isConnected, address, getMarketplaceContract, getUtilityTokenContract])

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

  const handleOnboardInvestor = async () => {
    if (!mintAmount || !mintAddress || parseFloat(mintAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and investor address",
        variant: "destructive",
      })
      return
    }

    // Validate Ethereum address
    if (!ethers.isAddress(mintAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsMinting(true)
      const tokenContract = await getUtilityTokenWriteContract()
      const amount = ethers.parseEther(mintAmount)
      const tx = await tokenContract.mint(mintAddress, amount)
      await tx.wait()

      toast({
        title: "Success",
        description: `Investor onboarded! Minted ${mintAmount} CREDX to ${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`,
      })

      setMintAmount("")
      setMintAddress("")
    } catch (error: any) {
      console.error("Mint failed:", error)
      toast({
        title: "Error",
        description: error?.reason || error?.message || "Failed to mint utility tokens",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  // Check if user can mint utility tokens (is token admin)
  const canMintTokens = tokenAdmin && address && tokenAdmin.toLowerCase() === address.toLowerCase()

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
        <p className="text-muted-foreground">Manage platform access and onboard investors to the ecosystem.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform Status Card */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              Platform Status
            </CardTitle>
            <CardDescription>Marketplace is permanently active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Marketplace</span>
              <Badge variant="default" className="bg-emerald-500">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utility Token</span>
              <Badge variant="outline" className="font-mono text-xs">
                {utilityTokenAddress?.slice(0, 6)}...{utilityTokenAddress?.slice(-4)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Role</span>
              <Badge variant="secondary">Platform Owner</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Investor Onboarding Card */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Investor Onboarding
            </CardTitle>
            <CardDescription>Mint CredX Utility Tokens to onboard new investors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canMintTokens ? (
              <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-md">
                ⚠️ You are the marketplace owner but not the utility token admin. Token minting requires the token admin address.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Investor Wallet Address</label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (CREDX)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    CREDX tokens enable investors to stake and earn CGOV governance tokens
                  </p>
                </div>
                <Button
                  onClick={handleOnboardInvestor}
                  className="w-full"
                  disabled={isMinting || !mintAmount || !mintAddress}
                >
                  <Coins className="size-4 mr-2" />
                  {isMinting ? "Minting..." : "Onboard Investor"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
