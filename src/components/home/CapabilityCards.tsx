'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  FileCheck2,
  Zap,
  Mic,
  ArrowRight,
  Printer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface Capability {
  id: string;
  badge: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  voicePrompt: string;
  toolCall: string;
  accentColor: string;
  preview: {
    docType: string;
    docNumber: string;
    entity: string;
    details: { label: string; value: string }[];
    rows?: { item: string; qty: string; amount: string }[];
    totalLabel?: string;
    totalAmount?: string;
  };
}

const capabilities: Capability[] = [
  {
    id: 'invoices',
    badge: 'Core Tool: generate_invoice',
    icon: FileText,
    title: 'Voice-to-Invoice & Quotations',
    tagline: 'Itemized billing, tax rules, and instant multi-currency computation',
    description:
      'Dictate client accounts, hourly rates, project deliverables, and payment terms in natural speech. Konthora auto-computes taxes and line discounts, validates commercial schemas via Groq, and renders exportable invoices in sub-seconds.',
    voicePrompt:
      '“Generate an invoice for CloudScale Technologies: 3 AI Integration Sprints at $4,500 each, Net 15 days payment terms.”',
    toolCall: 'generate_invoice({ client: "CloudScale Technologies", items: [...], currency: "USD", terms: "Net 15" })',
    accentColor: 'from-emerald-500 to-teal-400',
    preview: {
      docType: 'COMMERCIAL INVOICE',
      docNumber: 'INV-2026-089',
      entity: 'CloudScale Technologies Inc.',
      details: [
        { label: 'Issue Date', value: 'September 25, 2026' },
        { label: 'Payment Terms', value: 'Net 15 Days' },
        { label: 'Tax ID', value: 'US-84920193' },
      ],
      rows: [
        { item: 'AI Integration Sprint (Phase 1)', qty: '1', amount: '$4,500.00' },
        { item: 'Custom Model Fine-Tuning & Pipeline', qty: '2', amount: '$9,000.00' },
      ],
      totalLabel: 'Total Balance Due',
      totalAmount: '$13,500.00 USD',
    },
  },
  {
    id: 'financial',
    badge: 'Core Tool: generate_financial_report',
    icon: TrendingUp,
    title: 'Instant Financial & Revenue Reports',
    tagline: 'Quarterly variance, EBITDA margins, and executive summaries',
    description:
      'Voice-dictate complex financial metrics, OpEx numbers, recurring subscription rates, and departmental expenditures. Konthora structures the numbers into executive tables, evaluates margin percentages, and creates audit-ready summaries.',
    voicePrompt:
      '“Summarize Q3 SaaS revenue: $840,000 ARR, $310,000 operating expenses, with 38% gross margin breakdown.”',
    toolCall: 'generate_financial_report({ period: "Q3 2026", arr: 840000, opex: 310000, margin: "38%" })',
    accentColor: 'from-cyan-500 to-blue-500',
    preview: {
      docType: 'EXECUTIVE FINANCIAL SUMMARY',
      docNumber: 'FIN-Q3-2026',
      entity: 'Enterprise Software Division',
      details: [
        { label: 'Fiscal Period', value: 'Q3 2026' },
        { label: 'Reporting Currency', value: 'USD ($)' },
        { label: 'Audit Status', value: 'Verified by Groq Engine' },
      ],
      rows: [
        { item: 'Annual Recurring Revenue (ARR)', qty: '+28% YoY', amount: '$840,000.00' },
        { item: 'Infrastructure & Operating Expenses', qty: 'Monthly Avg', amount: '$310,000.00' },
        { item: 'Adjusted EBITDA Margin', qty: '38.2%', amount: '$530,000.00' },
      ],
      totalLabel: 'Net Operating Income',
      totalAmount: '$530,000.00 USD',
    },
  },
  {
    id: 'hr',
    badge: 'Core Tool: generate_hr_offer_letter',
    icon: FileCheck2,
    title: 'HR Offer Letters & Contracts',
    tagline: 'Employment terms, vesting schedules, and non-disclosure clauses',
    description:
      'Draft standardized employment agreements, remote work stipulations, IP assignment terms, and compensation packages simply by speaking the candidate’s name, role, salary, and start date.',
    voicePrompt:
      '“Draft an offer letter for Rahat Chowdhury as Staff Systems Architect, $155,000 base salary, starting October 15th.”',
    toolCall: 'generate_hr_offer_letter({ candidate: "Rahat Chowdhury", role: "Staff Systems Architect", salary: "$155,000" })',
    accentColor: 'from-amber-400 to-emerald-400',
    preview: {
      docType: 'OFFICIAL EMPLOYMENT OFFER',
      docNumber: 'HR-OFR-2026-44',
      entity: 'Candidate: Rahat Chowdhury',
      details: [
        { label: 'Designation', value: 'Staff Systems Architect' },
        { label: 'Start Date', value: 'October 15, 2026' },
        { label: 'Compensation Base', value: '$155,000 / Year' },
        { label: 'Equity Grant', value: '15,000 ISOs (4-Yr Vesting)' },
      ],
      rows: [
        { item: 'Base Salary (Semi-monthly payment)', qty: 'Standard', amount: '$12,916.67/mo' },
        { item: 'Health, Dental & Wellness Stipend', qty: 'Tier 1', amount: 'Comprehensive' },
      ],
      totalLabel: 'Total Annual Value',
      totalAmount: '$155,000.00 + Equity',
    },
  },
  {
    id: 'latency',
    badge: 'Audio Architecture: AEC & 16kHz PCM',
    icon: Zap,
    title: 'Sub-Second Latency & Acoustic Echo Guard',
    tagline: 'Zero audio echo loop, full-duplex conversational streaming',
    description:
      'Hardware-level acoustic echo cancellation (AEC) combined with client-side audio gate filtering ensures Kokoro’s voice feedback does not bleed into the active AssemblyAI v3 mic stream. Sub-850ms turnaround from voice to document.',
    voicePrompt:
      '“Update item 2 rate to $5,000 and recalculate tax immediately.” (Spoken while agent is speaking)',
    toolCall: 'aec_filter_active() -> cancel_synthetic_loop() -> groq_execute_delta()',
    accentColor: 'from-emerald-400 via-teal-300 to-cyan-400',
    preview: {
      docType: 'DUPLEX ACOUSTIC TELEMETRY',
      docNumber: 'STREAM-16KHZ-OK',
      entity: 'Full-Duplex Audio Engine',
      details: [
        { label: 'WebSocket Protocol', value: 'AssemblyAI Streaming v3' },
        { label: 'AEC Echo Attenuation', value: '-42 dB suppression' },
        { label: 'Speech-to-Tool Latency', value: '182ms (Groq 70B)' },
        { label: 'TTS Playback Start', value: '115ms (Local Kokoro)' },
      ],
      totalLabel: 'Total End-to-End Latency',
      totalAmount: '780 ms (Sub-Second)',
    },
  },
];

