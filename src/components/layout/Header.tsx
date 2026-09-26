'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { headerNavLinks } from '@/config/navigation';
import { Menu, X } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="relative flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/15">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7.3" cy="3.2" r="1.45" />
              <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <circle cx="16.7" cy="20.8" r="1.45" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight text-base text-white">
            Konthora <span className="text-neutral-300 font-normal">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Main Navigation">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`vesper-nav-pill px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive ? 'text-white bg-white/10 border-white/30' : 'text-neutral-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* CTA Button (desktop) */}
          <Link
            href="/voice-agent"
            className="group hidden lg:inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
            </span>
            <span>Live Demo</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            ref={triggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle main menu"
            className="inline-flex lg:hidden items-center justify-center w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'open'}
                initial={reduce ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu drawer"
            className="fixed inset-x-0 top-16 z-30 lg:hidden h-[calc(100vh-4rem)]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleLinkClick}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              initial={reduce ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -12, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="absolute inset-x-0 top-0 bg-neutral-950 border-b border-white/10"
            >
              <div className="py-4 px-4">
                <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
                  {headerNavLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={reduce ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          onClick={handleLinkClick}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                            isActive ? 'bg-white/10 text-white border border-white/20' : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <Link
                    href="/voice-agent"
                    onClick={handleLinkClick}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <span>Live Demo</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
