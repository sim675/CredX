"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Github, Linkedin } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Syne, Archivo_Black } from "next/font/google"
import { Cinzel } from "next/font/google"
import { Playfair_Display } from "next/font/google"

// Define the font configuration
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

// --- FONTS ---
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

// --- THEME ---
const THEME = {
  highlight: '#EAF2EF', 
  mid: '#912F56',       
  core: '#521945',      
  bg: '#0D090A',        
};

// --- COMPONENT: LIQUID BACKGROUND ---
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

export default function TermsPage() {
  const [introFinished, setIntroFinished] = useState(false);

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
                  [ TERMS ]
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
        className="px-4 lg:px-6 h-20 flex items-center border-b border-white/5 backdrop-blur-sm sticky top-0 z-40"
      >
        <Link className="flex items-center justify-center" href="/">
          <span className="text-4xl font-pirate tracking-tight text-white transition-colors duration-200 hover:text-[#C51077] cursor-pointer font-bold">CredX</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4 rounded-full px-2 py-1 sm:px-4 sm:py-2 bg-white/5 backdrop-blur-xl border border-white/5 shadow-2xl">
          <Link href="#features" className="text-xs sm:text-sm font-medium text-white/70 px-4 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all">Features</Link>
          <Link href="#how-it-works" className="text-xs sm:text-sm font-medium text-white/70 px-4 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all">Process</Link>
          <Link href="/auth/signin"><Button variant="ghost" size="sm" className="hidden sm:inline-flex text-white hover:text-[#912F56] hover:bg-white/5 rounded-full">Sign In</Button></Link>
          <Link href="/auth/signup"><Button size="sm" className="rounded-full px-6 bg-[#912F56] text-white font-bold hover:bg-[#EAF2EF] hover:scale-105 transition-all">Create Account</Button></Link>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
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
                className="space-y-2"
              >
                <div className={`flex flex-col items-center w-full max-w-[100vw] overflow-hidden ${syne.className}`}>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-normal uppercase text-white mix-blend-overlay text-center px-4">
                    Terms &
                  </h1>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-normal uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/0 -mt-1 sm:-mt-2 md:-mt-4 text-center px-4">
                    Conditions
                  </h1>
                </div>
              </motion.div>
              <br />
              <br />

              <motion.div 
                initial="hidden"
                animate={introFinished ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.6, duration: 0.8 } 
                  }
                }}
                className="max-w-[800px] flex flex-col items-center gap-6"
              >
                <h2 className={`${cinzel.className} text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-center`}>
                  Last updated: December 27, 2025
                </h2>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TERMS CONTENT */}
        <div style={{ opacity: introFinished ? 1 : 0, pointerEvents: introFinished ? 'auto' : 'none', transition: 'opacity 1s ease-in-out' }}>
          <section className="relative w-full py-24 md:py-36">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
              <div className="space-y-12">
                {[
                  {
                    title: "Acceptance of Terms",
                    content: "By accessing or using CredX platform (\"Platform\"), you agree to be bound by these Terms and Conditions (\"Terms\"). If you do not agree with any part of these Terms, you must not use our Platform."
                  },
                  {
                    title: "Platform Nature",
                    content: "CredX is a technology platform that connects MSMEs with investors for invoice financing using blockchain technology. Please note that:",
                    list: [
                      "We are not a bank or financial institution",
                      "We do not provide financial, legal, or tax advice",
                      "We do not guarantee returns on investments",
                      "We are not a party to the agreements between MSMEs and investors"
                    ]
                  },
                  {
                    title: "User Responsibilities",
                    content: "By using CredX, you agree to:",
                    list: [
                      "Provide accurate and complete information",
                      "Maintain the security of your account credentials",
                      "Comply with all applicable laws and regulations",
                      "Not engage in fraudulent or illegal activities",
                      "Be solely responsible for your wallet and private keys",
                      "Conduct your own due diligence before making investment decisions"
                    ]
                  },
                  {
                    title: "Risk Disclosure",
                    content: "Using CredX involves certain risks that you should understand:",
                    list: [
                      { strong: "Investment Risk:", text: "Invoice financing carries risk of non-payment or delayed payment" },
                      { strong: "Blockchain Risk:", text: "Smart contracts are immutable and transactions cannot be reversed" },
                      { strong: "Technology Risk:", text: "The Platform may experience downtime or technical issues" },
                      { strong: "Regulatory Risk:", text: "Laws and regulations may change and affect the Platform's operations" },
                      { strong: "Market Risk:", text: "The value of digital assets may fluctuate" }
                    ]
                  },
                  {
                    title: "No Guarantees",
                    content: "CredX makes no representations, warranties, or guarantees regarding:",
                    list: [
                      "The accuracy or completeness of any information on the Platform",
                      "The performance or profitability of any investment",
                      "The uninterrupted or error-free operation of the Platform",
                      "The quality, safety, or legality of any invoice or transaction"
                    ]
                  },
                  {
                    title: "Limitation of Liability",
                    content: "To the maximum extent permitted by law, CredX and its affiliates shall not be liable for:",
                    list: [
                      "Any direct, indirect, incidental, or consequential damages",
                      "Loss of profits, revenue, or data",
                      "Errors or inaccuracies in the Platform's content",
                      "Unauthorized access to or use of your account",
                      "Actions or inactions of other users or third parties"
                    ]
                  },
                  {
                    title: "Governing Law",
                    content: "These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be resolved in the courts of [Your Jurisdiction]."
                  },
                  {
                    title: "Changes to Terms",
                    content: "We reserve the right to modify these Terms at any time. We'll notify you of significant changes through the Platform or via email. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms."
                  }
                ].map((section, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ 
                      type: "spring", 
                      bounce: 0.4, 
                      duration: 1,
                      delay: i * 0.1 
                    }}
                    className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden hover:bg-white/10 transition-colors hover:shadow-2xl hover:shadow-[#912F56]/10"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#521945] via-[#912F56] to-[#EAF2EF] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{section.title}</h3>
                    
                    <p className="text-white/80 leading-relaxed mb-4">
                      {section.content}
                    </p>
                    
                    {section.list && (
                      <ul className="list-disc pl-5 space-y-2">
                        {section.list.map((item, j) => (
                          <li key={j} className="text-white/70">
                            {typeof item === 'string' ? (
                              item
                            ) : (
                              <>
                                <span className="font-medium text-[#912F56]">{item.strong}</span> {item.text}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
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
                <p className="text-xs text-white/30 font-mono">© 2026 CredX Protocol.</p>
                <div className="text-xs text-white/30 font-mono">Polygon Amoy Testnet</div>
              </div>
            </div>
          </footer>
      </div>
    </div>
  );
}
