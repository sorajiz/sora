'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  id: string;
  label: string;
  href: string;
}

const TABS: TabItem[] = [
  { id: 'rules', label: 'Server Rules', href: '/rules' },
  { id: 'tos', label: 'Terms of Service', href: '/tos' },
  { id: 'tutorial', label: 'Tutorial', href: '/tutorial' },
];

export function SubdomainTabs() {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('rules');

  useEffect(() => {
    if (pathname.includes('/tos')) {
      setActiveTab('tos');
    } else if (pathname.includes('/tutorial')) {
      setActiveTab('tutorial');
    } else {
      setActiveTab('rules');
    }
  }, [pathname]);

  const updateSlider = (el: HTMLElement | null) => {
    if (!wrapperRef.current || !sliderRef.current || !el) return;
    const wrapRect = wrapperRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    sliderRef.current.style.left = `${elRect.left - wrapRect.left}px`;
    sliderRef.current.style.width = `${elRect.width}px`;
  };

  useEffect(() => {
    const activeEl = wrapperRef.current?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (activeEl) {
      updateSlider(activeEl);
    }
  }, [activeTab]);

  return (
    <div className="flex justify-center mb-6 px-2 w-full">
      <div
        ref={wrapperRef}
        onMouseLeave={() => {
          const activeEl = wrapperRef.current?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
          if (activeEl) updateSlider(activeEl);
        }}
        className="relative inline-flex items-center p-1 bg-white/[0.035] border border-white/[0.08] rounded-full max-w-full overflow-x-auto scrollbar-none shadow-sm"
      >
        <div
          ref={sliderRef}
          className="absolute top-1 bottom-1 left-1 bg-[#21232d] border border-white/[0.14] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.45)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
        />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              data-tab={tab.id}
              onMouseEnter={(e) => updateSlider(e.currentTarget)}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-200 select-none ${
                isActive ? 'text-white font-bold' : 'text-[#838896] hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
