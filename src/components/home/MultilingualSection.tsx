'use client';

import React from 'react';
import { Languages, Check, Mic, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const languageExamples = [
  {
    lang: 'English (US / UK / Global)',
    badge: 'Native Recognition',
    prompt: '“Create an invoice for Apex Digital: 40 hours of cloud consulting at $85/hour with 5% tax.”',
    result: 'Invoice #INV-2026-091 created with $3,400 subtotal + $170 tax ($3,570 total).',
  },
  {
    lang: 'Banglish (Phonetic Bengali / Code-Switching)',
    badge: 'Code-Switching Engine',
    prompt: '“Apex Digital er jonno ekta invoice banau: 40 ghonta cloud consulting rate 85 dollar, 5 percent tax shoho.”',
    result: 'Recognized intent -> maps to generate_invoice with identical rate and tax parameters.',
  },
  {
    lang: 'Standard Bangla (বাংলা)',
    badge: 'Multilingual ASR',
    prompt: '“অ্যাপেক্স ডিজিটাল এর জন্য একটি ইনভয়েস তৈরি করুন: প্রতি ঘণ্টা ৮৫ ডলার হারে ৪০ ঘণ্টা ক্লাউড কনসাল্টিং।”',
    result: 'Parsed Bangla numeral & entity semantics into structured corporate schema.',
  },
];

export function MultilingualSection() {
  return (
    <section className="relative bg-slate-950 py-20 border-b border-slate-800 text-slate-100">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Details */}
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono font-semibold text-emerald-300">
              <Languages className="w-3.5 h-3.5 text-emerald-400" /> Multilingual & Code-Switching Speech
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Seamlessly Converse in English, Bangla, or Banglish
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Global teams don’t speak in sterile textbook sentences. Konthora’s speech-to-document engine handles bilingual mixed-mode speech, slang, and phonetic syntax without missing a decimal point.
            </p>

            <div className="pt-2 space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero-latency code-switching between English technical jargon and regional speech</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Automatic currency normalizer: USD ($), BDT (৳), EUR (€), GBP (£)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Robust acoustic handling for noisy work environments and conference mics</span>
              </div>
            </div>
          </div>

          {/* Right Comparison Cards */}
          <div className="lg:col-span-6 space-y-3">
            {languageExamples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    {ex.lang}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    {ex.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 italic">
                  {ex.prompt}
                </p>
                <div className="pt-1 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-teal-300 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{ex.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
