'use client';

import React, { useState } from 'react';
import {
  Mic,
  Play,
  Volume2,
  FileText,
  Download,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface Scenario {
  id: string;
  tabLabel: string;
  prompt: string;
  lang: string;
  groqTool: string;
  kokoroResponse: string;
  docTitle: string;
  docSubtitle: string;
  recipient: string;
  date: string;
  items: { desc: string; val: string }[];
  highlightTotal: string;
}

const scenarios: Scenario[] = [
  {
    id: 'invoice',
    tabLabel: '1. Commercial Invoice',
    prompt:
      '“Generate an invoice for CloudScale Technologies: 3 AI Integration Sprints at $4,500 each, Net 15 days payment terms.”',
    lang: 'English / Banglish Compatible',
    groqTool: 'generate_invoice({ client: "CloudScale Technologies", amount: 13500, terms: "Net 15" })',
    kokoroResponse: '“Commercial invoice #INV-2026-089 generated for CloudScale Technologies. Total balance is $13,500.”',
    docTitle: 'INVOICE #INV-2026-089',
    docSubtitle: 'CloudScale Technologies Inc. — Commercial Operations',
    recipient: 'Billing Dept, CloudScale Technologies',
    date: 'September 25, 2026',
    items: [
      { desc: 'AI Integration Sprints (Qty: 3 @ $4,500/ea)', val: '$13,500.00' },
      { desc: 'Automated Acoustic Pipeline Configuration', val: 'Included' },
      { desc: 'Sales Tax / Service Duty (0% Applied)', val: '$0.00' },
    ],
    highlightTotal: '$13,500.00 USD',
  },
  {
    id: 'financial',
    tabLabel: '2. Financial Summary',
    prompt:
      '“Summarize Q3 Enterprise Revenue: $840,000 ARR, $310,000 infrastructure costs, with 38% gross margin.”',
    lang: 'English Business Metrics',
    groqTool: 'generate_financial_report({ period: "Q3 2026", arr: 840000, opex: 310000, margin: "38%" })',
    kokoroResponse: '“Q3 Enterprise financial summary compiled. Operating margin calculated at 38% with $530,000 net income.”',
    docTitle: 'EXECUTIVE FINANCIAL SUMMARY',
    docSubtitle: 'Quarterly Operating Variance & Revenue Performance',
    recipient: 'Board of Directors & Executive Committee',
    date: 'Q3 Close, September 2026',
    items: [
      { desc: 'Annualized Recurring Run Rate (ARR)', val: '$840,000.00' },
      { desc: 'Infrastructure & Operational Expenses (OpEx)', val: '($310,000.00)' },
      { desc: 'Adjusted Operating Margin (EBITDA)', val: '38.2%' },
    ],
    highlightTotal: '$530,000.00 Net Income',
  },
  {
    id: 'offer',
    tabLabel: '3. HR Employment Offer',
    prompt:
      '“Draft an offer letter for Rahat Chowdhury as Staff Systems Architect, $155,000 base salary, starting October 15th.”',
    lang: 'English / Multilingual Intent',
    groqTool: 'generate_hr_offer_letter({ candidate: "Rahat Chowdhury", role: "Staff Systems Architect", salary: "$155,000" })',
    kokoroResponse: '“Official employment offer prepared for Rahat Chowdhury as Staff Systems Architect.”',
    docTitle: 'OFFICIAL OFFER OF EMPLOYMENT',
    docSubtitle: 'Engineering Leadership — Konthora Systems Corp',
    recipient: 'Candidate: Rahat Chowdhury',
    date: 'Effective Start: October 15, 2026',
    items: [
      { desc: 'Position Title: Staff Systems Architect', val: 'Full-Time (Exempt)' },
      { desc: 'Annual Base Compensation', val: '$155,000.00 / Year' },
      { desc: 'Incentive Stock Options (ISOs)', val: '15,000 Shares (4-Yr)' },
    ],
    highlightTotal: '$155,000.00 + Stock Options',
  },
];

export function VoiceSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const simulateSpeech = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2400);
  };

  return (
    <section className="relative bg-slate-950 py-20 border-b border-slate-800 text-slate-100">
      <Container>
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Interactive Engine Simulator
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See the Full-Duplex Flow in Action
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Select an enterprise scenario below to simulate speech-to-document execution in under 850 milliseconds.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer font-mono ${
                selectedScenario.id === sc.id
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {sc.tabLabel}
            </button>
          ))}
        </div>

        {/* Simulation Canvas */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Input & Pipeline States */}
            <div className="lg:col-span-6 space-y-4">
              {/* Spoken Voice Bubble */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Mic className="w-4 h-4 animate-pulse" /> Spoken Audio Prompt
                  </span>
                  <span>AssemblyAI v3 (16kHz PCM)</span>
                </div>
                <p className="text-sm font-medium text-slate-100 italic">
                  {selectedScenario.prompt}
                </p>
              </div>

              {/* Groq Tool Execution */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="w-3.5 h-3.5" /> Groq Decision Engine (180ms)
                  </span>
                  <span className="text-emerald-400">Tool: Validated</span>
                </div>
                <code className="text-amber-300 break-all">{selectedScenario.groqTool}</code>
              </div>

              {/* Kokoro Confirmation */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Volume2 className="w-4 h-4" /> Kokoro-82M Audio Confirmation
                  </span>
                  <button
                    onClick={simulateSpeech}
                    type="button"
                    className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[11px] text-cyan-300 cursor-pointer"
                  >
                    <Play className="w-3 h-3" /> Simulate Playback
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  {selectedScenario.kokoroResponse}
                </p>
                {isPlayingAudio && (
                  <div className="mt-3 flex items-center gap-1 h-3">
                    {[40, 80, 50, 100, 60, 90, 40, 70, 95, 30].map((h, idx) => (
                      <span
                        key={idx}
                        className="w-1.5 bg-cyan-400 rounded-full animate-bounce"
                        style={{ height: `${h}%`, animationDelay: `${idx * 0.05}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Rendered Document Output */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {selectedScenario.docTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    SUB-SECOND RENDER
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400">{selectedScenario.docSubtitle}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {selectedScenario.recipient}
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedScenario.date}</p>
                </div>

                {/* Items breakdown */}
                <div className="mt-4 space-y-2 rounded-lg bg-slate-900/60 p-3 border border-slate-800">
                  {selectedScenario.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span>{it.desc}</span>
                      <span className="font-mono font-medium text-emerald-300">{it.val}</span>
                    </div>
                  ))}
                </div>

                {/* Highlight total */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Net Value / Rate:</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {selectedScenario.highlightTotal}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Echo Guard: Active & Isolated
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-200"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-200"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
