import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Learn how Konthora collects, processes, and protects your data when using the voice-to-document engine.`,
  path: '/privacy-policy',
});

export default function Page() {
  const pageUrl = `${siteConfig.url}/privacy-policy`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section className="pb-24">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]} />
            <PageHeader
              title="Privacy Policy"
              description="Learn how Konthora collects, processes, and protects your data when using the voice-to-document engine."
              badge="Privacy"
            />
          </div>

          <div className="flex gap-4 p-5 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl text-yellow-700 dark:text-yellow-400/90 mb-12">
            <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div className="space-y-1.5">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">Draft Notice</p>
              <p className="text-sm leading-relaxed">
                This document is a pre-production launch draft. It must be reviewed, adjusted, and finalized by qualified legal counsel before public production processing is enabled on Konthora.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                At <strong className="text-foreground">{siteConfig.name}</strong>, user privacy is a fundamental value. This policy explains how we handle data when you use the voice-to-document engine.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                1. Voice Data Processing
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                When you use the voice agent, the following data lifecycle applies:
              </p>
              <ul className="list-disc pl-6 space-y-3 leading-8 text-muted-foreground max-w-[75ch] marker:text-muted-foreground/50">
                <li className="pl-2">
                  <strong className="text-foreground">Audio Capture:</strong> Your microphone audio is streamed in real-time to AssemblyAI&apos;s Voice Agent API over an encrypted WebSocket connection for speech-to-text processing.
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">Voice Data:</strong> Audio data is processed transiently by AssemblyAI and is never stored on our servers. AssemblyAI processes audio in-memory and discards it immediately after transcription.
                </li>
                <li className="pl-2">
                  <strong className="text-foreground">Document Generation:</strong> Voice commands are converted to structured document data on our backend. Generated documents are returned to your browser in real-time.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                2. Document Storage
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                All documents are generated and stored locally in your browser. We do not maintain a database of your generated documents. Document data exists only in your active browser session and is lost when you close the page.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                3. Analytics & Cookies
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                We use local storage within your browser to store user preferences such as your visual theme choice (Light or Dark mode). We do not use third-party analytics trackers or cross-site cookies.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                4. Third-Party Services
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                Our voice agent uses AssemblyAI&apos;s managed Voice Agent API for speech recognition and text-to-speech. AssemblyAI&apos;s own privacy policy governs how they handle transient audio data. We do not share any personal information with third parties beyond what is required for voice processing.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                5. Changes to This Policy
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                We reserve the right to revise this Privacy Policy to reflect backend integrations or regulatory updates. We recommend checking this page periodically for updates.
              </p>
            </div>

          </div>

          <div className="mt-16 pt-12 border-t border-border/50">
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-secondary/30 border border-border/40">
              <HelpCircle className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Questions? Need clarification?</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Our support team is here to help you understand our policies and answer any questions you might have.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 font-medium text-foreground transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
