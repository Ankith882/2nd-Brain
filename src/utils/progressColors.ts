// New progress color utility with immediate updates
export const getProgressColor = (percentage: number): string => {
  if (percentage === 100) return '#87CEEB'; // Sky Blue
  if (percentage >= 80 && percentage <= 98) return '#00FF00'; // Bright Green
  if (percentage >= 50 && percentage <= 79) return '#FF8C00'; // Dark Orange
  if (percentage >= 30 && percentage <= 49) return '#FFFF00'; // Bright Yellow
  if (percentage >= 1 && percentage <= 30) return '#8B0000'; // Dark Red
  return 'transparent'; // 0% - no color
};

// Helper function to determine if progress color should be shown for a date
export const shouldShowProgressColor = (date: Date, currentDate: Date = new Date()): boolean => {
  return date <= currentDate;
};