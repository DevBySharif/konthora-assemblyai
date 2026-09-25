import { siteConfig } from './site';

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

export const headerNavLinks: NavLink[] = [
  { label: 'Voice Engine', href: siteConfig.links.voiceAgent },
  {
    label: 'Enterprise Capabilities',
    href: siteConfig.links.capabilities,
    description: 'Invoices, Quotations, HR Letters, Financial Reports',
  },
  {
    label: 'Architecture',
    href: siteConfig.links.architecture,
    description: 'AssemblyAI v3 + Groq + Kokoro',
  },
];

export const footerNavLinks = {
  capabilities: [
    { label: 'Voice-to-Invoice & Quotes', href: '/#capabilities' },
    { label: 'Financial & Revenue Reports', href: '/#capabilities' },
    { label: 'HR Letters & Employment Contracts', href: '/#capabilities' },
    { label: 'Live Voice Production Engine', href: '/voice-agent' },
  ],
  architecture: [
    { label: 'AssemblyAI v3 WebSocket Docs', href: siteConfig.links.assemblyaiDocs },
    { label: 'Groq Speed Benchmarks', href: siteConfig.links.groq },
    { label: 'Kokoro-82M Neural Synthesis', href: 'https://huggingface.co/hexgrad/Kokoro-82M' },
    { label: 'Pipeline Architecture', href: '/#architecture' },
  ],
  project: [
    { label: 'GitHub Repository', href: siteConfig.links.github },
    { label: 'About Konthora', href: siteConfig.links.about },
    { label: 'Contact', href: siteConfig.links.contact },
  ],
  legal: [
    { label: 'Privacy Policy', href: siteConfig.links.privacy },
    { label: 'Terms of Service', href: siteConfig.links.terms },
    { label: 'Copyright & Removal', href: siteConfig.links.copyright },
  ],
};
