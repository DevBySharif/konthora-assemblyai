'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Mic,
  ArrowRight,
  FileText,
  Volume2,
  Download,
  Printer,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-slate-100 pt-10 pb-20 md:pt-16 md:pb-28 border-b border-slate-800/80">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy & Actions */}
          <div className="text-center lg:text-left lg:col-span-7">
            {/* Hackathon Badge */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur shadow-sm shadow-emerald-950"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>AssemblyAI Voice Agent Hackathon 2026</span>
              <span className="text-emerald-500/50">|</span>
              <span className="font-mono text-emerald-400">AssemblyAI v3 + Groq + Kokoro</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.12]"
            >
              Transform Speech into{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Production-Ready Enterprise Documents
              </span>{' '}
              in Sub-Seconds
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Speak in English, Bangla, or Banglish. Konthora's autonomous voice operations engine listens via AssemblyAI v3, reasons via Groq, executes structured workflows, and generates verified enterprise documents with cryptographic SHA-256 seals and instant Kokoro voice feedback.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {/* Primary Action Button */}
              <Link
                href="/voice-agent"
                className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-7 text-base font-bold text-slate-950 shadow-[0_0_28px_rgba(16,185,129,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(16,185,129,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Mic className="h-5 w-5 text-slate-950" />
                <span>Launch Voice Production Engine</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button */}
              <a
                href="#architecture"
                className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-base font-semibold text-slate-200 backdrop-blur transition-all duration-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white"
              >
                <span>View Architecture & Docs</span>
              </a>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 text-left"
            >
              <div>
                <p className="text-2xl font-bold text-emerald-400 font-mono">&lt; 850ms</p>
                <p className="text-xs text-slate-400">Total Loop Latency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-400 font-mono">16kHz PCM</p>
                <p className="text-xs text-slate-400">Full-Duplex Stream</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400 font-mono">0 Egress</p>
                <p className="text-xs text-slate-400">Local Kokoro Synthesis</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Live Interactive Visualizer Preview */}
          <div className="lg:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
            >
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">konthora-voice-engine://live</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WebSocket v3 Active
                </div>
              </div>

              {/* Streaming Audio Visualizer Wave */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    16kHz PCM Audio Stream
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">Acoustic Echo Guard ON</span>
                </div>
                <div className="flex items-end justify-between gap-1 h-12 px-1">
                  {[28, 45, 70, 35, 85, 60, 95, 40, 75, 90, 50, 80, 65, 92, 45, 78, 38, 88, 55, 30].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-full rounded-full bg-gradient-to-t from-emerald-500 to-cyan-400"
                      animate={reduce ? undefined : { height: [`${h}%`, `${Math.max(15, (h * 1.3) % 100)}%`, `${h}%`] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Live Spoken Input Transcript */}
              <div className="mt-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Spoken Query (Multilingual / Banglish)</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  &ldquo;Create an invoice for <span className="text-emerald-400 font-semibold">Zenith Corp</span>: 3 Enterprise Voice Licenses at <span className="text-teal-300 font-semibold">$1,200 each</span>, payment due in 15 days.&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-400 font-semibold">AssemblyAI v3 (99.2% conf)</span>
                  <span>&rarr;</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300 font-semibold">Groq Tool: generate_invoice</span>
                </div>
              </div>

              {/* Document Output Card */}
              <div className="mt-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white">COMMERCIAL INVOICE #INV-2026-089</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                    GENERATED IN 780ms
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Billed To:</span>
                    <span className="font-semibold text-slate-200">Zenith Corp (Attn: Accounts)</span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <div className="flex justify-between font-mono text-[11px] text-slate-400 border-b border-slate-800 pb-1 mb-1">
                      <span>Item</span>
                      <span>Qty × Rate</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between text-slate-200 text-xs">
                      <span>Enterprise Voice Licenses</span>
                      <span className="text-slate-400">3 × $1,200</span>
                      <span className="font-mono text-emerald-400 font-semibold">$3,600.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-mono">
                    <span className="text-slate-400 text-xs">Total Due (Net 15):</span>
                    <span className="text-base font-bold text-emerald-300">$3,600.00</span>
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono">
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Kokoro: &ldquo;Invoice #089 prepared for Zenith Corp.&rdquo;</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
                      title="Download PDF"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
                      title="Print Document"
                    >
                      <Printer className="h-3 w-3" /> Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}