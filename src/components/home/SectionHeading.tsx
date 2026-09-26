import React from 'react';

interface SectionHeadingProps {
  align?: 'left' | 'center';
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ align = 'center', eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-neutral-300 text-xs font-mono">
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-semibold mt-4 mb-4">{title}</h2>
      {description && <p className="text-neutral-400 text-sm">{description}</p>}
    </div>
  );
}
