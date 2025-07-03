/**
 * Adjusts the end date to include the entire day (23:59:59.999)
 */
export function adjustEndDateForQuery(endDate: Date): Date {
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999);
  return adjustedEndDate;
}

/**
 * Gets default date range (one month ago to today) when no dates are provided
 */
export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);
  
  return { startDate, endDate };
}