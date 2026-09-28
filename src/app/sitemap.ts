import { MetadataRoute } from 'next';

const CONTENT_LAST_MODIFIED = new Date('2026-09-29');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://konthora.dev.bd'
  ).replace(/\/+$/, '');

  const routes = [
    '',
    '/voice-agent',
    '/about',
    '/privacy-policy',
    '/terms',
    '/copyright',
  ];

  return routes.map((route) => {
    const isHome = route === '';
    const isVoiceAgent = route === '/voice-agent';

    let priority = 0.5;
    let changeFrequency: 'weekly' | 'monthly' = 'monthly';

    if (isHome) {
      priority = 1.0;
      changeFrequency = 'weekly';
    } else if (isVoiceAgent) {
      priority = 0.9;
      changeFrequency = 'weekly';
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency,
      priority,
    };
  });
}
