'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'invoice' | 'financial' | 'hr'>('invoice');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-y-auto relative font-sans selection:bg-emerald-500 selection:text-black scroll-smooth">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/60 via-black to-black pointer-events-none z-0" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7.3" cy="3.2" r="1.45" />
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <circle cx="16.7" cy="20.8" r="1.45" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-base">
              Konthora <span className="text-emerald-400 font-normal">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/90 p-1.5 rounded-xl border border-white/10 shadow-2xl">
            <a href="#voice-engine" className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">Voice Engine</a>
            <a href="#capabilities" className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">Enterprise Capabilities</a>
            <a href="#architecture" className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">Architecture</a>
          </nav>

          <Link className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-400 text-black hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]" href="/voice-agent">
            Live Demo →
          </Link>
        </div>
      </header>

      {/* SECTION 1: HERO & LIVE TERMINAL SIMULATION */}
      <section id="voice-engine" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-emerald-500/30 text-[11px] text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AssemblyAI Voice Agent Hackathon 2026 | AssemblyAI v3 + Groq + Kokoro</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            Transform Speech into{' '}
            <span className="font-serif italic font-normal text-emerald-400">Production-Ready</span>{' '}
            Enterprise Documents in Sub-Seconds
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-8">
            Speak in English, Bangla, or Banglish. Konthora&apos;s autonomous voice operations engine listens via AssemblyAI v3, reasons via Groq, executes structured workflows, and generates verified enterprise documents with cryptographic SHA-256 seals and instant Kokoro voice feedback.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link className="px-6 py-3.5 text-xs md:text-sm font-semibold rounded-xl bg-emerald-400 text-black hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)]" href="/voice-agent">
              <span>Launch Voice Production Engine</span>
              <span>→</span>
            </Link>
            <a href="#architecture" className="px-6 py-3.5 text-xs md:text-sm font-medium rounded-xl bg-neutral-900 text-neutral-300 border border-white/15 hover:border-white/30 transition-all">
              View Architecture &amp; Docs
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-neutral-400">
            <div>
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">&lt; 850ms</div>
              <div>Total Loop Latency</div>
            </div>
            <div>
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">16kHz PCM</div>
              <div>Full-Duplex Stream</div>
            </div>
            <div>
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">0 Egress</div>
              <div>Local Kokoro Synthesis</div>
            </div>
          </div>
        </div>

        {/* Right Hero Card - Live Engine Code Preview */}
        <div className="bg-neutral-950/80 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-neutral-400">
            <span className="text-emerald-400">konthora-voice-engine://live</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">● WebSocket v3 Active</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] mb-1">SPOKEN QUERY (MULTILINGUAL / BANGLISH)</div>
              <div className="text-emerald-300">&quot;Create an invoice for Zenith Corp: 3 Enterprise Voice Licenses at $1,200 each, payment due in 15 days.&quot;</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span className="text-emerald-400 font-bold">COMMERCIAL INVOICE #INV-2026-889</span>
                <span className="text-neutral-500">GENERATED IN 180ms</span>
              </div>
              <div className="text-neutral-300 text-xs">Billed To: <span className="font-semibold text-white">Zenith Corp (Attn: Accounts)</span></div>
              <div className="border-t border-neutral-800 pt-2 flex justify-between">
                <span>Enterprise Voice Licenses (3x $1,200)</span>
                <span className="font-bold text-white">$3,600.00</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-bold text-emerald-400">
                <span>Total Due (Net 15):</span>
                <span>$3,600.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ENTERPRISE CAPABILITIES & CORE TOOLS */}
      <section id="capabilities" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">Enterprise Document Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4 mb-4">Designed for Real-World Commercial Workflows</h2>
          <p className="text-neutral-400 text-sm">From client billing to HR onboarding and financial reporting, Konthora maps natural multilingual speech directly to structured business actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { num: '01', title: 'Voice-to-Invoice & Quotations', desc: 'Itemized billing, tax rules, and instant multi-currency computation' },
            { num: '02', title: 'Instant Financial & Revenue Reports', desc: 'Quarterly variance, EBITDA margins, and executive summaries' },
            { num: '03', title: 'HR Offer Letters & Contracts', desc: 'Employment terms, vesting schedules, and non-disclosure clauses' },
            { num: '04', title: 'Sub-Second Latency & Acoustic Echo Guard', desc: 'Zero audio echo loop, full-duplex conversational streaming' },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 transition-all group">
              <div className="text-xs font-mono text-emerald-400 mb-4">{item.num}</div>
              <h3 className="text-base font-semibold mb-2 group-hover:text-emerald-300 transition-colors">{item.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">{item.desc}</p>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore preview →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PIPELINE ARCHITECTURE (STAGE 01 - 04) */}
      <section id="architecture" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">Sub-Second Pipeline Architecture</span>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4 mb-4">How Konthora Turns Soundwaves into Signed Documents</h2>
          <p className="text-neutral-400 text-sm">Engineered with a full-duplex conversational loop connecting AssemblyAI v3, Groq LPU inference, and local Kokoro-82M neural audio synthesis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { stage: 'STAGE 01', time: '~150 ms', title: 'AssemblyAI Streaming v3', desc: '16kHz PCM WebSocket Stream' },
            { stage: 'STAGE 02', time: '~180 ms', title: 'Groq LLM Decision Engine', desc: 'Llama-3.3-70B Structured JSON' },
            { stage: 'STAGE 03', time: '~120 ms', title: 'Local Kokoro-82M Neural TTS', desc: 'Zero-Egress On-Device Synthesis' },
            { stage: 'STAGE 04', time: 'Instant (<50ms)', title: 'Dynamic Document Card', desc: 'Reactive DOM & Print/PDF Engine' },
          ].map((st, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-950 border border-white/10 hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-center text-xs font-mono mb-4">
                <span className="text-neutral-400">{st.stage}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{st.time}</span>
              </div>
              <h3 className="text-base font-semibold mb-2">{st.title}</h3>
              <p className="text-xs text-neutral-400">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* AEC Echo Guard Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-black border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Hardware &amp; Algorithmic Acoustic Echo Cancellation (AEC)</h3>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              When Kokoro speaks the confirmation through laptop or desktop speakers, Konthora&apos;s audio gate dampens playback frequency bleeding, preventing AssemblyAI from re-transcribing the assistant&apos;s own voice.
            </p>
          </div>
          <Link className="px-6 py-3 rounded-xl bg-emerald-400 text-black font-semibold text-xs hover:bg-emerald-300 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.3)]" href="/voice-agent">
            Test Voice Agent →
          </Link>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE FULL-DUPLEX SIMULATOR */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">Interactive Engine Simulator</span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-2">See the Full-Duplex Flow in Action</h2>
          <p className="text-neutral-400 text-xs">Select an enterprise scenario below to simulate speech-to-document execution in under 850 milliseconds.</p>
        </div>

        {/* Selector Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: 'invoice', label: '1. Commercial Invoice' },
            { id: 'financial', label: '2. Financial Summary' },
            { id: 'hr', label: '3. HR Employment Offer' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'invoice' | 'financial' | 'hr')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Preview Card */}
        <div className="p-8 rounded-2xl bg-neutral-950 border border-white/15 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-emerald-400 text-[10px] block mb-1">Spoken Audio Prompt (AssemblyAI v3 16kHz)</span>
              {activeTab === 'invoice' && (
                <p className="text-neutral-200 italic">&quot;Generate an invoice for CloudScale Technologies: 3 AI Integration Sprints at $4,500 each, Net 15 days payment terms.&quot;</p>
              )}
              {activeTab === 'financial' && (
                <p className="text-neutral-200 italic">&quot;What were our Q1 2026 revenue, expenses, and EBITDA margins? Show me the comparison with Q2 projections.&quot;</p>
              )}
              {activeTab === 'hr' && (
                <p className="text-neutral-200 italic">&quot;Draft an offer letter for Rafiqul Islam as Senior Full-Stack Engineer at 120,000 BDT monthly.&quot;</p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 text-[10px] block mb-1">Groq Decision Engine (180ms)</span>
              {activeTab === 'invoice' && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-emerald-400">generate_invoice({'{ client: "CloudScale Technologies", amount: 13500 }'})</span></p>
              )}
              {activeTab === 'financial' && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-emerald-400">query_financials({'{ period: "Q1-2026", metrics: ["revenue","ebitda"] }'})</span></p>
              )}
              {activeTab === 'hr' && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-emerald-400">generate_hr_offer({'{ employee: "Rafiqul Islam", role: "Senior Full-Stack Engineer" }'})</span></p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900 border border-emerald-500/30 space-y-3 font-mono text-xs">
            {activeTab === 'invoice' && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-emerald-400 font-bold">INVOICE #INV-2026-089</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">SUB-SECOND RENDER</span>
                </div>
                <div className="text-white font-bold text-sm">CloudScale Technologies Inc.</div>
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Issue Date: Sep 25, 2026</span>
                  <span>Terms: Net 15 Days</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300">
                  <span>AI Integration Sprints (3 @ $4,500/ea)</span>
                  <span className="text-white font-bold">$13,500.00</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                  <span>Total Balance Due:</span>
                  <span>$13,500.00 USD</span>
                </div>
              </>
            )}
            {activeTab === 'financial' && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-emerald-400 font-bold">FINANCIAL BRIEF FY-2026</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">QUERY: 180ms</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300">
                  <span>Q1 Revenue</span>
                  <span className="text-white font-bold">$142,000</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Q1 Expenses</span>
                  <span className="text-white font-bold">$85,000</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Net Profit</span>
                  <span className="text-white font-bold">$57,000</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                  <span>EBITDA Margin</span>
                  <span>28.5%</span>
                </div>
              </>
            )}
            {activeTab === 'hr' && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-emerald-400 font-bold">HR APPOINTMENT LETTER #EMP-1041</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">GENERATED IN 160ms</span>
                </div>
                <div className="text-white font-bold text-sm">Rafiqul Islam</div>
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Position: Senior Full-Stack Engineer</span>
                  <span>Dept: Engineering</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300">
                  <span>Annual Compensation</span>
                  <span className="text-white font-bold">1,440,000 BDT</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-emerald-400 font-bold text-sm">
                  <span>Reporting Manager</span>
                  <span>Sarah Jenkins (CTO)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: MULTILINGUAL & CODE-SWITCHING SPEECH */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">Multilingual &amp; Code-Switching Speech</span>
            <h2 className="text-3xl md:text-5xl font-semibold mt-4 mb-6 leading-tight">Seamlessly Converse in English, Bangla, or Banglish</h2>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Global teams don&apos;t speak in sterile textbook sentences. Konthora&apos;s speech-to-document engine handles bilingual mixed-mode speech, slang, and phonetic syntax without missing a decimal point.
            </p>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Zero-latency code-switching between English technical jargon and regional speech</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Automatic currency normalizer: USD ($), BDT (৳), EUR (€), GBP (£)</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Robust acoustic handling for noisy work environments and conference mics</li>
            </ul>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-emerald-400 text-[10px] block mb-1">English (US / UK / Global)</span>
              <p className="text-neutral-200">&quot;Create an invoice for Apex Digital: 40 hours of cloud consulting at $85/hour with 5% tax.&quot;</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-emerald-400 text-[10px] block mb-1">Banglish (Phonetic Bengali / Code-Switching)</span>
              <p className="text-neutral-200">&quot;Apex Digital er jonno ekta invoice banau: 40 ghonta cloud consulting rate 85 dollar, 5 percent tax shoho.&quot;</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-emerald-400 text-[10px] block mb-1">Standard Bangla</span>
              <p className="text-neutral-200">&quot;অ্যাপেক্স ডিজিটাল এর জন্য একটি ইনভয়েস তৈরি করুন: প্রতি ঘণ্টা ৮৫ ডলার হারে ৪০ ঘণ্টা ক্লাউড কনসাল্টিং।&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-white/10">
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">Frequently Asked Questions</span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-2">Everything You Need to Know About Konthora</h2>
          <p className="text-neutral-400 text-xs">Built for the AssemblyAI Voice Agent Hackathon 2026.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What makes Konthora different from generic transcription or TTS tools?',
              a: 'Unlike simple transcribe or text-to-speech tools, Konthora is a complete, full-duplex enterprise voice production engine. It doesn\'t just transcribe audio; it reasons in real-time via Groq, executes structured business tool schemas (like generate_invoice or generate_hr_offer_letter), and instantly produces downloadable corporate documents with local Kokoro audio confirmation.',
            },
            {
              q: 'How is sub-second latency achieved across the entire pipeline?',
              a: 'Sub-second turnaround is achieved by pairing AssemblyAI v3 streaming WebSocket transcription (~150ms) with Groq LPU inference (~180ms) and on-device Kokoro-82M neural TTS (~120ms).',
            },
            {
              q: 'How does Acoustic Echo Cancellation (AEC) prevent feedback loops?',
              a: 'Konthora monitors active speech synthesis playback and temporarily dampens the microphone audio ingestion gate during TTS output, ensuring AssemblyAI does not re-transcribe the system\'s own audio.',
            },
            {
              q: 'Does Konthora support Bangla and Banglish code-switching?',
              a: 'Yes. The system parses mixed-mode English, Banglish, and native Bangla queries, extracting parameters and converting currencies seamlessly.',
            },
            {
              q: 'Can I export, print, or edit the generated documents?',
              a: 'Yes. Every document features live voice revision capabilities, clean PDF export stylesheets, and scan-verifiable SHA-256 cryptographic seals with QR codes.',
            },
            {
              q: 'Is my enterprise audio data private and secure?',
              a: 'All voice data processing utilizes PII sanitization guardrails to mask sensitive tax numbers, card digits, and personal identifiers.',
            },
          ].map((faq, index) => (
            <div key={index} className="rounded-xl bg-neutral-950 border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-5 text-left flex justify-between items-center text-sm font-semibold hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-emerald-400 text-lg">{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && (
                <div className="p-5 pt-0 text-xs text-neutral-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: FINAL CTA CALLOUT CARD */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="p-12 rounded-3xl bg-neutral-950 border border-emerald-500/30 text-center relative overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.15)]">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-6 inline-block">
            ● AssemblyAI Voice Agent Hackathon 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold mb-6 max-w-2xl mx-auto leading-tight">
            Ready to Generate Enterprise Documents at the Speed of Speech?
          </h2>
          <p className="text-neutral-400 text-xs md:text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Experience sub-second full-duplex voice intelligence. Speak in English, Bangla, or Banglish, and let Konthora build downloadable, audit-ready commercial assets in real-time.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link className="px-8 py-4 text-xs md:text-sm font-semibold rounded-xl bg-emerald-400 text-black hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]" href="/voice-agent">
              <span>Launch Voice Production Engine</span>
              <span>→</span>
            </Link>
            <a href="https://github.com/DevBySharif/konthora-assemblyai" target="_blank" rel="noreferrer" className="px-8 py-4 text-xs md:text-sm font-medium rounded-xl bg-neutral-900 text-white border border-white/15 hover:border-white/30 transition-all flex items-center gap-2">
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 8: COMPLETE 5-COLUMN ENTERPRISE FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-neutral-950 py-16 px-8 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="font-semibold text-white text-base flex items-center gap-2">
              <span>Konthora AI</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold leading-tight">
              Konthora — Autonomous Voice-Driven Enterprise Operations Engine
            </p>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">AssemblyAI v3</span>
              <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">Groq 70B</span>
              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">Kokoro-82M</span>
            </div>
          </div>

          {/* Column 1: Voice Engine */}
          <div className="space-y-3">
            <h4 className="font-mono text-white uppercase text-[11px] tracking-wider">Voice Engine</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><Link className="hover:text-emerald-400 transition-colors" href="/voice-agent">Launch Voice Engine</Link></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">AssemblyAI v3 WebSocket Docs ↗</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Groq Speed Benchmarks ↗</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Kokoro-82M Neural Synthesis ↗</a></li>
            </ul>
          </div>

          {/* Column 2: Capabilities */}
          <div className="space-y-3">
            <h4 className="font-mono text-white uppercase text-[11px] tracking-wider">Capabilities</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">Voice-to-Invoice &amp; Quotations</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">Instant Financial Reports</a></li>
              <li><a href="#capabilities" className="hover:text-emerald-400 transition-colors">HR Offer Letters &amp; Contracts</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Acoustic Echo Cancellation</a></li>
            </ul>
          </div>

          {/* Column 3: Architecture */}
          <div className="space-y-3">
            <h4 className="font-mono text-white uppercase text-[11px] tracking-wider">Architecture</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">16kHz PCM Speech Capture</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Groq Structured Tool Dispatch</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Local Voice Confirmation</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400 transition-colors">Dynamic Document Render</a></li>
            </ul>
          </div>

          {/* Column 4: Project & Legal */}
          <div className="space-y-3">
            <h4 className="font-mono text-white uppercase text-[11px] tracking-wider">Project &amp; Legal</h4>
            <ul className="space-y-2 text-neutral-400 text-[11px]">
              <li><a href="https://github.com/DevBySharif/konthora-assemblyai" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">GitHub Repository ↗</a></li>
              <li><a href="/about" className="hover:text-emerald-400 transition-colors">About Project</a></li>
              <li><a href="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>&copy; 2026 Konthora AI. Developed for AssemblyAI Voice Agent Hackathon 2026.</div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            AssemblyAI Voice Agent Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
