"use client"

import type React from "react"

import { Eye, EyeOff } from "lucide-react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth, type UserRole } from "@/hooks/use-auth"
import { Building2, Landmark, Briefcase } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("msme")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
    })
  }

const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/5 py-12 px-4">
      <Card className="w-full max-w-xl border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
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
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join the decentralized invoice financing marketplace
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
                    bg-white/5 border-white/20 text-white
                    placeholder:text-white/40
                    focus:border-primary/50
                    focus:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]
                  "
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    bg-white/5 border-white/20 text-white
                    placeholder:text-white/40
                    focus:border-primary/50
                    focus:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]
                  "
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>

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
                    focus:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]
                  "
                />

                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-white/50 hover:text-white transition
                  "
                >
                  {showPassword ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                </button>
              </div>
            </div> 



            <div className="space-y-4 pt-2">
              <Label className="text-base font-semibold">Select Your Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="msme" id="msme" className="peer sr-only" />
                  <Label
                    htmlFor="msme"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Building2 className="mb-3 size-6" />
                    <span className="font-bold">MSME</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">
                      Tokenize invoices for liquidity
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="investor" id="investor" className="peer sr-only" />
                  <Label
                    htmlFor="investor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Landmark className="mb-3 size-6" />
                    <span className="font-bold">Investor</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">
                      Fund invoices and earn yield
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="bigbuyer" id="bigbuyer" className="peer sr-only" />
                  <Label
                    htmlFor="bigbuyer"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <Briefcase className="mb-3 size-6" />
                    <span className="font-bold">Big Buyer</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">Pay invoices & build reputation</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          </div>
          <CardFooter className="flex flex-col gap-4">
            <Button
                type="submit"
                className="
                  group relative w-full h-12 text-base font-semibold
                  rounded-xl
                  bg-primary text-primary-foreground
                  transition-all duration-300
                  hover:scale-[1.02]
                  hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]
                  focus-visible:ring-2 focus-visible:ring-primary/50
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
                <span className="relative z-10">Create Account</span>
              </Button>
            <div className="text-sm text-center text-white/70">
    Already have an account?{" "}
    <Link
      href="/auth/signin"
      className="
        text-primary font-medium
        hover:underline underline-offset-4
        transition
      "
    >
      SignIn
    </Link>
  </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}