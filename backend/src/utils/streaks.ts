import { ProgressUpdate } from '../types';

export const calculateStreak = (progressUpdates: ProgressUpdate[]): number => {
  if (!progressUpdates || progressUpdates.length === 0) {
    return 0;
  }

  const normalizeDate = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const uniqueDates = Array.from(new Set(progressUpdates.map(update => normalizeDate(new Date(update.createdAt)))));
  uniqueDates.sort((a, b) => b - a); // Descending order

  let streak = 0;
  const today = normalizeDate(new Date());
  const yesterday = normalizeDate(new Date(today - (24 * 60 * 60 * 1000)));

  // Check if the most recent activity is today or yesterday
  if (uniqueDates[0] === today) {
    streak = 1;
  } else if (uniqueDates[0] === yesterday) {
    streak = 1;
  } else {
    return 0; // No activity today or yesterday, so no streak
  }

  // Iterate through the rest of the unique dates
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];
    const previousDateInStreak = uniqueDates[i - 1];
    const expectedCurrentDate = normalizeDate(new Date(previousDateInStreak - (24 * 60 * 60 * 1000)));

    if (currentDate === expectedCurrentDate) {
      streak++;
    } else if (currentDate < expectedCurrentDate) {
      // If the current date is older than expected, it means there's a gap
      break;
    }
    // If currentDate > expectedCurrentDate, it means there were multiple activities on the same day, which is fine.
    // We just continue to the next unique date.
  }

  return streak;
};
