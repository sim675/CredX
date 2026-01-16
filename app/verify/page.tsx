"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

// This page is the landing destination for the verification link sent in email.
// It reads the token from the URL, calls the backend verification endpoint,
// and renders loading/success/error states. In the error state the user can
// request that a new verification email be sent.
export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState("")
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isResendLoading, setIsResendLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid or missing verification token.")
      return
    }

    let cancelled = false

    const verify = async () => {
      setStatus("loading")
      setMessage(null)

      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || data.message || "Verification failed")
        }

        if (!cancelled) {
          setStatus("success")
          setMessage(data.message || "Your email has been verified successfully.")
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error")
          setMessage(err instanceof Error ? err.message : "Verification failed")
        }
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResendLoading(true)
    setResendMessage(null)

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      setResendMessage(data.message || "If an account exists, a new verification email has been sent.")
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : "Failed to resend verification email")
    } finally {
      setIsResendLoading(false)
    }
  }

  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const isError = status === "error"

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden py-12 px-4">
      {/* Background Orbs to match auth pages */}
      <div className="pointer-events-none absolute w-[650px] h-[650px] rounded-full blur-[160px] bg-[rgba(255,130,30,0.65)] -top-40 -left-40 animate-pulse" />
      <div
        className="pointer-events-none absolute w-[800px] h-[800px] rounded-full blur-[220px] bg-[rgba(255,200,60,0.3)] bottom-0 right-0 animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <Card className="relative z-10 w-full max-w-lg border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5 text-white">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-white/80">Verifying your email, please wait...</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <p className="text-white/90 font-medium text-center">{message}</p>
              <p className="text-sm text-white/60 text-center">
                You can now sign in and access your dashboard.
              </p>
            </div>
          )}

          {isError && (
            <div className="space-y-4">
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              {/* Allow the user to request a new verification email if needed */}
              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-email" className="text-white/80">
                    Email address used during signup
                  </Label>
                  <Input
                    id="resend-email"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(255,122,24,0.25)] backdrop-blur-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isResendLoading}
                  className="w-full"
                >
                  {isResendLoading ? "Sending..." : "Resend Verification Email"}
                </Button>

                {resendMessage && (
                  <Alert className="bg-white/5 border-white/10">
                    <AlertDescription>{resendMessage}</AlertDescription>
                  </Alert>
                )}
              </form>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 items-center">
          <Button asChild variant="outline" className="w-full border-white/20 text-white/90">
            <Link href="/auth/signin">Go to Login</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white/70 hover:text-white">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
