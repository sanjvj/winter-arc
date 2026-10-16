import { todayIST } from '@winter-arc/shared';

export function runScraper(): void {
  console.log(`[Scraper] Initialized scraper engine for date: ${todayIST()}`);
}
