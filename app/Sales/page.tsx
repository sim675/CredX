"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Mail, Phone, MessageCircle, Calendar, CheckCircle, TrendingUp, Users, Building, DollarSign, Clock, Star, BarChart3, FileText, Award, Target, Lightbulb, Rocket, Handshake } from "lucide-react"
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

export default function SalesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    companySize: 'small',
    industry: 'other'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sales form submitted:', formData);
    // Handle form submission here
  };

  const benefits = [
    {
      icon: <Zap className="size-6" />,
      title: "Instant Liquidity",
      description: "Convert invoices to cash within hours, not months",
      color: "text-[#FFFB97]"
    },
    {
      icon: <ShieldCheck className="size-6" />,
      title: "Blockchain Security",
      description: "Immutable invoice records and transparent transactions",
      color: "text-[#FE7F42]"
    },
    {
      icon: <TrendingUp className="size-6" />,
      title: "Lower Costs",
      description: "Reduce financing costs by up to 60% compared to traditional methods",
      color: "text-[#B32C1A]"
    },
    {
      icon: <Globe className="size-6" />,
      title: "Global Access",
      description: "Access worldwide liquidity pools and investors",
      color: "text-[#FFFB97]"
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "1.5%",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to $50,000 monthly volume",
        "Basic risk assessment",
        "Standard funding speed (24-48 hours)",
        "Email support",
        "Monthly reporting"
      ],
      highlighted: false
    },
    {
      name: "Growth",
      price: "1.2%",
      description: "Ideal for growing MSMEs",
      features: [
        "Up to $500,000 monthly volume",
        "Advanced risk assessment",
        "Priority funding (6-12 hours)",
        "Priority support",
        "Real-time analytics dashboard",
        "API access"
      ],
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large enterprises",
      features: [
        "Unlimited monthly volume",
        "Custom risk models",
        "Instant funding",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
        "SLA guarantees"
      ],
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechStart Solutions",
      company: "Technology Startup",
      content: "CredX transformed our cash flow. We went from waiting 90 days for payments to accessing funds instantly. Game changer for our growth.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "CFO, Global Manufacturing Co",
      company: "Manufacturing",
      content: "The blockchain transparency and lower costs made CredX an obvious choice. We've reduced our financing costs by 45%.",
      rating: 5
    },
    {
      name: "Dr. Aisha Patel",
      role: "Founder, HealthTech Innovations",
      company: "Healthcare",
      content: "As a startup, accessing capital was challenging. CredX made it simple and affordable. Highly recommend for any MSME.",
      rating: 5
    }
  ];

  const stats = [
    { label: "Invoice Volume Processed", value: "$50M+", icon: <DollarSign className="size-5" /> },
    { label: "Businesses Served", value: "1,200+", icon: <Building className="size-5" /> },
    { label: "Average Funding Time", value: "< 12 hours", icon: <Clock className="size-5" /> },
    { label: "Customer Satisfaction", value: "98%", icon: <Star className="size-5" /> }
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
                Transform Your <span className="text-[#FE7F42]">Invoices</span> into <span className="text-[#FFFB97]">Instant Cash</span>
              </h1>
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 mb-8`}>
                Join 1,200+ businesses using CredX for faster, cheaper invoice financing
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Rocket className="mr-2 size-5" /> Get Started Today
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40"
                >
                  <Calendar className="mr-2 size-5" /> Schedule Demo
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
                Why Choose <span className="text-[#FE7F42]">CredX</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Experience the future of invoice financing with our blockchain-powered platform
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

        {/* Pricing */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Simple, <span className="text-[#FE7F42]">Transparent</span> Pricing
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Pay only for what you use. No hidden fees or setup costs.
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-3xl border ${
                    tier.highlighted 
                      ? 'border-[#FE7F42] bg-[#FE7F42]/10' 
                      : 'border-white/10 bg-white/5'
                  } backdrop-blur-sm hover:bg-white/10 transition-all`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#FE7F42] text-[#2A1617] px-4 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-[#FE7F42] mb-2">
                    {tier.price}
                    {tier.price !== "Custom" && <span className="text-lg text-white/60"> fee</span>}
                  </div>
                  <p className="text-white/60 mb-6">{tier.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="size-5 text-[#FFFB97] mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-12 rounded-full font-bold transition-all hover:scale-105 ${
                      tier.highlighted
                        ? 'bg-[#FE7F42] text-[#2A1617] hover:bg-[#FFFB97]'
                        : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
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
                Trusted by <span className="text-[#FE7F42]">Leading</span> Businesses
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                See what our customers have to say about their experience
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

        {/* Contact Form */}
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
                  Ready to <span className="text-[#FE7F42]">Get Started</span>?
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  Schedule a demo with our sales team and see how CredX can transform your business cash flow
                </p>
              </div>

              <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Company Name *</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="Your Company Ltd"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Company Size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                      >
                        <option value="small">1-50 employees</option>
                        <option value="medium">51-200 employees</option>
                        <option value="large">201-1000 employees</option>
                        <option value="enterprise">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Industry</label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                      >
                        <option value="technology">Technology</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="retail">Retail</option>
                        <option value="construction">Construction</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Tell us about your needs *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors resize-none"
                      placeholder="Describe your current invoice financing challenges and what you're looking for..."
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="flex-1 h-12 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                    >
                      <Handshake className="mr-2 size-5" /> Schedule Demo
                    </Button>
                    <Button 
                      type="button"
                      size="lg" 
                      variant="outline" 
                      className="h-12 px-8 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Mail className="mr-2 size-5" /> sales@credx.io
                    </Button>
                  </div>
                </form>
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
                <Link href="#" className="hover:text-white">For MSMEs</Link>
                <Link href="#" className="hover:text-white">Risk Engine</Link>
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