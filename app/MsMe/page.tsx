"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Mail, Phone, MessageCircle, Calendar, CheckCircle, TrendingUp, Users, Building, DollarSign, Clock, Star, BarChart3, FileText, Award, Target, Lightbulb, Rocket, Handshake, PieChart, Briefcase, CreditCard, PiggyBank, TrendingDown, AlertCircle, ChevronRight, Calculator } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Syne, Archivo_Black } from "next/font/google"
import { Cinzel } from "next/font/google"
import { Playfair_Display } from "next/font/google"

// Font configurations
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

// Theme
const THEME = {
  highlight: '#cbc74dff', 
  mid: '#a94f25ff',       
  core: '#721d12ff',      
  bg: '#000000ff',        
};

// Liquid Background Component
const LiquidBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 40, damping: 20, restDelta: 0.001
  });

  const blob1Y = useTransform(smoothScroll, [0, 1], ["40%", "100%"]);
  const blob1Scale = useTransform(smoothScroll, [0, 0.5], [1, 0.8]);
  const blob2X = useTransform(smoothScroll, [0, 0.4, 1], ["50%", "25%", "40%"]);
  const blob2Y = useTransform(smoothScroll, [0, 0.4, 1], ["40%", "60%", "90%"]);
  const blob3X = useTransform(smoothScroll, [0, 0.4, 1], ["50%", "75%", "60%"]);
  const blob3Y = useTransform(smoothScroll, [0, 0.4, 1], ["40%", "70%", "100%"]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: THEME.bg }}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="relative w-full h-full"
      >

        <div className="absolute inset-0 opacity-30 mix-blend-screen">
          <motion.div 
            style={{ top: blob1Y, left: '50%', x: '-50%', y: '-50%' }}
            className="absolute w-[900px] h-[900px] rounded-full blur-[120px] bg-gradient-to-tr from-[#B32C1A] to-[#FE7F42]"
          />
        </div>

        <div className="absolute inset-0 w-full h-full filter-[url('#liquid-filter')] opacity-100">
          <motion.div
            style={{ left: '50%', top: blob1Y, scale: blob1Scale, x: '-50%', y: '-50%' }}
            className="absolute w-[500px] h-[500px] rounded-full mix-blend-normal"
          >
             <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFFB97] via-[#FE7F42] to-[#B32C1A]" />
          </motion.div>

          <motion.div
            style={{ left: blob2X, top: blob2Y, x: '-50%', y: '-50%' }}
            className="absolute w-[320px] h-[320px] bg-gradient-to-tr from-[#B32C1A] to-[#FE7F42] rounded-full"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            style={{ left: blob3X, top: blob3Y, x: '-50%', y: '-50%' }}
            className="absolute w-[280px] h-[280px] bg-gradient-to-bl from-[#FE7F42] to-[#FFFB97] rounded-full"
            animate={{ scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
      </motion.div>

      <svg className="hidden">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -20" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
      
      <div className="absolute inset-0 opacity-[0.05] z-10 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
    </div>
  );
};

export default function MSMEPage() {
  const [activeTab, setActiveTab] = useState('challenges');

  const challenges = [
    {
      icon: <TrendingDown className="size-6" />,
      title: "Cash Flow Gaps",
      description: "Waiting 30-90 days for invoice payments creates working capital shortages",
      solution: "Get funded within hours instead of waiting months"
    },
    {
      icon: <Calculator className="size-6" />,
      title: "High Financing Costs",
      description: "Traditional factoring charges 15-25% annualized rates",
      solution: "Reduce costs by up to 60% with our transparent fees"
    },
    {
      icon: <AlertCircle className="size-6" />,
      title: "Limited Access",
      description: "Banks often reject MSMEs due to strict collateral requirements",
      solution: "Access global liquidity pools based on invoice quality"
    },
    {
      icon: <Clock className="size-6" />,
      title: "Slow Processes",
      description: "Lengthy paperwork and approval delays hinder growth",
      solution: "Automated verification and instant funding decisions"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="size-6" />,
      title: "Instant Funding",
      description: "Access cash within hours of invoice approval",
      color: "text-[#FFFB97]"
    },
    {
      icon: <ShieldCheck className="size-6" />,
      title: "Blockchain Security",
      description: "Your invoices are tokenized as NFTs for complete ownership",
      color: "text-[#FE7F42]"
    },
    {
      icon: <TrendingUp className="size-6" />,
      title: "Lower Costs",
      description: "Transparent fees starting from just 1.5%",
      color: "text-[#B32C1A]"
    },
    {
      icon: <Globe className="size-6" />,
      title: "Global Access",
      description: "Connect with investors worldwide for better rates",
      color: "text-[#FFFB97]"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Invoice",
      description: "Upload your invoice details and client information",
      icon: <FileText className="size-8" />
    },
    {
      step: 2,
      title: "Get Verified",
      description: "Our AI-powered risk engine assesses your invoice instantly",
      icon: <ShieldCheck className="size-8" />
    },
    {
      step: 3,
      title: "Tokenize as NFT",
      description: "Your invoice becomes a unique digital asset on Polygon",
      icon: <Award className="size-8" />
    },
    {
      step: 4,
      title: "Receive Funding",
      description: "Get cash in your account within hours",
      icon: <DollarSign className="size-8" />
    }
  ];

  const industries = [
    {
      name: "Manufacturing",
      description: "Bridge production cycles with working capital",
      icon: <Building className="size-6" />,
      color: "from-[#FE7F42] to-[#B32C1A]"
    },
    {
      name: "Technology",
      description: "Fund SaaS subscriptions and development cycles",
      icon: <Lightbulb className="size-6" />,
      color: "from-[#B32C1A] to-[#FE7F42]"
    },
    {
      name: "Healthcare",
      description: "Manage insurance claim and patient billing cycles",
      icon: <Users className="size-6" />,
      color: "from-[#FE7F42] to-[#FFFB97]"
    },
    {
      name: "Retail",
      description: "Optimize inventory and supplier payments",
      icon: <Briefcase className="size-6" />,
      color: "from-[#FFFB97] to-[#FE7F42]"
    },
    {
      name: "Construction",
      description: "Finance project milestones and material purchases",
      icon: <Building className="size-6" />,
      color: "from-[#B32C1A] to-[#FFFB97]"
    },
    {
      name: "Services",
      description: "Maintain cash flow between client payments",
      icon: <Users className="size-6" />,
      color: "from-[#FE7F42] to-[#B32C1A]"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Owner, Delhi Textiles",
      company: "Manufacturing • 50 employees",
      content: "CredX helped us survive the festival season rush. We got funding for our raw material purchases within 6 hours!",
      rating: 5
    },
    {
      name: "Raj Kumar",
      role: "Founder, TechSolutions Pvt Ltd",
      company: "Technology • 25 employees",
      content: "Traditional banks rejected our loan application. CredX funded our client invoices and helped us hire 5 more developers.",
      rating: 5
    },
    {
      name: "Anita Patel",
      role: "Director, CarePlus Clinic",
      company: "Healthcare • 15 employees",
      content: "The blockchain transparency gives us confidence. Our patients' insurance claims are now funded immediately.",
      rating: 5
    }
  ];

  const stats = [
    { label: "MSMEs Funded", value: "1,200+", icon: <Building className="size-5" /> },
    { label: "Average Funding Time", value: "< 6 hours", icon: <Clock className="size-5" /> },
    { label: "Cost Savings", value: "Up to 60%", icon: <PiggyBank className="size-5" /> },
    { label: "Success Rate", value: "94%", icon: <Target className="size-5" /> }
  ];

  return (
    <div className="flex flex-col min-h-screen relative text-white selection:bg-[#FE7F42] selection:text-[#2A1617]">
      
      <LiquidBackground />

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="px-4 lg:px-6 h-20 flex items-center border-b border-white/5 backdrop-blur-sm sticky top-0 z-40"
      >
        <Link className="flex items-center justify-center" href="/">
          <span className="text-4xl font-pirate tracking-tight text-white transition-colors duration-200 hover:text-primary cursor-pointer font-bold">CredX</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4 rounded-full px-2 py-1 sm:px-4 sm:py-2 bg-white/5 backdrop-blur-xl border border-white/5 shadow-2xl">
          <Link href="/" className="text-xs sm:text-sm font-medium text-white/70 px-4 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all">Home</Link>
          <Link href="#features" className="text-xs sm:text-sm font-medium text-white/70 px-4 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all">Features</Link>
          <Link href="/auth/signin"><Button variant="ghost" size="sm" className="hidden sm:inline-flex text-white hover:text-[#FE7F42] hover:bg-white/5 rounded-full">Sign In</Button></Link>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10">
        
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${syne.className}`}>
                Empowering <span className="text-[#FE7F42]">MSMEs</span> with <span className="text-[#FFFB97]">Instant</span> Liquidity
              </h1>
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 mb-8`}>
                Transform your unpaid invoices into immediate working capital on the blockchain
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Rocket className="mr-2 size-5" /> Start Funding
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40"
                >
                  <Calculator className="mr-2 size-5" /> Calculate Savings
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-2 text-[#FE7F42]">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Common <span className="text-[#FE7F42]">MSME Challenges</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                We understand the unique challenges faced by Micro, Small, and Medium Enterprises
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {challenges.map((challenge, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#B32C1A]/20 flex items-center justify-center text-[#B32C1A] group-hover:bg-[#B32C1A]/30 transition-colors flex-shrink-0">
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                      <p className="text-white/60 text-sm mb-3">{challenge.description}</p>
                      <div className="flex items-center gap-2 text-[#FFFB97] text-sm">
                        <ChevronRight className="size-4" />
                        <span>{challenge.solution}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                How <span className="text-[#FE7F42]">CredX</span> Works for MSMEs
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Get funded in 4 simple steps on the Polygon Amoy testnet
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FE7F42] to-[#B32C1A] flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#2A1617] rounded-full border-2 border-[#FE7F42] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#FE7F42]">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                <span className="text-[#FE7F42]">Benefits</span> for Your Business
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Experience the advantages of decentralized invoice financing
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  <div className={`${benefit.color} mb-4 flex justify-center transform hover:scale-110 transition-transform`}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white/60 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Serving <span className="text-[#FE7F42]">All Industries</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Tailored solutions for every sector of the economy
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {industry.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{industry.name}</h3>
                  <p className="text-white/60 text-sm">{industry.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Success <span className="text-[#FE7F42]">Stories</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Hear from MSMEs who transformed their business with CredX
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="size-4 text-[#FFFB97] fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                  
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-[#FE7F42] text-sm">{testimonial.role}</div>
                    <div className="text-white/60 text-xs">{testimonial.company}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-12 rounded-3xl bg-gradient-to-r from-[#FE7F42]/20 to-[#B32C1A]/20 border border-[#FE7F42]/30 backdrop-blur-sm"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Ready to <span className="text-[#FE7F42]">Transform</span> Your Cash Flow?
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Join thousands of MSMEs who are already using CredX to grow their business faster
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Rocket className="mr-2 size-5" /> Get Started Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <Calendar className="mr-2 size-5" /> Schedule Consultation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
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
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FE7F42]">Platform</h4>
              <div className="flex flex-col gap-2 text-sm text-white/60">
                <Link href="/demo" className="hover:text-white">Marketplace</Link>
                <Link href="/MsMe" className="hover:text-white">For MSMEs</Link>
                <Link href="/Risky" className="hover:text-white">Risk Engine</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FE7F42]">Contact</h4>
              <div className="flex flex-col gap-2 text-sm text-white/60">
                <Link href="/Support" className="hover:text-white transition-colors">Support</Link>
                <Link href="/Sales" className="hover:text-white transition-colors">Sales</Link>
                <Link href="/Media" className="hover:text-white transition-colors">Media</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FE7F42]">Company</h4>
              <div className="flex flex-col gap-2 text-sm text-white/60">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex justify-between items-center">
            <p className="text-xs text-white/30 font-mono">© 2026 CredX Protocol.</p>
            <div className="text-xs text-white/30 font-mono">Polygon Amoy Testnet</div>
          </div>
        </div>
      </footer>
    </div>
  )
}