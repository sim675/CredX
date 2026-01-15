"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe, Mail, Phone, MessageCircle, HelpCircle, Search, ChevronDown, ChevronUp, Send, Clock, CheckCircle, AlertCircle, FileText, Users, TrendingUp } from "lucide-react"
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

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium">{question}</span>
        {isOpen ? (
          <ChevronUp className="size-5 text-[#FE7F42]" />
        ) : (
          <ChevronDown className="size-5 text-[#FE7F42]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-white/60 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support form submitted:', formData);
    // Handle form submission here
  };

  const faqData = [
    {
      question: "How do I create an invoice on CredX?",
      answer: "To create an invoice, sign up for an account, navigate to your dashboard, and click 'Create New Invoice'. Fill in the required details including amount, due date, and client information. Your invoice will be tokenized as an NFT on the Polygon Amoy testnet."
    },
    {
      question: "What are the fees for using CredX?",
      answer: "CredX charges a small platform fee of 1-2% on successful invoice financing. There are no upfront costs for creating invoices. Gas fees on the Polygon Amoy testnet are minimal."
    },
    {
      question: "How long does it take to get funded?",
      answer: "Once your invoice is verified by our risk engine, funding typically occurs within hours. The automated verification process ensures quick turnaround times for qualified invoices."
    },
    {
      question: "Is my data secure on CredX?",
      answer: "Yes, all invoice data is encrypted and stored securely. Invoices are tokenized as NFTs on the blockchain, providing immutable ownership records and transparency."
    },
    {
      question: "What types of businesses can use CredX?",
      answer: "CredX is designed for MSMEs (Micro, Small, and Medium Enterprises) across various industries. We support B2B invoices and work with businesses that have established trading relationships."
    }
  ];

  const supportCategories = [
    {
      icon: <FileText className="size-6" />,
      title: "Invoice Issues",
      description: "Problems with creating, managing, or funding invoices",
      color: "text-[#FFFB97]"
    },
    {
      icon: <Users className="size-6" />,
      title: "Account Support",
      description: "Login, registration, and account management help",
      color: "text-[#FE7F42]"
    },
    {
      icon: <TrendingUp className="size-6" />,
      title: "Technical Issues",
      description: "Platform bugs, wallet connections, and transaction problems",
      color: "text-[#B32C1A]"
    }
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
                How can we <span className="text-[#FE7F42]">help</span> you?
              </h1>
              <p className={`${cinzel.className} text-xl md:text-2xl text-white/80 mb-8`}>
                Support for your decentralized invoice financing journey
              </p>
              
              {/* Quick Search */}
              <div className="relative max-w-2xl mx-auto mb-12">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 size-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-3">
              {supportCategories.map((category, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
                >
                  <div className={`${category.color} mb-4 transform group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-white/60 text-sm">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form and FAQ */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2">
              
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
                <p className="text-white/60 mb-8">Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FE7F42] transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="account">Account Issues</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#FE7F42] transition-colors resize-none"
                      placeholder="Describe your issue or question in detail..."
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 rounded-full bg-[#FE7F42] text-[#2A1617] font-bold hover:bg-[#FFFB97] transition-all hover:scale-105"
                  >
                    Send Message <Send className="ml-2 size-4" />
                  </Button>
                </form>
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                <p className="text-white/60 mb-8">Quick answers to common questions about CredX</p>
                
                <div className="space-y-4">
                  {faqData.map((faq, i) => (
                    <FAQItem key={i} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Contact Options */}
        <section className="relative w-full py-16 px-4">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Other Ways to Reach Us</h2>
              <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Mail className="size-8 text-[#FE7F42] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                  <p className="text-white/60 text-sm mb-3">Get help via email</p>
                  <a href="mailto:support@credx.io" className="text-[#FE7F42] hover:text-[#FFFB97] transition-colors text-sm">
                    support@credx.io
                  </a>
                </div>
                
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <MessageCircle className="size-8 text-[#FFFB97] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
                  <p className="text-white/60 text-sm mb-3">Chat with our team</p>
                  <span className="text-[#FFFB97] text-sm">Available 9AM-6PM EST</span>
                </div>
                
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <Clock className="size-8 text-[#B32C1A] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Response Time</h3>
                  <p className="text-white/60 text-sm mb-3">Average response</p>
                  <span className="text-[#B32C1A] text-sm font-semibold">Under 24 hours</span>
                </div>
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
                <Link href="#" className="hover:text-white">Marketplace</Link>
                <Link href="#" className="hover:text-white">For MSMEs</Link>
                <Link href="#" className="hover:text-white">Risk Engine</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#FE7F42]">Contact</h4>
              <div className="flex flex-col gap-2 text-sm text-white/60">
                <Link href="/Support" className="hover:text-white transition-colors">Support</Link>
                <Link href="#" className="hover:text-white transition-colors">Sales</Link>
                <Link href="#" className="hover:text-white transition-colors">Media</Link>
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