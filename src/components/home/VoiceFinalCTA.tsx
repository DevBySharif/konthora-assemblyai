'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

function GithubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function VoiceFinalCTA() {
  return (
    <section className="relative bg-slate-950 py-24 text-slate-100 overflow-hidden">
      {/* Glow lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-[100px] pointer-events-none rounded-full" />

      <Container className="relative">
        <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 sm:p-14 text-center shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-4 py-1.5 text-xs font-mono font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AssemblyAI Voice Agent Hackathon 2026</span>
          </div>

          <h2 className="mt-6 text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Ready to Generate Enterprise Documents at the Speed of Speech?
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience sub-second full-duplex voice intelligence. Speak in English, Bangla, or Banglish, and let Konthora build downloadable, audit-ready commercial assets in real-time.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/voice-agent"
              className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 px-8 text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(16,185,129,0.7)]"
            >
              <Mic className="w-5 h-5 text-slate-950" />
              <span>Launch Voice Production Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://github.com/DevBySharif/konthora-assemblyai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 text-base font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white transition-all"
            >
              <GithubIcon className="w-5 h-5" />
              <span>GitHub Repository</span>
            </a>
          </div>

          {/* Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-emerald-400 font-bold block text-sm">&lt; 850ms</span>
              <span>Full Loop Latency</span>
            </div>
            <div>
              <span className="text-teal-400 font-bold block text-sm">AssemblyAI v3</span>
              <span>16kHz PCM Stream</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block text-sm">Groq LPU 70B</span>
              <span>Structured JSON Schema</span>
            </div>
            <div>
              <span className="text-emerald-300 font-bold block text-sm">Local Kokoro-82M</span>
              <span>Zero-Egress Audio TTS</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
