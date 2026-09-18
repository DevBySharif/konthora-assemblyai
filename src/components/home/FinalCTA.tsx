import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/motion';
import { siteConfig } from '@/config/site';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="cta-heading">
      <Container className="py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card px-6 py-16 text-center shadow-card md:px-16 md:py-20">
            {/* gradient backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-from/10 via-transparent to-brand-to/10" aria-hidden="true" />
            <div className="orb absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 bg-primary/15" aria-hidden="true" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
                Your text, spoken with{' '}
                <span className="text-gradient">perfect clarity</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Create natural-sounding voiceovers and accurate transcripts in seconds — right in your browser. No account needed.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={siteConfig.links.textToSpeech}
                  className="inline-flex items-center gap-2 rounded-full bg-[#00c882] hover:bg-[#00e092] px-6 py-3 text-base font-semibold text-slate-950 shadow-md shadow-[#00c882]/20 transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Generate speech now
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={siteConfig.links.audioToText}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0d1f1a]/80 border border-[#1b3d33] hover:border-[#00c882] px-6 py-3 text-base font-medium text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <svg className="w-5 h-5 text-[#00c882]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Transcribe audio
                </Link>
                <Link
                  href="/voice-agent"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0d1f1a]/80 border border-[#1b3d33] hover:border-[#00c882] px-6 py-3 text-base font-medium text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <svg className="w-5 h-5 text-[#00c882]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  AI Voice Agent
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Free · No sign-up · Files auto-delete in 60 minutes</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}