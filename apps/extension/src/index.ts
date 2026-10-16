import { todayIST } from '@winter-arc/shared';

export function initExtension(): void {
  console.log(`[Extension] Winter Arc extension loaded for date: ${todayIST()}`);
}
