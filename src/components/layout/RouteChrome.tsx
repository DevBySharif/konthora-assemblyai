'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

const HIDE_CHROME_ROUTES: string[] = [];

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_ROUTES.includes(pathname);

  return (
    <>
      {!hideChrome && <Header />}
      <main id="main-content" className="flex-grow flex flex-col">
        {children}
      </main>
      {!hideChrome && <Footer />}
    </>
  );
}
