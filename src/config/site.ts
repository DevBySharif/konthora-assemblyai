
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://konthora.dev.bd'
).replace(/\/+$/, '');

export const siteConfig = {
  name: 'Konthora AI',
  tagline: 'Real-Time Voice-to-Document Enterprise Engine',
  description:
    'Built for the AssemblyAI Hackathon. The fastest multilingual voice assistant for dynamic document generation and enterprise operations.',
  url: siteUrl,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@konthora.dev.bd',
  author: 'DevBySharif',
  keywords: [
    'voice to document',
    'real-time voice agent',
    'AssemblyAI streaming v3',
    'voice invoice generator',
    'Groq voice engine',
    'multilingual voice agent',
    'Bangla voice AI',
    'Kokoro TTS voice agent',
    'voice to contract',
  ],
  links: {
    home: '/',
    voiceAgent: '/voice-agent',
    capabilities: '/#capabilities',
    architecture: '/#architecture',
    github: 'https://github.com/DevBySharif/konthora-assemblyai',
    assemblyaiDocs: 'https://www.assemblyai.com/docs/api-reference/streaming',
    groq: 'https://groq.com',
    textToSpeech: '/text-to-speech',
    audioToText: '/audio-to-text',
    about: '/about',
    contact: '/contact',
    privacy: '/privacy-policy',
    terms: '/terms',
    copyright: '/copyright',
  },
};

export type SiteConfig = typeof siteConfig;
