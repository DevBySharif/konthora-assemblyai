import React from 'react';

export async function getOgLogoDataUri(): Promise<string> {
  return 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40"><text x="0" y="30" font-family="monospace" font-size="24" fill="white" font-weight="bold">Konthora</text></svg>`
  );
}

export function OgImage({ logoSrc }: { logoSrc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#000', color: '#fff', padding: 60, justifyContent: 'center' }}>
      <img src={logoSrc} width={200} height={40} alt="Konthora" />
      <h1 style={{ fontSize: 48, fontWeight: 700, marginTop: 20, fontFamily: 'sans-serif' }}>
        Autonomous Voice-Driven Enterprise Operations Engine
      </h1>
      <p style={{ fontSize: 24, color: '#999', marginTop: 10, fontFamily: 'sans-serif' }}>
        Transform speech into production-ready enterprise documents in sub-seconds
      </p>
    </div>
  );
}
