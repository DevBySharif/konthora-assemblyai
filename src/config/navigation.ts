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
    description: 'AssemblyAI Voice Agent API',
  },
];
