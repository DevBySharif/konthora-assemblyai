'use client';

import Link from 'next/link';
import React from 'react';

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen h-[100dvh] overflow-hidden relative font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/60 via-black to-black pointer-events-none z-0" />

      {/* 1. Header Navigation */}
      <header className="relative z-20 grid grid-cols-3 items-center px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <Link className="flex items-center gap-2 justify-self-start group" href="/">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7.3" cy="3.2" r="1.45" />
              <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <circle cx="16.7" cy="20.8" r="1.45" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-base">
            Konthora<span className="text-emerald-400 font-normal">.ai</span>
          </span>
        </Link>

        {/* Liquid Metal Nav Pills */}
        <nav className="flex items-center gap-2 justify-self-center bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
          {['Benefits', 'Architecture', 'Security', 'Workflows'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-all"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <Link
          className="justify-self-end px-5 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          href="/voice-agent"
        >
          Launch Engine →
        </Link>
      </header>

      {/* 2. Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto my-auto">
        {/* Metallic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-900 to-black border border-white/15 text-xs text-neutral-300 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Autonomous Voice Operations Engine</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-white mb-6">
          Automate{' '}
          <span className="font-serif italic font-normal text-neutral-400">
            Voice Operations
          </span>{' '}
          in
          <br />
          enterprise workflows instantly.
        </h1>

        {/* Lede Subtitle */}
        <p className="text-sm md:text-base text-neutral-400 max-w-xl font-normal leading-relaxed mb-8">
          Deploy full-duplex AI voice engines that query enterprise databases,
          execute stateful document revisions, and seal cryptographic audit
          approvals in real time.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            className="px-6 py-3 text-xs md:text-sm font-semibold rounded-xl bg-white text-black hover:bg-neutral-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center gap-2"
            href="/voice-agent"
          >
            <span>Launch Voice Engine</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <a
            href="#capabilities"
            className="px-6 py-3 text-xs md:text-sm font-medium rounded-xl bg-neutral-900/90 text-neutral-300 border border-white/15 hover:border-white/30 hover:text-white transition-all backdrop-blur-md"
          >
            Explore Capabilities
          </a>
        </div>
      </main>

      {/* 3. Stats Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl py-6 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
              &lt;100ms
            </span>
            <span>Full-Duplex Barge-In Latency</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
              99.9%
            </span>
            <span>Cryptographic Audit Integrity (SHA-256)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
              15+
            </span>
            <span>Autonomous B2B Workflows Supported</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
