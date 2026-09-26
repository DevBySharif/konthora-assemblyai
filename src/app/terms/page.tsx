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
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Read the terms and rules governing the use of Konthora's voice-to-document enterprise operations engine.`,
  path: '/terms',
});

export default function Page() {
  const pageUrl = `${siteConfig.url}/terms`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section className="pb-24">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Terms of Service' }]} />
            <PageHeader
              title="Terms of Service"
              description="Read the terms and rules governing the use of Konthora's voice-to-document enterprise operations engine."
              badge="Terms"
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
                Welcome to <strong className="text-foreground">{siteConfig.name}</strong>. By accessing our website, you agree to comply with the rules outlined in these Terms of Service.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                1. Acceptance of Terms
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                By using the voice-to-document engine, you confirm that you accept these terms and agree to abide by them. If you do not agree, you must not use the platform.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                2. Acceptable Use and Restrictions
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch] mb-4">
                You agree to use the platform only for lawful purposes. You must not:
              </p>
              <ul className="list-disc pl-6 space-y-3 leading-8 text-muted-foreground max-w-[75ch] marker:text-muted-foreground/50">
                <li className="pl-2">Generate documents containing illegal content, fraud, hate speech, or defamatory material.</li>
                <li className="pl-2">Attempt to reverse-engineer, scrape, or abuse the voice agent or backend API.</li>
                <li className="pl-2">Use the platform to infringe on third-party intellectual property rights.</li>
                <li className="pl-2">Resell or redistribute generated documents in a misleading or unauthorized manner.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                3. Ownership of Content
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                You retain all ownership rights in the voice commands you provide and the documents generated through the platform. Konthora does not claim any proprietary rights over your generated outputs, which you are free to use for personal or commercial purposes.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                4. Service Availability
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                The voice-to-document engine is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee uninterrupted availability, error-free voice recognition, or zero downtime. Third-party dependencies (AssemblyAI) may affect service availability.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                5. Document Accuracy
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                Documents are generated from voice input using AI. While we strive for accuracy, we do not guarantee that generated documents are free from errors. Users are responsible for reviewing all generated documents before use.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                6. Limitation of Liability
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                To the maximum extent permitted by law, Konthora and its developers shall not be liable for any direct, indirect, or incidental damages resulting from use of, or inability to use, the platform or any generated documents.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                7. Governing Law
              </h2>
              <p className="leading-8 text-muted-foreground max-w-[75ch]">
                These Terms of Service are governed by local regulatory guidelines. Any disputes arising from the use of our services will be subject to local court jurisdictions.
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
