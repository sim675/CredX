"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  TrendingUp,
  Users,
  FileText,
  Wallet,
  Star,
  Clock,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Github,
  Linkedin
} from "lucide-react"
import Link from "next/link"
import { Syne, Archivo_Black, Cinzel, Playfair_Display } from "next/font/google"

// Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-playfair",
})

const cinzel = Cinzel({ 
  subsets: ["latin"],
  weight: ["400", "700"], 
  variable: "--font-cinzel",
})

const syne = Syne({ 
  subsets: ["latin"],
  weight: ["700", "800"], 
  variable: "--font-syne",
})

const druk = Archivo_Black({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-druk",
})

// Enhanced theme with role-specific colors
const THEME = {
  highlight: '#EAF2EF', 
  mid: '#912F56',       
  core: '#521945',      
  bg: '#0D090A',        
  // Role-specific colors
  msme: {
    primary: '#B2FFFC', // Light Mint
    secondary: '#66D9EF',
    accent: '#34E5E3'
  },
  investor: {
    primary: '#C51077', // Deep Rose
    secondary: '#8C0B53',
    accent: '#FF69B4'
  },
  buyer: {
    primary: '#6c5ce7', // Deep Purple
    secondary: '#5a47ab',
    accent: '#7a64ea'
  }
};

// Enhanced sample data with role-specific details
const sampleInvoices = [
  {
    id: "INV-001",
    msme: "TechStart Solutions",
    buyer: "Global Corp Ltd",
    amount: "50,000",
    yield: "12.5",
    daysRemaining: 45,
    status: "Fundraising",
    fundedPercentage: 65,
    riskScore: "Low",
    verified: true,
    creditScore: 750,
    industry: "Technology",
    description: "Software development services for Q4 2025"
  },
  {
    id: "INV-002", 
    msme: "Manufacturing Co",
    buyer: "Retail Chain Inc",
    amount: "125,000",
    yield: "15.8",
    daysRemaining: 30,
    status: "Fundraising",
    fundedPercentage: 40,
    riskScore: "Medium",
    verified: true,
    creditScore: 680,
    industry: "Manufacturing",
    description: "Industrial equipment supply contract"
  },
  {
    id: "INV-003",
    msme: "Logistics Pro",
    buyer: "Distribution Hub",
    amount: "75,000",
    yield: "10.2",
    daysRemaining: 60,
    status: "Funded",
    fundedPercentage: 100,
    riskScore: "Low",
    verified: false,
    creditScore: 720,
    industry: "Logistics",
    description: "Transportation and warehousing services"
  }
]