export function CapabilityCards() {
  const [selectedId, setSelectedId] = useState('invoices');
  const activeCap = capabilities.find((c) => c.id === selectedId) || capabilities[0];

  return (
    <section id="capabilities" className="relative bg-slate-950 py-24 border-b border-slate-800">
      {/* Glow decorations */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Document Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Designed for Real-World Commercial Workflows
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            From client billing to HR onboarding and financial reporting, Konthora maps natural multilingual speech directly to structured business actions.
          </p>
        </div>

        {/* 4 Cards Grid / Tabs */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap) => {
            const isSelected = cap.id === selectedId;
            const Icon = cap.icon;
            return (
              <button
                key={cap.id}
                onClick={() => setSelectedId(cap.id)}
                className={`text-left rounded-2xl p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                )}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">0{capabilities.indexOf(cap) + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{cap.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{cap.tagline}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <span>Explore preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Deep Dive Box */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCap.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Info Column */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeCap.badge}
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {activeCap.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {activeCap.description}
                </p>

                {/* Voice Input Trigger Demonstration */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Mic className="w-3.5 h-3.5" /> Voice Trigger Example
                    </span>
                    <span>Sub-second match</span>
                  </div>
                  <p className="text-sm italic font-medium text-slate-200">
                    {activeCap.voicePrompt}
                  </p>
                </div>

                {/* Tool Call Payload */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 font-mono text-xs text-slate-300">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Groq LLM Structured JSON Tool Dispatch:
                  </span>
                  <code className="text-amber-300 break-all">{activeCap.toolCall}</code>
                </div>
              </div>

              {/* Right Live Document Preview Column */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl relative overflow-hidden">
                  {/* Decorative badge */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                        {activeCap.preview.docType}
                      </span>
                      <p className="text-xs text-slate-400 font-mono">{activeCap.preview.docNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        STATUS: READY
                      </span>
                      <button
                        type="button"
                        className="rounded p-1 text-slate-400 hover:text-white bg-slate-800"
                        title="Print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-base font-bold text-white">{activeCap.preview.entity}</p>

                  {/* Metadata key values */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {activeCap.preview.details.map((item, idx) => (
                      <div key={idx}>
                        <span className="text-slate-400 text-[11px] block">{item.label}</span>
                        <span className="text-slate-200 font-mono font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Line items if any */}
                  {activeCap.preview.rows && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1">
                        <span>Description</span>
                        <span>Qty</span>
                        <span>Amount</span>
                      </div>
                      {activeCap.preview.rows.map((row, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-200 pt-1">
                          <span className="text-slate-300">{row.item}</span>
                          <span className="text-slate-400 font-mono">{row.qty}</span>
                          <span className="text-emerald-400 font-mono font-medium">{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total summary */}
                  {activeCap.preview.totalAmount && (
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{activeCap.preview.totalLabel}</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {activeCap.preview.totalAmount}
                      </span>
                    </div>
                  )}

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      Kokoro Audio: Confirmation dispatched
                    </span>
                    <a
                      href="/voice-agent"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      Test in Voice Agent &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
