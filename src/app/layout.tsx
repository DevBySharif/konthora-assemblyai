import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Analytics from '@/components/analytics/Analytics';
import { RouteChrome } from '@/components/layout/RouteChrome';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://konthora.dev.bd'),
  title: {
    default: 'Konthora — Autonomous Voice-Driven Enterprise Operations Engine',
    template: '%s | Konthora AI',
  },
  description:
    'Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Konthora — Autonomous Voice-Driven Enterprise Operations Engine',
    description:
      'Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.',
    url: 'https://konthora.dev.bd',
    siteName: 'Konthora AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Konthora — Autonomous Voice-Driven Enterprise Operations Engine',
    description:
      'Enterprise-grade full-duplex voice intelligence engine for real-time B2B workflow automation, stateful document revisions, and cryptographic audit verification.',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <RouteChrome>{children}</RouteChrome>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
