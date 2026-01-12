// app/auth/signup/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import { ArrowLeft, Eye, EyeOff, Building2, Landmark, Briefcase, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("msme")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // --- MIDDLEWARE FIX: SET COOKIE MANUALLY ---
      // This ensures the middleware sees the role before the redirect happens
      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      document.cookie = `user_role=${role}; expires=${date.toUTCString()}; path=/`;

      // Small delay to ensure browser storage is committed
      setTimeout(() => {
        login(data)
      }, 50);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden py-12 px-4">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute w-[650px] h-[650px] rounded-full blur-[160px] bg-[rgba(255,130,30,0.65)] -top-40 -left-40 animate-pulse" />
      <div className="pointer-events-none absolute w-[800px] h-[800px] rounded-full blur-[220px] bg-[rgba(255,200,60,0.3)] bottom-0 right-0 animate-pulse" style={{ animationDelay: "1s" }} />

      <Card className="relative z-10 w-full max-w-xl border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5 text-white">
        <Link 
          href="/auth/signin" 
          className="absolute left-6 top-6 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-6" /> 
        </Link>
        
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center text-center">
            <span className="text-7xl font-kroftsmann tracking-widest leading-none mb-0 text-white font-bold">
              Sign Up
            </span>
            <p className="text-lg text-white/90 font-serif mt-2">
              Create an account
            </p>
            <p className="text-sm text-white/60 mt-1">
              Join the decentralized invoice financing marketplace
            </p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 pt-4">
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden group">
            <div className="pointer-events-none absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl bg-[rgba(255,130,30,0.10)]" />

            <CardContent className="space-y-6 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)] backdrop-blur-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)] backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-white/5 border border-white/10 text-white focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)] backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                  >
                    {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2 pb-2">
                <Label className="text-base font-semibold">Select Your Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {[ 
                    { id: "msme", icon: <Building2 className="mb-3 size-6" />, text: "MSME", sub: "Tokenize invoices for liquidity" },
                    { id: "investor", icon: <Landmark className="mb-3 size-6" />, text: "Investor", sub: "Fund invoices and earn yield" },
                    { id: "bigbuyer", icon: <Briefcase className="mb-3 size-6" />, text: "Big Buyer", sub: "Pay invoices & build reputation" },
                  ].map((opt) => (
                    <div key={opt.id}>
                      <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                      <Label
                        htmlFor={opt.id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:text-white peer-data-[state=checked]:border-[#ff7a18] cursor-pointer transition-all backdrop-blur-sm"
                      >
                        {opt.icon}
                        <span className="font-bold">{opt.text}</span>
                        <span className="text-[10px] text-white/60 text-center mt-1">{opt.sub}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </div>

          <CardFooter className="flex flex-col gap-5 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 text-base font-semibold rounded-xl bg-primary text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,122,24,0.55)] focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur-xl bg-[rgba(255,122,24,0.35)]" />
              <span className="relative z-10">{isLoading ? "Creating account..." : "Create Account"}</span>
            </Button>

            <div className="text-sm text-center text-white/70">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary font-medium hover:underline underline-offset-4 transition">
                SignIn
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}