"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Mail, Phone, MessageCircle, Calendar, Download, ExternalLink, FileText, Image, Video, Twitter, Linkedin, Facebook, Instagram, Youtube, TrendingUp, Award, Newspaper, Podcast, Camera, Mic } from "lucide-react"
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

export default function MediaPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const pressReleases = [
    {
      id: 1,
      title: "CredX Launches Decentralized Invoice Financing on Polygon Amoy Testnet",
      excerpt: "Revolutionary platform transforms MSME invoices into liquid assets through blockchain technology",
      date: "January 15, 2026",
      category: "launch",
      image: "/api/placeholder/600/400",
      content: "CredX today announced the launch of its groundbreaking decentralized invoice financing platform on the Polygon Amoy testnet..."
    },
    {
      id: 2,
      title: "CredX Secures Strategic Partnership with Leading DeFi Protocol",
      excerpt: "Partnership aims to expand liquidity options for MSME invoice financing",
      date: "January 10, 2026",
      category: "partnership",
      image: "/api/placeholder/600/400",
      content: "In a significant move for the DeFi ecosystem, CredX has announced a strategic partnership..."
    },
    {
      id: 3,
      title: "CredX Reports 300% Growth in Invoice Volume Q4 2025",
      excerpt: "Platform demonstrates strong adoption among MSMEs seeking alternative financing",
      date: "January 5, 2026",
      category: "milestone",
      image: "/api/placeholder/600/400",
      content: "CredX today announced exceptional growth metrics for Q4 2025, with invoice volume increasing by 300%..."
    }
  ];

  const mediaCoverage = [
    {
      outlet: "DeFi Times",
      title: "How CredX is Revolutionizing MSME Financing",
      date: "January 12, 2026",
      category: "article",
      link: "#",
      image: "/api/placeholder/400/250"
    },
    {
      outlet: "Blockchain Weekly",
      title: "The Future of Invoice Financing is Decentralized",
      date: "January 8, 2026",
      category: "article",
      link: "#",
      image: "/api/placeholder/400/250"
    },
    {
      outlet: "Crypto News Network",
      title: "CredX: Bridging Traditional Finance and DeFi",
      date: "January 3, 2026",
      category: "video",
      link: "#",
      image: "/api/placeholder/400/250"
    }
  ];

  const downloads = [
    {
      title: "CredX Brand Guidelines",
      description: "Complete brand assets and usage guidelines",
      type: "pdf",
      size: "2.4 MB",
      icon: <FileText className="size-5" />
    },
    {
      title: "Logo Package",
      description: "High-resolution logos in various formats",
      type: "zip",
      size: "15.7 MB",
      icon: <Image className="size-5" />
    },
    {
      title: "Product Screenshots",
      description: "Platform interface and feature images",
      type: "zip",
      size: "8.2 MB",
      icon: <Camera className="size-5" />
    },
    {
      title: "Executive Headshots",
      description: "Leadership team professional photos",
      type: "zip",
      size: "12.1 MB",
      icon: <Image className="size-5" />
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former VP at Goldman Sachs, 15+ years in fintech and blockchain",
      image: "/api/placeholder/200/200",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Consensys engineer, expert in DeFi protocols and smart contracts",
      image: "/api/placeholder/200/200",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Risk & Compliance",
      bio: "Former risk director at JPMorgan, PhD in Financial Engineering",
      image: "/api/placeholder/200/200",
      linkedin: "#",
      twitter: "#"
    }
  ];

  const filteredPressReleases = activeFilter === 'all' 
    ? pressReleases 
    : pressReleases.filter(release => release.category === activeFilter);

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
                Media & <span className="text-[#FE7F42]">Press</span>
              </h1>
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 mb-8`}>
                The latest news and updates from CredX
              </p>
              
              {/* Quick Contact */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="h-12 px-8 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                >
                  <Mail className="mr-2 size-4" /> media@credx.io
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 px-8 rounded-full border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40"
                >
                  <Download className="mr-2 size-4" /> Press Kit
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Press <span className="text-[#FE7F42]">Releases</span>
              </h2>
              
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-8">
                {['all', 'launch', 'partnership', 'milestone'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeFilter === filter
                        ? 'bg-[#FE7F42] text-[#2A1617]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
              {filteredPressReleases.map((release, i) => (
                <motion.article 
                  key={release.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/10 transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#FE7F42] to-[#B32C1A] opacity-20 group-hover:opacity-30 transition-opacity" />
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#FFFB97] font-medium uppercase tracking-widest">
                        {release.category}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className="text-xs text-white/40">{release.date}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FE7F42] transition-colors">
                      {release.title}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-3">
                      {release.excerpt}
                    </p>
                    
                    <Button variant="ghost" size="sm" className="text-[#FE7F42] hover:text-[#FFFB97] p-0 h-auto">
                      Read More <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Media Coverage */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Media <span className="text-[#FE7F42]">Coverage</span>
              </h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mediaCoverage.map((coverage, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/10 transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#B32C1A] to-[#FE7F42] opacity-20 group-hover:opacity-30 transition-opacity relative">
                    {coverage.category === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <Youtube className="size-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#FFFB97] font-medium uppercase tracking-widest">
                        {coverage.outlet}
                      </span>
                      {coverage.category === 'video' ? (
                        <Video className="size-4 text-[#FE7F42]" />
                      ) : (
                        <Newspaper className="size-4 text-[#FE7F42]" />
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FE7F42] transition-colors">
                      {coverage.title}
                    </h3>
                    
                    <p className="text-white/40 text-xs mb-4">{coverage.date}</p>
                    
                    <Button variant="ghost" size="sm" className="text-[#FE7F42] hover:text-[#FFFB97] p-0 h-auto">
                      Read Article <ExternalLink className="ml-2 size-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Press Kit Downloads */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Press <span className="text-[#FE7F42]">Kit</span>
              </h2>
              <p className="text-white/60 max-w-2xl">
                Download our official brand assets, logos, and company information for media use.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {downloads.map((download, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#FE7F42]/20 flex items-center justify-center text-[#FE7F42] group-hover:bg-[#FE7F42]/30 transition-colors">
                      {download.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{download.title}</h4>
                      <p className="text-white/60 text-sm">{download.description}</p>
                      <p className="text-white/40 text-xs mt-1">{download.type.toUpperCase()} • {download.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#FE7F42] hover:text-[#FFFB97]">
                    <Download className="size-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Contacts */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Media <span className="text-[#FE7F42]">Contacts</span>
              </h2>
              <p className="text-white/60 max-w-2xl">
                Our leadership team is available for interviews, commentary, and speaking opportunities.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {teamMembers.map((member, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FE7F42] to-[#B32C1A] opacity-20" />
                  
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-[#FE7F42] text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-white/60 text-sm mb-4">{member.bio}</p>
                  
                  <div className="flex justify-center gap-3">
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-[#FE7F42] p-2">
                      <Mail className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-[#FE7F42] p-2">
                      <Linkedin className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-[#FE7F42] p-2">
                      <Twitter className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className={`text-3xl md:text-4xl font-bold text-white mb-6 ${syne.className}`}>
                Follow <span className="text-[#FE7F42]">CredX</span>
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto mb-8">
                Stay updated with our latest announcements and industry insights
              </p>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 rounded-full">
                  <Twitter className="mr-2 size-5" /> Twitter
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 rounded-full">
                  <Linkedin className="mr-2 size-5" /> LinkedIn
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 rounded-full">
                  <Youtube className="mr-2 size-5" /> YouTube
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