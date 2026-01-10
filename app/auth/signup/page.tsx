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
import { Eye, EyeOff, Building2, Landmark, Briefcase, AlertCircle } from "lucide-react"
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

      login(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden py-12 px-4">
      <div className="pointer-events-none absolute w-[650px] h-[650px] rounded-full blur-[160px] bg-[rgba(255,130,30,0.65)] -top-40 -left-40" />
      <div className="pointer-events-none absolute w-[800px] h-[800px] rounded-full blur-[220px] bg-[rgba(255,200,60,0.3)] bottom-0 right-0" />

      <Card className="relative z-10 w-full max-w-xl border-[rgba(255,122,24,0.2)] shadow-xl backdrop-blur-sm bg-[rgba(20,20,20,0.85)] text-white">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold flex items-center justify-center shadow-md">
                IC
              </div>
              <span className="text-xl font-semibold tracking-tight transition-colors duration-200 cursor-pointer hover:text-primary">
                InvoChain
              </span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-white/70">
            Join the decentralized invoice financing marketplace
          </CardDescription>
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
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)]"
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
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)]"
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
                    className="pr-10 bg-white/5 border-white/20 text-white focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)]"
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
                        className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-black/20 p-4 hover:bg-black/30 hover:text-white peer-data-[state=checked]:border-[#ff7a18] cursor-pointer transition-all"
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