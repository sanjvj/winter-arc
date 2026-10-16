'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';

import { InAppBanners } from './in-app-banners';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = pathname && pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname || '';

  // If on /login or /design, don't show the standard app navigation shell
  const isExcluded = normalizedPath === '/login' || normalizedPath === '/design';

  if (isExcluded) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-72">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <InAppBanners />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
