/**
 * Formats a date range into a readable string.
 * Example: "1 Des - 3 Des, 2025" or "5 Jan 2025"
 */
export const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startMonth = startDate.toLocaleString('id-ID', { month: 'short' });
    const endMonth = endDate.toLocaleString('id-ID', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
  
    if (startYear !== endYear) {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
    if (startMonth !== endMonth || startDay !== endDay) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${endYear}`;
    }
    return `${startDay} ${startMonth} ${endYear}`; // Same day
  };