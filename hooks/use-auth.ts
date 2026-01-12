"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "msme" | "investor" | "bigbuyer"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  walletAddress?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("invochain_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("invochain_user", JSON.stringify(userData))

    // 1. Redirect to wallet connection if wallet not bound
    if (!userData.walletAddress) {
      router.push("/connect-wallet")
      return
    }

    // 2. Routing based on role
    if (userData.role === "msme") {
      router.push("/dashboard/msme")
    } else if (userData.role === "investor") {
      router.push("/dashboard/investor")
    } else if (userData.role === "bigbuyer") {
      router.push("/dashboard/bigbuyer")
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("invochain_user")
    
    // --- THE FIX: Clear the Middleware Cookie ---
    // We set the expiration to a date in the past to delete it
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    
    router.push("/")
  }

  return { user, isLoading, login, logout }
}