'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, ExternalLink, Zap, Mic, Cpu } from 'lucide-react';
import { KonthoraBrand } from '../brand/KonthoraBrand';

function GithubIcon({ className = 'h-4 w-4' }: { className?: string }) {
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

const footerColumns = [
  {
    title: 'Voice Engine',
    links: [
      { label: 'Launch Voice Engine', href: '/voice-agent', isExternal: false },
      { label: 'AssemblyAI v3 WebSocket Docs', href: 'https://www.assemblyai.com/docs/api-reference/streaming', isExternal: true },
      { label: 'Groq Speed Benchmarks', href: 'https://groq.com/', isExternal: true },
      { label: 'Kokoro-82M Neural Synthesis', href: 'https://huggingface.co/hexgrad/Kokoro-82M', isExternal: true },
    ],
  },
  {
    title: 'Capabilities',
    links: [
      { label: 'Voice-to-Invoice & Quotations', href: '/#capabilities', isExternal: false },
      { label: 'Instant Financial Reports', href: '/#capabilities', isExternal: false },
      { label: 'HR Offer Letters & Contracts', href: '/#capabilities', isExternal: false },
      { label: 'Acoustic Echo Cancellation', href: '/#capabilities', isExternal: false },
    ],
  },
  {
    title: 'Architecture',
    links: [
      { label: '16kHz PCM Speech Capture', href: '/#architecture', isExternal: false },
      { label: 'Groq Structured Tool Dispatch', href: '/#architecture', isExternal: false },
      { label: 'Local Voice Confirmation', href: '/#architecture', isExternal: false },
      { label: 'Dynamic Document Render', href: '/#architecture', isExternal: false },
    ],
  },
  {
    title: 'Project & Legal',
    links: [
      { label: 'GitHub Repository', href: 'https://github.com/DevBySharif/konthora-assemblyai', isExternal: true },
      { label: 'About Project', href: '/about', isExternal: false },
      { label: 'Privacy Policy', href: '/privacy-policy', isExternal: false },
      { label: 'Terms of Service', href: '/terms', isExternal: false },
      { label: 'Copyright & Removal', href: '/copyright', isExternal: false },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === '/voice-agent') return null;

  return (
    <footer className="border-t border-white/10 bg-black text-white transition-colors duration-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand section */}
          <div className="flex flex-col items-start lg:col-span-4">
            <KonthoraBrand variant="footer" />
            <h3 className="mt-4 text-sm font-semibold text-neutral-300 font-mono tracking-tight">
              Konthora — Autonomous Voice-Driven Enterprise Operations Engine
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-neutral-300 border border-white/15 font-mono">
                <Mic className="w-3 h-3" /> AssemblyAI v3
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                <Zap className="w-3 h-3" /> Groq 70B
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                <Cpu className="w-3 h-3" /> Kokoro-82M
              </span>
            </div>

            {/* Links and Contact */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/DevBySharif/konthora-assemblyai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-white/30 hover:bg-white/10 transition-all"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub Repo
              </a>
              <a
                href="mailto:support@konthora.dev.bd"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:border-white/30 hover:text-neutral-300 hover:bg-white/10 transition-all"
              >
                <Mail className="h-4 w-4" />
                support@konthora.dev.bd
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-block text-xs font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            &copy; {currentYear} Konthora AI. Developed for AssemblyAI Voice Agent Hackathon 2026.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            AssemblyAI Voice Agent Hackathon 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
