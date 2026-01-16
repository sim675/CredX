import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useInvoiceContract } from "@/lib/contracts/useInvoiceContract"

export function useIsContractOwner() {
  const { address, isConnected } = useAccount()
  const { getReadContract } = useInvoiceContract()
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsOwner(false)
      setIsLoading(false)
      return
    }

    const checkOwner = async () => {
      try {
        setIsLoading(true)
        const contract = getReadContract()
        const owner = await contract.owner()
        setIsOwner(owner.toLowerCase() === address.toLowerCase())
      } catch (error) {
        console.error("Failed to check contract owner:", error)
        setIsOwner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkOwner()
    
    // Optionally refresh ownership check periodically (every 30 seconds)
    const interval = setInterval(checkOwner, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address, getReadContract])

  return { isOwner, isLoading }
}

