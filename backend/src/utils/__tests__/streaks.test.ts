import { calculateStreak } from '../streaks';
import { ProgressUpdate } from '../../types';

describe('calculateStreak', () => {
  it('should return 0 for an empty array of progress updates', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should return 0 if there is no streak', () => {
    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: '2025-08-18T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '2', goalId: 'a', userId: 'u', createdAt: '2025-08-16T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(0);
  });

  it('should calculate a simple streak correctly', () => {
    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: '2025-08-20T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '2', goalId: 'a', userId: 'u', createdAt: '2025-08-19T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '3', goalId: 'a', userId: 'u', createdAt: '2025-08-18T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(3);
  });

  it('should calculate a streak that includes today\'s activity', () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0); // Set to 10 AM today
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: today.toISOString(), description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '2', goalId: 'a', userId: 'u', createdAt: yesterday.toISOString(), description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '3', goalId: 'a', userId: 'u', createdAt: dayBeforeYesterday.toISOString(), description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(3);
  });

  it('should stop streak calculation when a gap is encountered', () => {
    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: '2025-08-20T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '2', goalId: 'a', userId: 'u', createdAt: '2025-08-18T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' }, // Gap here
      { id: '3', goalId: 'a', userId: 'u', createdAt: '2025-08-17T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(0); // Should be 0 because of the gap
  });

  it('should handle multiple updates on the same day correctly', () => {
    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: '2025-08-20T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
      { id: '2', goalId: 'a', userId: 'u', createdAt: '2025-08-20T11:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' }, // Same day
      { id: '3', goalId: 'a', userId: 'u', createdAt: '2025-08-19T10:00:00Z', description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(2);
  });

  it('should return 1 if only today\'s activity exists', () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    const updates: ProgressUpdate[] = [
      { id: '1', goalId: 'a', userId: 'u', createdAt: today.toISOString(), description: 'test', updateType: 'progress_note', title: 'Test Update' },
    ];
    expect(calculateStreak(updates)).toBe(1);
  });
});