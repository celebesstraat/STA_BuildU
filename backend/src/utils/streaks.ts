import { ProgressUpdate } from '../types';

export const calculateStreak = (progressUpdates: ProgressUpdate[]): number => {
  if (!progressUpdates || progressUpdates.length === 0) {
    return 0;
  }

  const sortedUpdates = progressUpdates.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  let lastDate = new Date();

  const today = new Date();
  const todayString = today.toDateString();
  const hasActivityToday = sortedUpdates.some(
    (update) => new Date(update.createdAt).toDateString() === todayString
  );

  if (hasActivityToday) {
    streak = 1;
    lastDate = today;
  }

  for (let i = 1; i < sortedUpdates.length; i++) {
    const updateDate = new Date(sortedUpdates[i].createdAt);
    const diff = lastDate.getTime() - updateDate.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (diffDays === 1) {
      streak++;
      lastDate = updateDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
};
