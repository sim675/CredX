"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// <CHANGE> Replaced "admin" with "bigbuyer" role
export type UserRole = "msme" | "investor" | "bigbuyer"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
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

    // <CHANGE> Updated routing to use bigbuyer instead of admin
    if (userData.role === "msme") router.push("/dashboard/msme")
    else if (userData.role === "investor") router.push("/dashboard/investor")
    else if (userData.role === "bigbuyer") router.push("/dashboard/bigbuyer")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("invochain_user")
    router.push("/")
  }

  return { user, isLoading, login, logout }
}
