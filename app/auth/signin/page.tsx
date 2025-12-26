"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // <CHANGE> Updated mock role inference to use bigbuyer instead of admin
    let role: "msme" | "investor" | "bigbuyer" = "msme"
    if (email.includes("investor")) role = "investor"
    if (email.includes("buyer")) role = "bigbuyer"

    login({
      id: "1",
      name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      email,
      role,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/5 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary size-10 rounded flex items-center justify-center text-primary-foreground font-bold text-xl">
                IC
              </div>
              <span className="font-bold text-2xl tracking-tighter">InvoChain</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50"
              />
            </div>
            {/* <CHANGE> Updated demo hint to reference Big Buyer */}
            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground border border-border/50">
              <p className="font-medium mb-1">Demo Hint:</p>
              <p>Email with "investor" → Investor Dashboard</p>
              <p>Email with "buyer" → Big Buyer Dashboard</p>
              <p>Other emails → MSME Dashboard</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11 text-base">
              Sign In
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Create Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
