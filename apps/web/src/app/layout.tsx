import '@/styles/globals.css';
import type { Metadata } from 'next';
import { fontInter, fontSpaceGrotesk, fontJetBrainsMono } from '@/lib/fonts';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthGate } from '@/components/auth-gate';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Winter Arc Command Center',
  description: 'Single-tenant personal execution command center for the 90-day SDE-1 hunt.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontInter.variable} ${fontSpaceGrotesk.variable} ${fontJetBrainsMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-accent-ice selection:text-bg">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="winter-arc-theme"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthGate>
              <AppShell>{children}</AppShell>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
