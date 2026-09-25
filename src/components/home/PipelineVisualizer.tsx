'use client';

import React, { useState } from 'react';
import {
  Mic,
  Zap,
  Volume2,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface PipelineStep {
  step: number;
  badge: string;
  icon: React.ElementType;
  title: string;
  tech: string;
  latency: string;
  description: string;
  highlights: string[];
  codeSnippet: string;
}

const pipelineSteps: PipelineStep[] = [
  {
    step: 1,
    badge: 'STAGE 1: SPEECH INGESTION',
    icon: Mic,
    title: 'AssemblyAI Streaming v3',
    tech: '16kHz PCM WebSocket Stream',
    latency: '~150 ms',
    description:
      'Continuous capture of 16kHz raw PCM audio chunks over a bidirectional WebSocket. Provides partial and final transcripts with word-level confidence scores, handling English, Bengali, and Banglish code-switching effortlessly.',
    highlights: [
      'Bidirectional WebSocket v3 streaming connection',
      'Word-level timestamps & speech activity detection',
      'Multilingual & Banglish code-switch recognition',
      'Acoustic echo cancellation (AEC) gate',
    ],
    codeSnippet: `// 16kHz PCM Audio Stream
const socket = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws');
socket.send(pcm16Chunk);
// Emits: "Create an invoice for Zenith Corp..."`,
  },
  {
    step: 2,
    badge: 'STAGE 2: REASONING & DISPATCH',
    icon: Zap,
    title: 'Groq LLM Decision Engine',
    tech: 'Llama-3.3-70B Structured JSON',
    latency: '~180 ms',
    description:
      'Ultra-fast inference powered by Groq LPU hardware. Parses intent from natural language, resolves numbers, tax rates, dates, and candidate salaries, and dispatches type-safe JSON tool calls directly.',
    highlights: [
      'Sub-200ms structured JSON schema generation',
      'Autonomous tool dispatch: invoice, report, or contract',
      'Extraction of currency, dates, terms, and items',
      'Deterministic schema validation',
    ],
    codeSnippet: `// Groq Structured Tool Calling
{
  "tool": "generate_invoice",
  "arguments": {
    "client": "Zenith Corp",
    "items": [{ "name": "Voice Licenses", "qty": 3, "rate": 1200 }],
    "currency": "USD"
  }
}`,
  },
  {
    step: 3,
    badge: 'STAGE 3: AUDITORY FEEDBACK',
    icon: Volume2,
    title: 'Local Kokoro-82M Neural TTS',
    tech: 'Zero-Egress On-Device Synthesis',
    latency: '~120 ms',
    description:
      'Zero-cloud-cost neural speech synthesizer that speaks a concise, natural confirmation back to the user. Plays through the audio output while Acoustic Echo Guard ensures the microphone stream remains isolated.',
    highlights: [
      '82M parameter high-fidelity neural voice model',
      'Zero cloud egress API cost & zero data upload',
      'Natural conversational inflection and clarity',
      'Echo cancellation prevents mic loopback',
    ],
    codeSnippet: `// Local Kokoro Synthesis (~120ms)
const audioBuffer = await kokoroEngine.generate({
  text: "Invoice #INV-2026-089 generated for Zenith Corp.",
  voice: "af_heart"
});
audioSink.play(audioBuffer);`,
  },
  {
    step: 4,
    badge: 'STAGE 4: ENTERPRISE ASSET',
    icon: FileCheck,
    title: 'Dynamic Document Card',
    tech: 'Reactive DOM & Print/PDF Engine',
    latency: 'Instant (<50ms)',
    description:
      'Instantly renders a production-ready, styled document card into the DOM. Users can preview itemized calculations, click one-button PDF download, or send directly to corporate print styles.',
    highlights: [
      'Reactive live state update without full page reload',
      'Automatic print stylesheet optimization',
      'Vector PDF export with crisp corporate typography',
      'Audit log and structured export support',
    ],
    codeSnippet: `// Live Document Component
<InvoiceCard 
  id="INV-2026-089" 
  client="Zenith Corp" 
  total={3600.00} 
  printable={true} 
/>`,
  },
];

export function PipelineVisualizer() {
  const [selectedStep, setSelectedStep] = useState(0);
  const current = pipelineSteps[selectedStep];

  return (
    <section id="architecture" className="relative bg-slate-950 py-24 border-b border-slate-800 text-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <Container className="relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-950/40 px-3 py-1 text-xs font-mono font-semibold text-teal-300">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> Sub-Second Pipeline Architecture
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            How Konthora Turns Soundwaves into Signed Documents
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Engineered with a full-duplex conversational loop connecting AssemblyAI v3, Groq LPU inference, and local Kokoro-82M neural audio synthesis.
          </p>
        </div>

        {/* 4 Pipeline Step Sequence Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((item, idx) => {
            const isSelected = selectedStep === idx;
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                onClick={() => setSelectedStep(idx)}
                className={`text-left rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-teal-400 bg-slate-900 shadow-[0_0_20px_rgba(20,184,166,0.25)]'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-400">STAGE 0{item.step}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/20">
                    {item.latency}
                  </span>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-xs font-mono text-teal-400">{item.tech}</p>

                <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <span>Inspect stage</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View & Code Preview */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Step Explanation */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded border border-teal-500/30">
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Processing: {current.latency}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {current.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {current.description}
              </p>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Architectural Guarantees:</p>
                {current.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code / Packet Visualizer */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-[11px] text-slate-400">pipeline-telemetry.ts</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    AEC Echo Guard: SAFE
                  </span>
                </div>
                <pre className="text-slate-300 overflow-x-auto p-1 leading-relaxed">
                  <code>{current.codeSnippet}</code>
                </pre>
              </div>

              {/* End-to-end total latency banner */}
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Cumulative Pipeline Latency:</span>
                </div>
                <span className="text-emerald-400 font-bold">&lt; 850ms Total Turnaround</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acoustic Echo Guard Callout */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  Hardware & Algorithmic Acoustic Echo Cancellation (AEC)
                </h4>
                <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
                  When Kokoro speaks the confirmation through laptop or desktop speakers, Konthora’s audio gate dampens playback frequency bleeding, preventing AssemblyAI from re-transcribing the assistant’s own voice.
                </p>
              </div>
            </div>
            <a
              href="/voice-agent"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors shrink-0 shadow-lg shadow-emerald-500/20"
            >
              <span>Test Voice Agent</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
