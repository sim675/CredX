import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 
                          text-primary-foreground font-semibold flex items-center justify-center
                          shadow-md">
            IC
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground hover:text-primary">
            InvoChain
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-5 sm:gap-7 rounded-full px-5 py-2 bg-background/40 backdrop-blur-xl border border-white/10 shadow-lg">
          <Link href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Process
          </Link>
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
              Create Account
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">

        {/* Hero Section (LEFT ALIGNED) */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-start space-y-6">

              {/* Badge */}
              <div className="inline-flex items-center rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                Revolutionizing RWA Finance
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl">
                Decentralized Invoice <br />
                Financing Marketplace
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl text-white/80 md:text-xl leading-relaxed">
                Instant liquidity for MSMEs through{" "}
                <span className="text-white font-medium">tokenized invoices</span> and{" "}
                <span className="text-white font-medium">smart contracts</span>.  
                Empowering businesses with seamless access to global capital.
              </p>

              {/* CTAs */}
              <div className="flex gap-4 pt-6">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-12 px-8 rounded-xl hover:scale-105 transition">
                    Get Started
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>

                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-xl border-white/30 text-white hover:bg-white/10"
                  >
                    Marketplace Demo
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section (UNCHANGED) */}
        <section id="features" className="relative w-full py-16 md:py-28 lg:py-36">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-3">
              {/* Feature cards remain exactly the same */}
              {/* ... */}
            </div>
          </div>
        </section>

      </main>

      {/* Footer (UNCHANGED) */}
      <footer className="w-full py-12 border-t border-border/50 bg-background">
        {/* footer content unchanged */}
      </footer>

    </div>
  )
}
