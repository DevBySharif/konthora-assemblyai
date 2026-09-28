"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"invoice" | "financial" | "hr">("invoice");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-vesper-obsidian text-white min-h-screen overflow-y-auto relative font-sans selection:bg-white/20 selection:text-white scroll-smooth">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/60 via-black to-black pointer-events-none z-0" />

      {/* HERO SECTION */}
      <section id="voice-engine" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/20 text-[11px] text-neutral-300 mb-6 appear appear--pop" style={{ "--d": "0.22s" } as React.CSSProperties}>
            <span className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
            <span>AssemblyAI Voice Agent Hackathon 2026 | Powered by AssemblyAI</span>
          </div>

          <h1 className="hero-headline text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            <span className="block overflow-hidden appear appear--mask" style={{ "--d": "0.42s" } as React.CSSProperties}>
              Transform Speech into
            </span>
            <span className="block overflow-hidden appear appear--mask" style={{ "--d": "0.62s" } as React.CSSProperties}>
              <em className="font-vesper-serif text-neutral-300">Production-Ready</em> Enterprise
            </span>
            <span className="block overflow-hidden appear appear--mask" style={{ "--d": "0.72s" } as React.CSSProperties}>
              Documents in Sub-Seconds
            </span>
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed mb-8 appear appear--soft" style={{ "--d": "0.82s" } as React.CSSProperties}>
            Speak in English, Bangla, or Banglish. Konthora&apos;s autonomous voice operations engine uses AssemblyAI&apos;s managed Voice Agent API for real-time STT, LLM reasoning, and natural voice synthesis — all in a single WebSocket connection with sub-second response times.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link className="vesper-nav-pill px-6 py-3.5 text-xs md:text-sm font-semibold rounded-xl text-white hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]" href="/voice-agent">
              <span>Launch Voice Production Engine</span>
              <span>→</span>
            </Link>
            <a href="#architecture" className="vesper-nav-pill px-6 py-3.5 text-xs md:text-sm font-medium rounded-xl text-neutral-300 hover:text-white transition-all">
              View Architecture &amp; Docs
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-xs text-neutral-400">
            <div>
              <div className="text-neutral-300 font-mono font-bold text-sm mb-1">&lt; 850ms</div>
              <div>Total Loop Latency</div>
            </div>
            <div>
              <div className="text-neutral-300 font-mono font-bold text-sm mb-1">24kHz PCM</div>
              <div>Full-Duplex Stream</div>
            </div>
            <div>
              <div className="text-neutral-300 font-mono font-bold text-sm mb-1">Secure</div>
              <div>Enterprise-Grade Audio</div>
            </div>
          </div>
        </div>

        {/* Live Engine Terminal */}
        <div className="vesper-glass-card animate-vesper-in rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]" style={{ "--d": "0.3s" } as React.CSSProperties}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-neutral-400">
            <span className="text-neutral-300">konthora-voice-engine://live</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px]">● Voice Agent Active</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] mb-1">SPOKEN QUERY (MULTILINGUAL / BANGLISH)</div>
              <div className="text-neutral-200">&quot;Create an invoice for Zenith Corp: 3 Enterprise Voice Licenses at $1,200 each, payment due in 15 days.&quot;</div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/90 border border-white/15 space-y-2">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span className="text-neutral-300 font-bold">COMMERCIAL INVOICE #INV-2026-889</span>
                <span className="text-neutral-500">GENERATED IN 180ms</span>
              </div>
              <div className="text-neutral-300 text-xs">Billed To: <span className="font-semibold text-white">Zenith Corp (Attn: Accounts)</span></div>
              <div className="border-t border-neutral-800 pt-2 flex justify-between">
                <span>Enterprise Voice Licenses (3x $1,200)</span>
                <span className="font-bold text-white">$3,600.00</span>
              </div>
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-bold text-neutral-300">
                <span>Total Due (Net 15):</span>
                <span>$3,600.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section id="capabilities" className="appear appear--soft relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10" style={{ "--d": "0.3s" } as React.CSSProperties}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">Enterprise Document Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4 mb-4">Designed for Real-World Commercial Workflows</h2>
          <p className="text-neutral-400 text-sm">From client billing to HR onboarding and financial reporting, Konthora maps natural multilingual speech directly to structured business actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { num: "01", title: "24 Enterprise Document Types", desc: "Invoices, quotations, contracts, NDAs, financial reports, HR letters, purchase orders, and 16 more" },
            { num: "02", title: "Audio Upload & Analysis", desc: "Upload meeting recordings, interviews, or calls — Konthora transcribes, summarizes, and creates documents from audio" },
            { num: "03", title: "Persistent SQLite Database", desc: "All generated documents, clients, inventory, tasks, and financials stored in a relational database with full CRUD" },
            { num: "04", title: "Email & Notification Service", desc: "Send generated documents via email with formatted HTML templates, ready for real SMTP integration" },
          ].map((item, i) => (
            <div key={i} className="vesper-glass-card animate-vesper-in p-6 rounded-2xl hover:border-white/30 transition-all group">
              <div className="text-xs font-mono text-neutral-300 mb-4">{item.num}</div>
              <h3 className="text-base font-semibold mb-2 group-hover:text-neutral-200 transition-colors">{item.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE SECTION */}
      <section id="architecture" className="appear appear--soft relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10" style={{ "--d": "0.4s" } as React.CSSProperties}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">Sub-Second Pipeline Architecture</span>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4 mb-4">How Konthora Turns Soundwaves into Signed Documents</h2>
          <p className="text-neutral-400 text-sm">Engineered with AssemblyAI&apos;s managed Voice Agent API — a single WebSocket handling STT, LLM reasoning, and natural voice synthesis with built-in turn detection and tool calling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { stage: "STAGE 01", time: "~150 ms", title: "AssemblyAI Speech Capture", desc: "24kHz PCM AudioWorklet Stream" },
            { stage: "STAGE 02", time: "~180 ms", title: "Voice Agent LLM", desc: "Managed Inference & Tool Calling" },
            { stage: "STAGE 03", time: "~120 ms", title: "Anna Neural Voice", desc: "Managed TTS Synthesis" },
            { stage: "STAGE 04", time: "Instant (<50ms)", title: "Dynamic Document Card", desc: "Reactive DOM & Print/PDF Engine" },
          ].map((st, i) => (
            <div key={i} className="vesper-glass-card animate-vesper-in p-6 rounded-2xl hover:border-white/30 transition-all">
              <div className="flex justify-between items-center text-xs font-mono mb-4">
                <span className="text-neutral-400">{st.stage}</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300">{st.time}</span>
              </div>
              <h3 className="text-base font-semibold mb-2">{st.title}</h3>
              <p className="text-xs text-neutral-400">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* AEC Echo Guard Banner */}
        <div className="vesper-glass-card p-8 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-black border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Hardware &amp; Algorithmic Acoustic Echo Cancellation (AEC)</h3>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              When the agent speaks through your speakers, browser-native echo cancellation (AEC) and the mic mute gate prevent the voice agent from re-transcribing its own output — ensuring clean, uninterrupted conversations.
            </p>
          </div>
          <Link className="vesper-nav-pill px-6 py-3 rounded-xl text-white font-semibold text-xs hover:bg-neutral-200 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]" href="/voice-agent">
            Test Voice Agent →
          </Link>
        </div>
      </section>

      {/* INTERACTIVE SIMULATOR */}
      <section className="appear appear--soft relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-white/10" style={{ "--d": "0.5s" } as React.CSSProperties}>
        <div className="text-center mb-12">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">Interactive Engine Simulator</span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-2">See the Full-Duplex Flow in Action</h2>
          <p className="text-neutral-400 text-xs">Select an enterprise scenario below to simulate speech-to-document execution in under 850 milliseconds.</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: "invoice", label: "1. Commercial Invoice" },
            { id: "financial", label: "2. Financial Summary" },
            { id: "hr", label: "3. HR Employment Offer" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "invoice" | "financial" | "hr")}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="vesper-glass-card p-8 rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-neutral-300 text-[10px] block mb-1">Spoken Audio Prompt (24kHz Voice Agent)</span>
              {activeTab === "invoice" && (
                <p className="text-neutral-200 italic">&quot;Generate an invoice for CloudScale Technologies: 3 AI Integration Sprints at $4,500 each, Net 15 days payment terms.&quot;</p>
              )}
              {activeTab === "financial" && (
                <p className="text-neutral-200 italic">&quot;What were our Q1 2026 revenue, expenses, and EBITDA margins? Show me the comparison with Q2 projections.&quot;</p>
              )}
              {activeTab === "hr" && (
                <p className="text-neutral-200 italic">&quot;Draft an offer letter for Rafiqul Islam as Senior Full-Stack Engineer at 120,000 BDT monthly.&quot;</p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-amber-400 text-[10px] block mb-1">Voice Agent Tool Call</span>
              {activeTab === "invoice" && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-neutral-300">generate_invoice({'{ client: "CloudScale Technologies", amount: 13500 }'})</span></p>
              )}
              {activeTab === "financial" && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-neutral-300">query_financials({'{ period: "Q1-2026", metrics: ["revenue","ebitda"] }'})</span></p>
              )}
              {activeTab === "hr" && (
                <p className="text-neutral-300">Tool Dispatched: <span className="text-neutral-300">generate_hr_offer({'{ employee: "Rafiqul Islam", role: "Senior Full-Stack Engineer" }'})</span></p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900 border border-white/20 space-y-3 font-mono text-xs">
            {activeTab === "invoice" && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-neutral-300 font-bold">INVOICE #INV-2026-089</span>
                  <span className="text-neutral-300 bg-white/10 px-2 py-0.5 rounded">SUB-SECOND RENDER</span>
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
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300 font-bold text-sm">
                  <span>Total Balance Due:</span>
                  <span>$13,500.00 USD</span>
                </div>
              </>
            )}
            {activeTab === "financial" && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-neutral-300 font-bold">FINANCIAL BRIEF FY-2026</span>
                  <span className="text-neutral-300 bg-white/10 px-2 py-0.5 rounded">QUERY: 180ms</span>
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
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300 font-bold text-sm">
                  <span>EBITDA Margin</span>
                  <span>28.5%</span>
                </div>
              </>
            )}
            {activeTab === "hr" && (
              <>
                <div className="flex justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="text-neutral-300 font-bold">EMPLOYMENT OFFER #HR-2026-441</span>
                  <span className="text-neutral-300 bg-white/10 px-2 py-0.5 rounded">GENERATED: 160ms</span>
                </div>
                <div className="text-white font-bold text-sm">Rafiqul Islam</div>
                <div className="text-neutral-300">Role: <span className="text-white">Senior Full-Stack Engineer</span></div>
                <div className="flex justify-between text-neutral-300">
                  <span>Monthly Salary</span>
                  <span className="text-white font-bold">৳120,000 BDT</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Annual CTC</span>
                  <span className="text-white font-bold">৳1,440,000 BDT</span>
                </div>
                <div className="border-t border-neutral-800 pt-2 flex justify-between text-neutral-300 font-bold text-sm">
                  <span>Start Date</span>
                  <span>October 1, 2026</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL SECTION */}
      <section className="appear appear--soft relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/10" style={{ "--d": "0.6s" } as React.CSSProperties}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">Multilingual &amp; Code-Switching Speech</span>
            <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-4">Speak Naturally in English, Bangla, or Banglish</h2>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Konthora&apos;s NLU pipeline seamlessly parses mixed-language utterances, extracting structured entities regardless of the speaker&apos;s native tongue or code-switching pattern.
            </p>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Native English professional speech</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Banglish transliteration &amp; mixed syntax</li>
              <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Native Bangla (বাংলা) full utterances</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="vesper-glass-card animate-vesper-in p-5 rounded-2xl">
              <div className="text-[10px] font-mono text-neutral-300 mb-2">ENGLISH</div>
              <p className="text-sm text-neutral-200 italic">&quot;Generate an invoice for Acme Corp for three enterprise voice licenses at twelve hundred dollars each.&quot;</p>
              <div className="mt-3 text-[10px] font-mono text-neutral-500">→ Parsed: 3 × $1,200 = $3,600.00</div>
            </div>
            <div className="vesper-glass-card animate-vesper-in p-5 rounded-2xl">
              <div className="text-[10px] font-mono text-neutral-300 mb-2">BANGLISH</div>
              <p className="text-sm text-neutral-200 italic">&quot;Acme Corp er jonno invoice banao, teen ta enterprise license, each twelve hundred dollar.&quot;</p>
              <div className="mt-3 text-[10px] font-mono text-neutral-500">→ Parsed: 3 × $1,200 = $3,600.00</div>
            </div>
            <div className="vesper-glass-card animate-vesper-in p-5 rounded-2xl">
              <div className="text-[10px] font-mono text-neutral-300 mb-2">BANGLA (বাংলা)</div>
              <p className="text-sm text-neutral-200 italic">&quot;Acme Corp এর জন্য একটা ইনভয়েস তৈরি করো, তিনটা এন্টারপ্রাইজ ভয়েস লাইসেন্স, প্রতিটা বারো শত ডলার।&quot;</p>
              <div className="mt-3 text-[10px] font-mono text-neutral-500">→ Parsed: 3 × $1,200 = $3,600.00</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="appear appear--soft relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-white/10" style={{ "--d": "0.7s" } as React.CSSProperties}>
        <div className="text-center mb-16">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">Frequently Asked Questions</span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-2">Everything You Need to Know About Konthora</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "What makes Konthora different from generic transcription or TTS tools?", a: "Konthora is a full-duplex enterprise voice production engine powered by AssemblyAI's managed Voice Agent API — handling STT, LLM reasoning, and natural voice synthesis in a single connection with built-in tool calling." },
            { q: "How is sub-second latency achieved?", a: "AssemblyAI's Voice Agent API manages the entire pipeline in one WebSocket: real-time speech capture, LLM inference, and neural voice synthesis — eliminating network hops between separate services." },
            { q: "Does Konthora support Bangla and Banglish code-switching?", a: "Yes. The system parses mixed-mode English, Banglish, and native Bangla queries, extracting parameters and converting currencies seamlessly." },
            { q: "What enterprise documents can Konthora generate?", a: "24 document types across 6 categories: Financial (invoices, quotations, receipts, sales orders, credit notes, purchase orders), HR (offer letters, employment contracts, salary revisions, experience certificates), Reporting (financial summaries, budget reports, expense reports, tax summaries), Client Ops (onboarding packs, proposals, meeting minutes, NDAs), Inventory (reports, alerts, transfer orders, purchase requisitions), and Project Management (plans, status reports, milestone reviews, task assignments) — all with SHA-256 cryptographic seals." },
            { q: "Can I upload audio files instead of using voice?", a: "Yes. Upload meeting recordings, interviews, or calls in MP3, WAV, WebM, or M4A format. Konthora transcribes via AssemblyAI, generates a summary, and lets you create documents from the transcription using natural language follow-up commands." },
            { q: "How does the database work?", a: "Konthora uses SQLite with SQLAlchemy ORM, storing all generated documents, clients, inventory items, tasks, financials, calendar events, and staff records. Seeded with realistic sample data on every cold start. Upgrade to PostgreSQL by setting the DATABASE_URL environment variable." },
            { q: "Is my voice data secure?", a: "Audio is processed by AssemblyAI's Voice Agent API with enterprise-grade security. Document generation happens on our backend. Voice data is never stored beyond the active session. All documents are persisted locally in the SQLite database." },
            { q: "How does echo cancellation work?", a: "Browser-native AEC (echo cancellation) handles speaker-to-mic feedback automatically. Additionally, the mic worklet mutes audio during agent speech to prevent any residual echo." },
          ].map((faq, index) => (
            <div key={index} className="vesper-glass-card rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full p-5 text-left flex justify-between items-center text-sm font-semibold hover:text-neutral-300 transition-colors">
                <span>{faq.q}</span>
                <span className="text-neutral-300 text-lg">{openFaq === index ? "−" : "+"}</span>
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

      {/* FINAL CTA */}
      <section className="appear appear--pop relative z-10 max-w-5xl mx-auto px-6 py-20" style={{ "--d": "0.8s" } as React.CSSProperties}>
        <div className="vesper-glass-card p-12 rounded-3xl text-center relative overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.08)] border border-white/20">
          <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-neutral-300 text-xs font-mono mb-6 inline-block">
            ● AssemblyAI Voice Agent Hackathon 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold mb-4">Ready to Hear Your Enterprise Run?</h2>
          <p className="text-neutral-400 text-sm mb-8 max-w-xl mx-auto">
            Konthora transforms spoken word into signed, structured enterprise documents in under 850 milliseconds. No typing. No templates. Just voice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link className="vesper-nav-pill px-8 py-4 rounded-xl text-white font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]" href="/voice-agent">
              Launch Voice Production Engine →
            </Link>
            <a href="https://github.com/DevBySharif/konthora-assemblyai" target="_blank" rel="noopener noreferrer" className="vesper-nav-pill px-8 py-4 rounded-xl text-neutral-300 font-semibold text-sm hover:text-white transition-all">
              View GitHub Repository
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