// Role-specific content
const roleContent = {
  msme: {
    hero: {
      title: "Transform Your Invoices into Instant Cash",
      subtitle: "Get funded in hours, not weeks. Unlock your business potential with CredX.",
      features: [
        "Same-day funding approval",
        "No credit checks required",
        "Keep full control of your business",
        "Build your credit reputation"
      ]
    },
    stats: [
      { label: 'Total Funding Received', value: '$450K', change: '+25%' },
      { label: 'Active Invoices', value: '12', change: '+3' },
      { label: 'Avg. Funding Time', value: '4 hours', change: '-1hr' },
      { label: 'Credit Score', value: '750', change: '+50' }
    ],
    benefits: [
      { icon: <Zap className="size-8" />, title: 'Lightning Fast', desc: 'From invoice upload to funding in under 4 hours' },
      { icon: <ShieldCheck className="size-8" />, title: 'No Hidden Fees', desc: 'Transparent pricing with no surprises' },
      { icon: <TrendingUp className="size-8" />, title: 'Grow Faster', desc: 'Access capital to scale your business operations' }
    ]
  },
  investor: {
    hero: {
      title: "Earn Premium Yields from Verified Invoices",
      subtitle: "Invest in real-world assets with predictable returns. Smart contract security guaranteed.",
      features: [
        "12-18% annual yields",
        "Blockchain-secured investments",
        "Diversified risk portfolio",
        "Real-time tracking"
      ]
    },
    stats: [
      { label: 'Total Invested', value: '$2.5M', change: '+18%' },
      { label: 'Active Investments', value: '45', change: '+8' },
      { label: 'Average Yield', value: '14.2%', change: '+1.2%' },
      { label: 'Success Rate', value: '99.2%', change: '+0.3%' }
    ],
    benefits: [
      { icon: <TrendingUp className="size-8" />, title: 'High Yields', desc: 'Earn 12-18% annually from short-term assets' },
      { icon: <ShieldCheck className="size-8" />, title: 'Blockchain Security', desc: 'Every investment protected by smart contracts' },
      { icon: <Globe className="size-8" />, title: 'Global Access', desc: 'Invest in invoices from anywhere in the world' }
    ]
  },
  buyer: {
    hero: {
      title: "Streamline Your Payment Operations",
      subtitle: "Manage invoices efficiently while building your business reputation through timely payments.",
      features: [
        "Flexible payment terms",
        "Automated payment scheduling",
        "Build supplier relationships",
        "Track payment history"
      ]
    },
    stats: [
      { label: 'Total Processed', value: '$5.2M', change: '+22%' },
      { label: 'On-Time Payments', value: '98%', change: '+2%' },
      { label: 'Supplier Score', value: '850', change: '+75' },
      { label: 'Avg. Processing Time', value: '2 days', change: '-0.5day' }
    ],
    benefits: [
      { icon: <Clock className="size-8" />, title: 'Time Savings', desc: 'Automated payment processing saves hours each week' },
      { icon: <Star className="size-8" />, title: 'Build Reputation', desc: 'Improve your credit score through timely payments' },
      { icon: <Wallet className="size-8" />, title: 'Better Terms', desc: 'Unlock better payment terms with suppliers' }
    ]
  }
}

const demoSteps = [
  {
    title: "Invoice Creation",
    description: "MSMEs upload invoices and set funding terms",
    icon: <FileText className="size-6" />,
    role: "msme"
  },
  {
    title: "Risk Assessment", 
    description: "AI-powered credit scoring and verification",
    icon: <ShieldCheck className="size-6" />,
    role: "system"
  },
  {
    title: "Marketplace Listing",
    description: "Verified invoices appear on the marketplace",
    icon: <Globe className="size-6" />,
    role: "system"
  },
  {
    title: "Investment",
    description: "Investors fund invoices for yield returns",
    icon: <TrendingUp className="size-6" />,
    role: "investor"
  },
  {
    title: "On-Chain Settlement",
    description: "Smart contracts execute automatically",
    icon: <Zap className="size-6" />,
    role: "system"
  },
  {
    title: "Repayment",
    description: "Buyer pays invoice, investors receive returns",
    icon: <Wallet className="size-6" />,
    role: "buyer"
  }
]

const LiquidBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 40, damping: 20, restDelta: 0.001
  });

  // Parallax transforms
  const blob1Y = useTransform(smoothScroll, [0, 1], ["40%", "100%"]);
  const blob1Scale = useTransform(smoothScroll, [0, 0.5], [1, 0.8]);
  const blob2X = useTransform(smoothScroll, [0, 0.4, 1], ["50%", "25%", "40%"]);
  const blob2Y = useTransform(smoothScroll, [0, 0.4, 1], ["40%", "60%", "90%"]);
  const blob3X = useTransform(smoothScroll, [0, 0.4, 1], ["50%", "75%", "60%"]);
  const blob3Y = useTransform(smoothScroll, [0, 0.4, 1], ["40%", "70%", "100%"]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: THEME.bg }}>
      
      {/* WRAPPER FOR INTRO ANIMATION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="relative w-full h-full"
      >

        {/* A. Ambient Glow */}
        <div className="absolute inset-0 opacity-30 mix-blend-screen">
          <motion.div 
            style={{ top: blob1Y, left: '50%', x: '-50%', y: '-50%' }}
            className="absolute w-[900px] h-[900px] rounded-full blur-[120px] bg-gradient-to-tr from-[#521945] to-[#912F56]"
          />
        </div>

        {/* B. The Liquid Engine */}
        <div className="absolute inset-0 w-full h-full filter-[url('#liquid-filter')] opacity-100">
          <motion.div
            style={{ left: '50%', top: blob1Y, scale: blob1Scale, x: '-50%', y: '-50%' }}
            className="absolute w-[500px] h-[500px] rounded-full mix-blend-normal"
          >
             <div className="w-full h-full rounded-full bg-gradient-to-br from-[#EAF2EF] via-[#912F56] to-[#521945]" />
          </motion.div>

          <motion.div
            style={{ left: blob2X, top: blob2Y, x: '-50%', y: '-50%' }}
            className="absolute w-[320px] h-[320px] bg-gradient-to-tr from-[#521945] to-[#912F56] rounded-full"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            style={{ left: blob3X, top: blob3Y, x: '-50%', y: '-50%' }}
            className="absolute w-[280px] h-[280px] bg-gradient-to-bl from-[#912F56] to-[#EAF2EF] rounded-full"
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
      </motion.div>

      {/* C. SVG Filter */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -20" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
      
      {/* D. Film Grain */}
      <div className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
    </div>
  );
};

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'msme' | 'investor' | 'buyer'>('investor');
  const [activeTab, setActiveTab] = useState('process');
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    // Automated journey animation - sync with bitcoin character movement
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 2000); // Change step every 2 seconds to match 12-second journey cycle
    return () => clearInterval(interval);
  }, []);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-[#912F56] selection:text-[#0D090A]">
      
      {/* BACKGROUND */}
      <LiquidBackground />

      {/* CLICK TO INITIALIZE OVERLAY */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
            onClick={() => setIntroFinished(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.5 }}
            transition={{ duration: 0.8 }}
          >
             <motion.div 
               className="group relative px-10 py-6 sm:px-14 sm:py-8"
               whileHover={{ scale: 1.05 }}
             >
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-full border border-white/30 group-hover:border-[#912F56] transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_50px_rgba(145,47,86,0.4)]" />
                
                <p className="relative z-10 font-mono text-xl sm:text-3xl font-bold tracking-[0.2em] text-white group-hover:text-[#912F56] transition-colors uppercase text-center whitespace-nowrap">
                  [ DEMO ]
                </p>
                
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-30 duration-[2000ms]" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <motion.header 
        initial="hidden"
        animate={introFinished ? "visible" : "hidden"}
        variants={{
            hidden: { y: -50, opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.8, delay: 0.5 } }
        }}
        className="px-4 lg:px-6 h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-sm sticky top-0 z-40"
      >
        <Link href="/" className="flex items-center justify-center">
          <span className="text-4xl font-pirate tracking-tight text-white transition-colors duration-200 hover:text-[#912F56] cursor-pointer font-bold">CredX</span>
        </Link>
        <nav className="flex items-center gap-4 rounded-full px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/5">
          <Link href="/" className="text-sm font-medium text-white/70 px-4 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all">Home</Link>
          <Link href="/auth/signup"><Button size="sm" className="rounded-full px-6 bg-[#912F56] text-white font-bold hover:bg-[#EAF2EF] hover:scale-105 transition-all">Get Started</Button></Link>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10" style={{ opacity: introFinished ? 1 : 0, pointerEvents: introFinished ? 'auto' : 'none', transition: 'opacity 1s ease-in-out' }}>
        
        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial="hidden"
              animate={introFinished ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
                visible: { 
                  opacity: 1, 
                  scale: 1, 
                  filter: "blur(0px)",
                  transition: { duration: 1.2, ease: "easeOut", delay: 0.2 }
                }
              }}
              className="text-center space-y-8"
            >
              <Badge className="bg-[#912F56]/20 text-[#912F56] border-[#912F56]/30 px-4 py-2">
                Interactive Demo
              </Badge>
              
              <h1 className={`text-5xl md:text-7xl font-bold ${syne.className}`}>
                Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#912F56] to-[#EAF2EF]">Future</span> of Invoice Financing
              </h1>
              
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 max-w-3xl mx-auto`}>
                See how CredX transforms invoices into liquid assets through blockchain technology and smart contracts
              </p>
            </motion.div>
          </div>
        </section>

        {/* Role Selector - Enhanced with Landing Page Inspiration */}
        <section className="relative w-full py-20 px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate={introFinished ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } }
              }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <Badge className="bg-[#912F56]/20 text-[#912F56] border-[#912F56]/30 px-6 py-3 text-sm font-bold">
                  Choose Your Journey
                </Badge>
                
                <h2 className={`text-4xl md:text-6xl font-bold ${syne.className}`}>
                  How Will You <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#912F56] to-[#EAF2EF]">Transform</span> Your Business?
                </h2>
                
                <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 max-w-3xl mx-auto`}>
                  Select your role to experience a personalized walkthrough of CredX features
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="inline-flex p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  {[
                    { role: 'msme' as const, title: 'MSME', desc: 'Get instant funding for your invoices', icon: <FileText className="size-8" />, gradient: 'from-[#B2FFFC] to-[#66D9EF]' },
                    { role: 'investor' as const, title: 'Investor', desc: 'Earn premium yields from verified invoices', icon: <TrendingUp className="size-8" />, gradient: 'from-[#C51077] to-[#8C0B53]' },
                    { role: 'buyer' as const, title: 'Buyer', desc: 'Streamline payment operations', icon: <Wallet className="size-8" />, gradient: 'from-[#6c5ce7] to-[#5a47ab]' }
                  ].map((item, index) => (
                    <motion.button
                      key={item.role}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRole(item.role)}
                      className={`relative px-8 py-6 rounded-xl transition-all duration-300 flex items-center gap-4 min-w-[200px] ${
                        selectedRole === item.role 
                          ? 'bg-black/40 border-2 shadow-2xl'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      style={{
                        borderColor: selectedRole === item.role ? undefined : 'transparent',
                        background: selectedRole === item.role 
                          ? `linear-gradient(135deg, ${item.role === 'msme' ? 'rgb(178 255 252 / 0.05)' : item.role === 'investor' ? 'rgb(197 16 119 / 0.05)' : 'rgb(108 92 231 / 0.05)'}, transparent)`
                          : undefined
                      }}
                    >
                      {/* Animated border effect for selected role */}
                      {selectedRole === item.role && (
                        <motion.div
                          layoutId="activeRoleBorder"
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-10`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <div className={`relative z-10 flex items-center gap-4 ${
                        selectedRole === item.role 
                          ? 'text-white'
                          : 'text-white/60'
                      }`}>
                        <motion.div
                          animate={{ 
                            rotate: selectedRole === item.role ? [0, 10, -10, 0] : 0,
                            scale: selectedRole === item.role ? [1, 1.1, 1] : 1
                          }}
                          transition={{ 
                            rotate: { duration: 2, repeat: Infinity, repeatDelay: 3 },
                            scale: { duration: 0.3 }
                          }}
                        >
                          {item.icon}
                        </motion.div>
                        <div className="text-left">
                          <p className="font-bold text-lg">{item.title}</p>
                          <p className="text-sm opacity-80">{item.desc}</p>
                        </div>
                      </div>
                      
                      {/* Glow effect for selected role */}
                      {selectedRole === item.role && (
                        <motion.div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.gradient} opacity-0 blur-xl`}
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Role-Specific Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial="hidden"
                animate={introFinished ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "circOut", delay: 0.4 } }
                }}
                className="text-center space-y-10"
              >
                <motion.div 
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                >
                  <Badge 
                    className={`px-8 py-4 text-sm font-bold border-2 ${
                      selectedRole === 'msme' ? 'bg-white/10 text-white/90 border-white/20 shadow-lg shadow-black/20' :
                      selectedRole === 'investor' ? 'bg-white/10 text-white/90 border-white/20 shadow-lg shadow-black/20' :
                      'bg-white/10 text-white/90 border-white/20 shadow-lg shadow-black/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedRole === 'msme' && <FileText className="size-4" />}
                      {selectedRole === 'investor' && <TrendingUp className="size-4" />}
                      {selectedRole === 'buyer' && <Wallet className="size-4" />}
                      {selectedRole === 'msme' && 'For MSMEs'}
                      {selectedRole === 'investor' && 'For Investors'}
                      {selectedRole === 'buyer' && 'For Buyers'}
                    </div>
                  </Badge>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className={`text-4xl md:text-6xl font-bold ${syne.className} bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent`}>
                    {roleContent[selectedRole].hero.title}
                  </h2>
                </motion.div>
                
                <motion.p 
                  className={`${cinzel.className} text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {roleContent[selectedRole].hero.subtitle}
                </motion.p>
                
                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {roleContent[selectedRole].hero.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, type: "spring", bounce: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`bg-white/5 p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        selectedRole === 'msme' ? 'border-[#B2FFFC]/20 hover:border-[#B2FFFC]/40 hover:bg-[#B2FFFC]/5' :
                        selectedRole === 'investor' ? 'border-[#C51077]/20 hover:border-[#C51077]/40 hover:bg-[#C51077]/5' :
                        'border-[#6c5ce7]/20 hover:border-[#6c5ce7]/40 hover:bg-[#6c5ce7]/5'
                      }`}
                    >
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                        className={`mb-3 ${
                          selectedRole === 'msme' ? 'text-[#B2FFFC]' :
                          selectedRole === 'investor' ? 'text-[#C51077]' :
                          'text-[#6c5ce7]'
                        }`}
                      >
                        <CheckCircle className="size-6" />
                      </motion.div>
                      <p className="text-white/90 font-medium">{feature}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full grid-cols-3 bg-white/5 border border-white/10 ${
                selectedRole === 'msme' ? 'border-[#B2FFFC]/30' :
                selectedRole === 'investor' ? 'border-[#C51077]/30' :
                'border-[#6c5ce7]/30'
              }`}>
                <TabsTrigger value="process" className={`data-[state=active]:${
                  selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 text-[#B2FFFC]' :
                  selectedRole === 'investor' ? 'bg-[#C51077]/20 text-[#C51077]' :
                  'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                }`}>Process Flow</TabsTrigger>
                <TabsTrigger value="marketplace" className={`data-[state=active]:${
                  selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 text-[#B2FFFC]' :
                  selectedRole === 'investor' ? 'bg-[#C51077]/20 text-[#C51077]' :
                  'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                }`}>Marketplace</TabsTrigger>
                <TabsTrigger value="analytics" className={`data-[state=active]:${
                  selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 text-[#B2FFFC]' :
                  selectedRole === 'investor' ? 'bg-[#C51077]/20 text-[#C51077]' :
                  'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                }`}>Analytics</TabsTrigger>
              </TabsList>

              {/* Marketplace Demo */}
              <TabsContent value="marketplace" className="space-y-8">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Live Marketplace Simulation</h3>
                    <Badge className="bg-green-500/20 text-green-400">Live Demo</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleInvoices.map((invoice, index) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          delay: index * 0.15, 
                          duration: 0.6, 
                          ease: "easeOut",
                          type: "spring",
                          bounce: 0.3
                        }}
                        whileHover={{ 
                          scale: 1.03, 
                          y: -8,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`bg-black/40 p-6 rounded-xl border transition-all cursor-pointer ${
                          selectedRole === 'msme' ? 'border-[#B2FFFC]/30 hover:border-[#B2FFFC]/60' :
                          selectedRole === 'investor' ? 'border-[#C51077]/30 hover:border-[#C51077]/60' :
                          'border-[#6c5ce7]/30 hover:border-[#6c5ce7]/60'
                        }`}
                      >
                        <motion.div 
                          className="absolute inset-0 rounded-xl opacity-0"
                          style={{
                            background: selectedRole === 'msme' ? 'linear-gradient(135deg, rgba(178, 255, 252, 0.1), transparent)' :
                                       selectedRole === 'investor' ? 'linear-gradient(135deg, rgba(197, 16, 119, 0.1), transparent)' :
                                       'linear-gradient(135deg, rgba(108, 92, 231, 0.1), transparent)'
                          }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        <div className="relative z-10">
                          <motion.div 
                            className="flex justify-between items-start mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.15 }}
                          >
                            <div>
                              <motion.p 
                                className="text-gray-400 text-sm mb-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.15 }}
                              >
                                Invoice ID
                              </motion.p>
                              <motion.p 
                                className="font-mono text-white"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                              >
                                {invoice.id}
                              </motion.p>
                            </div>
                            <motion.div 
                              className="text-right"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + index * 0.15 }}
                            >
                              <motion.p 
                                className="text-gray-400 text-sm mb-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.15 }}
                              >
                                Yield
                              </motion.p>
                              <motion.p 
                                className="text-green-400 font-bold"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.15, type: "spring", bounce: 0.5 }}
                              >
                                {invoice.yield}%
                              </motion.p>
                            </motion.div>
                          </motion.div>

                          <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.15 }}
                          >
                            <p className="text-gray-400 text-sm mb-1">MSME</p>
                            <p className="text-white font-medium">{invoice.msme}</p>
                          </motion.div>

                          <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.15 }}
                          >
                            <p className="text-gray-400 text-sm mb-1">Amount</p>
                            <motion.p 
                              className="text-2xl font-bold text-white"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.15, type: "spring", bounce: 0.4 }}
                            >
                              ${invoice.amount}
                            </motion.p>
                          </motion.div>

                          <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.15 }}
                          >
                            <div className="flex justify-between text-sm mb-2">
                              <motion.span 
                                className="text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + index * 0.15 }}
                              >
                                Funded
                              </motion.span>
                              <motion.span 
                                className="text-white"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.15 }}
                              >
                                {invoice.fundedPercentage}%
                              </motion.span>
                            </div>
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.9 + index * 0.15, duration: 0.8, ease: "easeOut" }}
                            >
                              <Progress value={invoice.fundedPercentage} className="h-2" />
                            </motion.div>
                          </motion.div>

                          <motion.div 
                            className="flex justify-between items-center mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 + index * 0.15 }}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 1.1 + index * 0.15, type: "spring", bounce: 0.5 }}
                            >
                              <Badge variant={invoice.verified ? "default" : "secondary"} className={invoice.verified ? "bg-green-500/20 text-green-400" : ""}>
                                {invoice.verified ? "Verified" : "Pending"}
                              </Badge>
                            </motion.div>
                            <motion.div 
                              className="flex items-center gap-1 text-sm"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.1 + index * 0.15 }}
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              >
                                <Clock className="size-4 text-orange-400" />
                              </motion.div>
                              <span className="text-white">{invoice.daysRemaining} days</span>
                            </motion.div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + index * 0.15 }}
                          >
                            <Button className={`w-full font-bold transition-all hover:scale-105 ${
                              selectedRole === 'msme' ? 'bg-[#B2FFFC] hover:bg-[#66D9EF] text-black' :
                              selectedRole === 'investor' ? 'bg-[#C51077] hover:bg-[#8C0B53] text-black' :
                              'bg-[#6c5ce7] hover:bg-[#5a47ab] text-black'
                            }`}>
                          {selectedRole === 'msme' && (invoice.status === 'Fundraising' ? 'Get Funding' : 'View Details')}
                          {selectedRole === 'investor' && (invoice.status === 'Fundraising' ? 'Invest Now' : 'View Details')}
                          {selectedRole === 'buyer' && 'View Invoice'}
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Process Flow Demo */}
              <TabsContent value="process" className="space-y-8">
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-center">Invoice Financing Journey</h3>
                    <p className="text-white/60 text-center mt-2">Watch your invoice transform into liquid assets</p>
                  </div>

                  <div className="relative mb-12">
                    {/* Journey Path Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-y-1/2" />
                    
                    {/* Bitcoin Traveler */}
                    <motion.div
                      className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 z-20"
                      animate={{
                        left: `${(currentStep / (demoSteps.length - 1)) * 100}%`
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          y: [0, -10, 0]
                        }}
                        transition={{
                          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                          y: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative"
                      >
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                          <span className="text-white font-bold text-lg">₿</span>
                        </div>
                        {/* Glow effect */}
                        <motion.div
                          className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </motion.div>

                    {/* Step Points */}
                    <div className="grid md:grid-cols-6 gap-4 relative z-10">
                      {demoSteps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8, y: 30 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            transition: { 
                              delay: index * 0.1, 
                              duration: 0.5, 
                              type: "spring", 
                              bounce: 0.4 
                            }
                          }}
                          className={`p-4 rounded-lg border transition-all relative overflow-hidden ${
                            currentStep === index
                              ? selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 border-[#B2FFFC]' :
                                selectedRole === 'investor' ? 'bg-[#C51077]/20 border-[#C51077]' :
                                'bg-[#6c5ce7]/20 border-[#6c5ce7]'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          {/* Active step indicator */}
                          {currentStep === index && (
                            <motion.div
                              className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}
                          
                          <div className={`relative z-10 flex flex-col items-center text-center space-y-2 ${
                            currentStep === index 
                              ? selectedRole === 'msme' ? 'text-[#B2FFFC]' :
                                selectedRole === 'investor' ? 'text-[#C51077]' :
                                'text-[#6c5ce7]'
                              : 'text-white/60'
                          }`}>
                            <motion.div
                              animate={{
                                rotate: currentStep === index ? [0, 10, -10, 0] : 0,
                                scale: currentStep === index ? [1, 1.1, 1] : 1
                              }}
                              transition={{
                                rotate: { duration: 2, repeat: Infinity, repeatDelay: 3 },
                                scale: { duration: 0.3 }
                              }}
                            >
                              {step.icon}
                            </motion.div>
                            <motion.p 
                              className="text-xs font-medium"
                              animate={{
                                fontWeight: currentStep === index ? 700 : 400
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {step.title}
                            </motion.p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/40 p-8 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${
                          selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 text-[#B2FFFC]' :
                          selectedRole === 'investor' ? 'bg-[#C51077]/20 text-[#C51077]' :
                          'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                        }`}>
                          {demoSteps[currentStep].icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold">{demoSteps[currentStep].title}</h4>
                          <p className="text-white/60">{demoSteps[currentStep].description}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-sm text-white/80">
                          {demoSteps[currentStep].role === 'msme' && "As an MSME, you can upload your invoices in minutes and receive funding offers from multiple investors."}
                          {demoSteps[currentStep].role === 'investor' && "As an investor, you can browse verified invoices and choose investments based on yield and risk profile."}
                          {demoSteps[currentStep].role === 'buyer' && "As a buyer, you can manage your payment obligations and build your reputation through timely payments."}
                          {demoSteps[currentStep].role === 'system' && "Our system automatically verifies documents, assesses risk, and executes smart contracts for secure transactions."}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* Role-Specific Analytics */}
              <TabsContent value="analytics" className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedRole}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 p-6 rounded-xl border border-white/10"
                      >
                        <h4 className="text-xl font-bold mb-4">
                          {selectedRole === 'msme' && 'Your Funding Stats'}
                          {selectedRole === 'investor' && 'Investment Performance'}
                          {selectedRole === 'buyer' && 'Payment Analytics'}
                        </h4>
                        <div className="space-y-4">
                          {roleContent[selectedRole].stats.map((stat, index) => (
                            <motion.div 
                              key={index} 
                              className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              whileHover={{ 
                                scale: 1.02, 
                                x: 5,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <motion.span 
                                className="text-white/60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                              >
                                {stat.label}
                              </motion.span>
                              <div className="flex items-center gap-2">
                                <motion.span 
                                  className="font-bold"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2 + index * 0.1, type: "spring", bounce: 0.3 }}
                                >
                                  {stat.value}
                                </motion.span>
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1, type: "spring", bounce: 0.5 }}
                                >
                                  <Badge className={`text-xs ${
                                    selectedRole === 'msme' ? 'bg-[#B2FFFC]/20 text-[#B2FFFC]' :
                                    selectedRole === 'investor' ? 'bg-[#C51077]/20 text-[#C51077]' :
                                    'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                                  }`}>{stat.change}</Badge>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 p-6 rounded-xl border border-white/10"
                      >
                        <h4 className="text-xl font-bold mb-4">Risk Distribution</h4>
                        <div className="space-y-4">
                          {[
                            { risk: 'Low Risk', percentage: 65, color: 'bg-green-500' },
                            { risk: 'Medium Risk', percentage: 30, color: 'bg-yellow-500' },
                            { risk: 'High Risk', percentage: 5, color: 'bg-red-500' }
                          ].map((item, index) => (
                            <motion.div 
                              key={index} 
                              className="space-y-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.15, duration: 0.5 }}
                              whileHover={{ 
                                scale: 1.02, 
                                x: 5,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <div className="flex justify-between text-sm">
                                <motion.span 
                                  className="text-white/80 font-medium"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + index * 0.15 }}
                                >
                                  {item.risk}
                                </motion.span>
                                <motion.span 
                                  className="text-white font-bold"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2 + index * 0.15, type: "spring", bounce: 0.4 }}
                                >
                                  {item.percentage}%
                                </motion.span>
                              </div>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3 + index * 0.15, duration: 0.8, ease: "easeOut" }}
                              >
                                <Progress value={item.percentage} className="h-2" />
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-8 rounded-xl border ${
                        selectedRole === 'msme' ? 'bg-gradient-to-r from-[#B2FFFC]/20 to-[#66D9EF]/20 border-[#B2FFFC]/30' :
                        selectedRole === 'investor' ? 'bg-gradient-to-r from-[#C51077]/20 to-[#8C0B53]/20 border-[#C51077]/30' :
                        'bg-gradient-to-r from-[#6c5ce7]/20 to-[#5a47ab]/20 border-[#6c5ce7]/30'
                      }`}
                    >
                      <h4 className="text-2xl font-bold mb-6">Why Choose CredX?</h4>
                      <div className="grid md:grid-cols-3 gap-6">
                        {roleContent[selectedRole].benefits.map((benefit, index) => (
                          <div key={index} className="text-center space-y-3">
                            <div className={`mx-auto ${
                              selectedRole === 'msme' ? 'text-[#B2FFFC]' :
                              selectedRole === 'investor' ? 'text-[#C51077]' :
                              'text-[#6c5ce7]'
                            }`}>
                              {benefit.icon}
                            </div>
                            <h5 className="font-bold text-lg">{benefit.title}</h5>
                            <p className="text-white/60 text-sm">{benefit.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial="hidden"
              animate={introFinished ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.6 } }
              }}
              className="space-y-8"
            >
              <h2 className={`text-4xl md:text-6xl font-bold ${syne.className}`}>
                Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#912F56] to-[#EAF2EF]">Invoices?</span>
              </h2>
              <p className="text-xl text-white/80">
                Join thousands of MSMEs and investors already using CredX for decentralized invoice financing
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-14 px-10 text-base rounded-full bg-[#912F56] text-white font-bold hover:bg-[#EAF2EF] hover:scale-105 transition-all">
                    Get Started Now <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <div style={{ opacity: introFinished ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
          <footer className="relative z-10 border-t border-white/10 bg-[#1A0E0F]/80 backdrop-blur-xl">
            <div className="container px-4 md:px-6 mx-auto py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-1 md:col-span-1">
                  <span className="text-2xl font-mono tracking-widest text-white font-bold uppercase">CredX</span>
                  <p className="mt-4 text-xs text-white/40 uppercase tracking-widest">
                    RWA Financing<br/>Protocol V1.0
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#912F56]">Platform</h4>
                  <div className="flex flex-col gap-2 text-sm text-white/60">
                    <Link href="#" className="hover:text-white">Marketplace</Link>
                    <Link href="#" className="hover:text-white">For MSMEs</Link>
                    <Link href="#" className="hover:text-white">Risk Engine</Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#912F56]">Contact</h4>
                  <div className="flex flex-col gap-2 text-sm text-white/60">
                    <Link href="#" className="hover:text-white transition-colors">Support</Link>
                    <Link href="#" className="hover:text-white transition-colors">Sales</Link>
                    <Link href="#" className="hover:text-white transition-colors">Media</Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#912F56]">Company</h4>
                  <div className="flex flex-col gap-2 text-sm text-white/60">
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#912F56]">Connect</h4>
                  <div className="flex gap-4">
                      <Linkedin className="size-5 text-white/60 hover:text-white cursor-pointer" />
                      <Github className="size-5 text-white/60 hover:text-white cursor-pointer" />
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                <p className="text-xs text-white/30 font-mono"> 2026 CredX Protocol.</p>
                <div className="text-xs text-white/30 font-mono">Polygon Amoy Testnet</div>
              </div>
            </div>
          </footer>
      </div>
    </div>
  )
}