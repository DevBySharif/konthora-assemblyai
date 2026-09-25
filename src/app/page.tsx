import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { constructSoftwareAppSchema } from '@/lib/schema';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Hero } from '@/components/home/Hero';
import { CapabilityCards } from '@/components/home/CapabilityCards';
import { PipelineVisualizer } from '@/components/home/PipelineVisualizer';
import { VoiceSimulator } from '@/components/home/VoiceSimulator';
import { MultilingualSection } from '@/components/home/MultilingualSection';
import { VoiceDocFAQ } from '@/components/home/VoiceDocFAQ';
import { voiceDocFaqs } from '@/config/voiceDocFaqs';
import { VoiceFinalCTA } from '@/components/home/VoiceFinalCTA';

export const metadata: Metadata = constructMetadata({
  title: 'Konthora — Real-Time Voice-to-Document Enterprise Engine',
  description:
    'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
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
      'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
    publisher: {
      '@type': 'Organization',
      name: 'Konthora AI',
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.png`,
    },
  };

  const webAppSchema = constructSoftwareAppSchema({
    name: 'Konthora Voice-to-Document Production Engine',
    url: siteConfig.url,
  });

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

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={webAppSchema} />
      <JsonLd schema={faqSchema} />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Core Capability Cards */}
      <CapabilityCards />

      {/* 3. Real-Time Pipeline Visualizer */}
      <PipelineVisualizer />

      {/* 4. Interactive Simulation Bench */}
      <VoiceSimulator />

      {/* 5. Multilingual & Banglish Code-Switching */}
      <MultilingualSection />

      {/* 6. FAQ Section */}
      <VoiceDocFAQ />

      {/* 7. Final Action Callout */}
      <VoiceFinalCTA />
    </div>
  );
}

