import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { voiceDocFaqs } from '@/config/voiceDocFaqs';
import {
  Sparkles,
  Mic,
  ShieldCheck,
  Layers,
  ArrowRight,
  Zap,
  FileCheck,
  Users,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Konthora — Autonomous Voice-Driven Enterprise Operations Engine',
  description:
    'Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.',
  path: '/',
});

export default function HomePage() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Konthora AI',
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.contactEmail,
      contactType: 'customer support',
      availableLanguage: ['English', 'Bengali'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Konthora AI',
    url: siteConfig.url,
    description:
      'Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation.',
    publisher: {
      '@type': 'Organization',
      name: 'Konthora AI',
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.png`,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: voiceDocFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const navLinks = [
    { label: 'Benefits', href: '#benefits' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Security', href: '#security' },
    { label: 'Workflows', href: '#workflows' },
  ];

  const stats = [
    {
      icon: Zap,
      value: '<100ms',
      label: 'Full-Duplex Barge-In Latency',
    },
    {
      icon: ShieldCheck,
      value: '99.9%',
      label: 'Cryptographic Audit Integrity',
    },
    {
      icon: Users,
      value: '15+',
      label: 'Autonomous B2B Workflows',
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={faqSchema} />

      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.02] blur-[80px]" />
      </div>

      {/* ── Navigation Bar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-10 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Mic className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Konthora
            <span className="text-emerald-400 font-normal">.ai</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-[13px] font-medium text-neutral-400 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-full transition-all duration-300 hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          href="/voice-agent"
          className="px-5 py-2.5 text-[13px] font-semibold rounded-full bg-white text-black hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
        >
          Launch Engine
        </Link>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-900 to-black border border-white/10 mb-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-neutral-300 tracking-wide">
            Autonomous Voice Operations Engine
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-[-0.03em] leading-[1.05] max-w-5xl">
          <span className="block text-white">
            Automate{' '}
            <em className="font-serif italic font-normal text-slate-400 not-italic" style={{ fontStyle: 'italic' }}>
              Voice Operations
            </em>{' '}
            in
          </span>
          <span className="block text-white mt-1">
            enterprise workflows instantly.
          </span>
        </h1>

        {/* Lede */}
        <p className="mt-8 text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed font-light">
          Deploy full-duplex AI voice engines that query enterprise databases,
          execute stateful document revisions, and seal cryptographic audit
          approvals in real time.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/voice-agent"
            className="group relative px-8 py-3.5 bg-white text-black text-sm font-semibold rounded-full transition-all duration-300 hover:bg-neutral-200 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2"
          >
            Launch Voice Engine
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#benefits"
            className="px-8 py-3.5 text-sm font-medium text-neutral-300 border border-white/15 hover:border-white/30 rounded-full transition-all duration-300 hover:bg-white/[0.04]"
          >
            Explore Capabilities
          </a>
        </div>
      </section>

      {/* ── Stats Footer Bar ── */}
      <section className="relative z-10 border-t border-white/[0.06] bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 group"
              >
                <div className="h-11 w-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-colors">
                  <Icon className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
