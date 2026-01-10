"use client"

import type React from "react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      login(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
      <div className="pointer-events-none absolute w-[650px] h-[650px] rounded-full blur-[160px] bg-[rgba(255,130,30,0.65)] -top-40 -left-40" />
      <div className="pointer-events-none absolute w-[800px] h-[800px] rounded-full blur-[220px] bg-[rgba(255,200,60,0.3)] bottom-0 right-0" />

      <Card className="relative z-10 w-full max-w-md border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
               <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 
                          text-primary-foreground font-semibold flex items-center justify-center
                          shadow-md">
            IC
          </div>

          <span className="text-xl font-semibold tracking-tight text-foreground
                          transition-colors duration-200 hover:text-primary cursor-pointer">
            InvoChain
          </span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

        <div className="relative rounded-2xl overflow-hidden group">
  {/* Soft hover glow (static) */}
  <div
    className="
      pointer-events-none absolute -inset-2 rounded-2xl
      opacity-0 group-hover:opacity-100
      transition duration-700
      blur-3xl bg-primary/10
    "
  />

  <CardContent
    className="
      relative space-y-6 rounded-2xl
      bg-white/5 backdrop-blur-xl
      border border-white/15
      p-8
      transition-all duration-500
      group-hover:border-primary/30
    "
  >
    {/* Email */}
    <div className="space-y-2">
      <Label htmlFor="email" className="text-white/80">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="m@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="
          bg-white/5 border-white/20 text-white
          placeholder:text-white/40
          focus:border-primary/50
          focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)]
        "
      />
    </div>

    {/* Password */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password" className="text-white/80">
          Password
        </Label>
        <Link href="#" className="text-xs text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            pr-10 bg-white/5 border-white/20 text-white
            focus:border-primary/50
            focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)]
          "
        />

        {/* Eye toggle — FIXED */}
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-white/50 hover:text-white transition
          "
        >
          {showPassword ? (
            <Eye className="size-4" />   // 👁️ visible
          ) : (
            <EyeOff className="size-4" /> // 🙈 hidden
          )}
        </button>
      </div>
    </div>

    {/* Demo Hint */}
    <div className="
      rounded-xl border border-white/15
      bg-black/30 backdrop-blur-md
      p-4 text-xs text-white/70
    ">
      <p className="font-medium text-white/90 mb-2">Demo Hint</p>
      <p>Email with <span className="text-primary font-medium">"investor"</span> → Investor Dashboard</p>
      <p>Email with <span className="text-primary font-medium">"buyer"</span> → Big Buyer Dashboard</p>
      <p>Other emails → MSME Dashboard</p>
    </div>
  </CardContent>
</div>

  



          <CardFooter className="flex flex-col gap-5 pt-2">
  {/* Primary CTA */}
  <Button
    type="submit"
    disabled={isLoading}
    className="
      group relative w-full h-12 text-base font-semibold
      rounded-xl
      bg-primary text-primary-foreground
      transition-all duration-300
      hover:scale-[1.02]
      hover:shadow-[0_0_30px_rgba(255,122,24,0.55)]
      focus-visible:ring-2 focus-visible:ring-primary/50
      disabled:opacity-50 disabled:cursor-not-allowed
    "
  >
    {/* Soft glow */}
    <span
      className="
        pointer-events-none absolute inset-0 rounded-xl
        opacity-0 group-hover:opacity-100
        transition duration-500
        blur-xl bg-primary/30
      "
    />
    <span className="relative z-10">{isLoading ? "Signing in..." : "Sign In"}</span>
  </Button>

  {/* Secondary text */}
  <div className="text-sm text-center text-white/70">
    Don&apos;t have an account?{" "}
    <Link
      href="/auth/signup"
      className="
        text-primary font-medium
        hover:underline underline-offset-4
        transition
      "
    >
      Create Account
    </Link>
  </div>
</CardFooter>

        </form>
      </Card>
    </div>
  )
}
