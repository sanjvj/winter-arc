import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  isValidTimeString,
  validateScheduleBlock,
  moveScheduleBlock,
} from '../src/schedule';
import { ScheduleBlock } from '../src/schemas';

describe('Schedule Helpers', () => {
  it('converts HH:mm to minutes accurately', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('06:30')).toBe(390);
    expect(timeToMinutes('22:45')).toBe(1365);
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('validates time format correctly', () => {
    expect(isValidTimeString('06:00')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
    expect(isValidTimeString('24:00')).toBe(false);
    expect(isValidTimeString('6:00')).toBe(false);
    expect(isValidTimeString('06:60')).toBe(false);
    expect(isValidTimeString('invalid')).toBe(false);
  });

  it('validates schedule block structure', () => {
    const validBlock: ScheduleBlock = {
      id: 'sb-1',
      start: '06:00',
      end: '07:00',
      label: 'DSA Practice',
      category: 'dsa',
    };
    expect(validateScheduleBlock(validBlock).valid).toBe(true);

    const emptyLabel: ScheduleBlock = { ...validBlock, label: '   ' };
    expect(validateScheduleBlock(emptyLabel).valid).toBe(false);

    const badStart: ScheduleBlock = { ...validBlock, start: '25:00' };
    expect(validateScheduleBlock(badStart).valid).toBe(false);
  });

  it('reorders schedule blocks up and down without mutating out of bounds', () => {
    const blocks: ScheduleBlock[] = [
      { id: '1', start: '06:00', end: '07:00', label: 'One', category: 'dsa' },
      { id: '2', start: '07:00', end: '08:00', label: 'Two', category: 'rest' },
      { id: '3', start: '08:00', end: '09:00', label: 'Three', category: 'study' },
    ];

    // Move first up -> no change
    expect(moveScheduleBlock(blocks, 0, 'up')[0]?.id).toBe('1');

    // Move second up -> swapped with first
    const movedUp = moveScheduleBlock(blocks, 1, 'up');
    expect(movedUp[0]?.id).toBe('2');
    expect(movedUp[1]?.id).toBe('1');

    // Move second down -> swapped with third
    const movedDown = moveScheduleBlock(blocks, 1, 'down');
    expect(movedDown[1]?.id).toBe('3');
    expect(movedDown[2]?.id).toBe('2');
  });
});
