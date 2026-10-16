import { ScheduleBlock } from './schemas';

export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

export function isValidTimeString(timeStr: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

export function validateScheduleBlock(block: ScheduleBlock): { valid: boolean; error?: string } {
  if (!block.label.trim()) {
    return { valid: false, error: 'Block label is required' };
  }
  if (!isValidTimeString(block.start)) {
    return { valid: false, error: `Invalid start time "${block.start}" (expected HH:mm)` };
  }
  if (!isValidTimeString(block.end)) {
    return { valid: false, error: `Invalid end time "${block.end}" (expected HH:mm)` };
  }
  return { valid: true };
}

export function moveScheduleBlock(
  blocks: ScheduleBlock[],
  index: number,
  direction: 'up' | 'down',
): ScheduleBlock[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= blocks.length) {
    return blocks;
  }
  const cloned = [...blocks];
  const temp = cloned[index];
  const targetItem = cloned[targetIndex];
  if (temp && targetItem) {
    cloned[index] = targetItem;
    cloned[targetIndex] = temp;
  }
  return cloned;
}
