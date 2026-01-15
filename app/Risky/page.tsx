"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Mail, Phone, MessageCircle, Calendar, CheckCircle, TrendingUp, Users, Building, DollarSign, Clock, Star, BarChart3, FileText, Award, Target, Lightbulb, Rocket, Handshake, PieChart, Briefcase, CreditCard, PiggyBank, TrendingDown, AlertCircle, ChevronRight, Calculator, Activity, Database, Lock, Eye, Cpu, Brain, Filter, Search, RefreshCw, AlertTriangle, CheckSquare } from "lucide-react"
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

export default function RiskEnginePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [simulationData, setSimulationData] = useState({
    invoiceAmount: 10000,
    clientRisk: 'medium',
    industry: 'technology',
    paymentHistory: 'good'
  });

  const riskFactors = [
    {
      category: "Client Creditworthiness",
      weight: "35%",
      factors: ["Payment history", "Credit score", "Business stability", "Industry reputation"],
      icon: <Users className="size-6" />,
      color: "text-[#FE7F42]"
    },
    {
      category: "Invoice Quality",
      weight: "25%",
      factors: ["Clear terms", "Proper documentation", "Legal compliance", "Amount verification"],
      icon: <FileText className="size-6" />,
      color: "text-[#FFFB97]"
    },
    {
      category: "Business Health",
      weight: "20%",
      factors: ["Revenue trends", "Cash flow analysis", "Debt ratios", "Growth metrics"],
      icon: <BarChart3 className="size-6" />,
      color: "text-[#B32C1A]"
    },
    {
      category: "Market Conditions",
      weight: "20%",
      factors: ["Industry trends", "Economic indicators", "Seasonal patterns", "Competitive landscape"],
      icon: <Globe className="size-6" />,
      color: "text-[#FE7F42]"
    }
  ];

  const riskLevels = [
    {
      level: "Low Risk (A+)",
      score: "90-100",
      rate: "0.8%",
      description: "Excellent credit history, established business, strong industry",
      color: "from-green-500 to-green-600"
    },
    {
      level: "Medium Risk (B)",
      score: "70-89",
      rate: "1.2%",
      description: "Good payment history, stable business, moderate industry",
      color: "from-yellow-500 to-orange-500"
    },
    {
      level: "High Risk (C)",
      score: "50-69",
      rate: "2.0%",
      description: "Limited history, new business, volatile industry",
      color: "from-orange-500 to-red-500"
    }
  ];

  const features = [
    {
      icon: <Brain className="size-6" />,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms analyze 50+ data points for accurate risk assessment",
      color: "text-[#FFFB97]"
    },
    {
      icon: <Database className="size-6" />,
      title: "Real-Time Data",
      description: "Access to up-to-date business credit information and market data",
      color: "text-[#FE7F42]"
    },
    {
      icon: <ShieldCheck className="size-6" />,
      title: "Blockchain Verification",
      description: "Immutable audit trail and transparent risk scoring on-chain",
      color: "text-[#B32C1A]"
    },
    {
      icon: <Activity className="size-6" />,
      title: "Dynamic Monitoring",
      description: "Continuous risk assessment and automatic alerts for changes",
      color: "text-[#FFFB97]"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Data Collection",
      description: "Gather invoice details, client information, and business data",
      icon: <Database className="size-8" />
    },
    {
      step: 2,
      title: "AI Analysis",
      description: "Machine learning models process 50+ risk factors",
      icon: <Brain className="size-8" />
    },
    {
      step: 3,
      title: "Risk Scoring",
      description: "Generate comprehensive risk score and funding rate",
      icon: <BarChart3 className="size-8" />
    },
    {
      step: 4,
      title: "Smart Contract",
      description: "Deploy terms and conditions as immutable smart contract",
      icon: <Lock className="size-8" />
    }
  ];

  const stats = [
    { label: "Risk Accuracy", value: "94%", icon: <Target className="size-5" /> },
    { label: "Processing Time", value: "< 2 min", icon: <Clock className="size-5" /> },
    { label: "Data Points", value: "50+", icon: <Database className="size-5" /> },
    { label: "Default Rate", value: "1.2%", icon: <TrendingDown className="size-5" /> }
  ];

  const calculateRiskScore = () => {
    // Simplified risk calculation for demo
    let score = 75;
    
    if (simulationData.clientRisk === 'low') score += 15;
    else if (simulationData.clientRisk === 'high') score -= 15;
    
    if (simulationData.paymentHistory === 'excellent') score += 10;
    else if (simulationData.paymentHistory === 'poor') score -= 10;
    
    return Math.min(100, Math.max(0, score));
  };

  const getRiskLevel = (score: number) => {
    if (score >= 90) return riskLevels[0];
    if (score >= 70) return riskLevels[1];
    return riskLevels[2];
  };

  const currentScore = calculateRiskScore();
  const currentRiskLevel = getRiskLevel(currentScore);

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
                Advanced <span className="text-[#FE7F42]">Risk Engine</span> Powered by <span className="text-[#FFFB97]">AI</span>
              </h1>
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 mb-8`}>
                Intelligent risk assessment for transparent, fair invoice financing
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Eye className="mr-2 size-5" /> Try Risk Calculator
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40"
                >
                  <FileText className="mr-2 size-5" /> View Documentation
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

        {/* Risk Factors */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                <span className="text-[#FE7F42]">Risk Factors</span> We Analyze
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Our comprehensive risk assessment covers multiple dimensions for accurate scoring
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {riskFactors.map((factor, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${factor.color} flex-shrink-0`}>
                      {factor.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-white">{factor.category}</h3>
                        <span className="text-[#FFFB97] font-bold">{factor.weight}</span>
                      </div>
                      <ul className="space-y-2">
                        {factor.factors.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-white/60 text-sm">
                            <CheckCircle className="size-3 text-[#FFFB97]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Risk Simulator */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                  <span className="text-[#FE7F42]">Risk Simulator</span>
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  See how our risk engine evaluates your invoices in real-time
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Invoice Parameters</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Invoice Amount ($)</label>
                      <input
                        type="number"
                        value={simulationData.invoiceAmount}
                        onChange={(e) => setSimulationData({...simulationData, invoiceAmount: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Client Risk Level</label>
                      <select
                        value={simulationData.clientRisk}
                        onChange={(e) => setSimulationData({...simulationData, clientRisk: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                      >
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
                      <select
                        value={simulationData.industry}
                        onChange={(e) => setSimulationData({...simulationData, industry: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                      >
                        <option value="technology">Technology</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="construction">Construction</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Payment History</label>
                      <select
                        value={simulationData.paymentHistory}
                        onChange={(e) => setSimulationData({...simulationData, paymentHistory: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Risk Assessment Result</h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white mb-2">{currentScore}</div>
                    <div className="text-lg text-[#FE7F42] mb-4">{currentRiskLevel.level}</div>
                    <div className={`w-full h-3 rounded-full bg-gradient-to-r ${currentRiskLevel.color} mb-4`}></div>
                    <div className="text-2xl font-bold text-[#FFFB97] mb-2">{currentRiskLevel.rate}</div>
                    <div className="text-white/60">Financing Rate</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Estimated Funding Time</span>
                        <span className="text-[#FFFB97] font-bold">6-12 hours</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Maximum Advance Rate</span>
                        <span className="text-[#FFFB97] font-bold">85%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 h-12 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                  >
                    <Rocket className="mr-2 size-5" /> Apply for Funding
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                <span className="text-[#FE7F42]">Advanced</span> Risk Features
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Cutting-edge technology powering our risk assessment engine
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  <div className={`${feature.color} mb-4 flex justify-center transform hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                How Our <span className="text-[#FE7F42]">Risk Engine</span> Works
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Four-step process for intelligent risk assessment
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, i) => (
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
                Ready to <span className="text-[#FE7F42]">Experience</span> Smart Risk Assessment?
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Join thousands of businesses benefiting from our AI-powered risk engine
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Rocket className="mr-2 size-5" /> Start Assessment
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <FileText className="mr-2 size-5" /> API Documentation
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