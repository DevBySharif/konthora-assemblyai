import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Analytics from '@/components/analytics/Analytics';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
    default: 'Konthora — Real-Time Voice-to-Document Enterprise Engine',
    template: '%s | Konthora AI',
  },
  description:
    'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Konthora — Real-Time Voice-to-Document Enterprise Engine',
    description:
      'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
    url: 'https://konthora.dev.bd',
    siteName: 'Konthora AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Konthora — Real-Time Voice-to-Document Enterprise Engine',
    description:
      'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
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
          <Header />
          <main id="main-content" className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
