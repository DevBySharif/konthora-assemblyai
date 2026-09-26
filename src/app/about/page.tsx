import React from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';
import { Volume2, FileAudio, Users, Target } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: `About Us | ${siteConfig.name}`,
  description: `Learn about ${siteConfig.name}, our quality-first neural text-to-speech generators and timestamped audio transcription tools.`,
  path: '/about',
});

export default function AboutPage() {
  const pageUrl = `${siteConfig.url}/about`;

  // Structured Data (JSON-LD)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-4xl">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
          <PageHeader
            title={`About ${siteConfig.name}`}
            description="An autonomous voice-driven enterprise operations engine that transforms spoken words into production-ready documents."
            badge="Our Story"
          />

          <div className="prose dark:prose-invert max-w-none mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              The name <strong className="text-foreground">{siteConfig.name}</strong> is inspired by the Bengali word <strong className="text-foreground">&ldquo;Kontho,&rdquo;</strong> which translates to <strong className="text-foreground">voice</strong>. True to this etymology, our platform transforms natural voice commands into fully formatted, verified, and printable enterprise documents — eliminating administrative overhead through intuitive voice interaction.
            </p>

            <p>
              Powered by AssemblyAI&apos;s managed Voice Agent API, Konthora handles real-time speech recognition, LLM reasoning, and natural voice synthesis in a single WebSocket connection. Users can create invoices, quotations, purchase orders, HR letters, financial reports, and more — all through simple voice commands in English, Bangla, or Banglish.
            </p>
          </div>

          {/* Grid of values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Voice-to-Document Engine</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Speak naturally and Konthora generates production-ready enterprise documents — invoices, quotations, purchase orders, HR letters, and more — in sub-seconds.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <FileAudio className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Multilingual & Code-Switching</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Konthora understands English, Bangla, and Banglish — mixed-language utterances parsed seamlessly, with currency conversion and entity extraction built in.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Cryptographic Verification</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every document is sealed with a SHA-256 cryptographic hash and QR audit code, enabling instant verification and tamper-proof record keeping.
              </p>
            </div>

            <div className="p-6 border border-border bg-card rounded-xl shadow-xs">
              <div className="inline-flex p-2 rounded-lg bg-primary/10 text-primary mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Privacy & Security</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Audio is processed by AssemblyAI with enterprise-grade security. Document generation happens on our backend. Voice data is never stored beyond the active session.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
