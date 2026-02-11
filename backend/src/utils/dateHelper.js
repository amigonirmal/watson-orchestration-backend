const { subDays, subHours, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

/**
 * Parse date string or relative date expression
 * @param {string} dateStr - Date string or expression
 * @returns {Date} Parsed date
 */
function parseDate(dateStr) {
  if (!dateStr) {
    return new Date();
  }
  
  const now = new Date();
  const lowerStr = dateStr.toLowerCase().trim();
  
  // Handle relative dates
  switch (lowerStr) {
    case 'today':
      return startOfDay(now);
    case 'yesterday':
      return startOfDay(subDays(now, 1));
    case 'last_week':
    case 'last week':
      return startOfWeek(subDays(now, 7));
    case 'last_month':
    case 'last month':
      return startOfMonth(subDays(now, 30));
    case 'this_week':
    case 'this week':
      return startOfWeek(now);
    case 'this_month':
    case 'this month':
      return startOfMonth(now);
    case 'last_7_days':
    case 'last 7 days':
      return startOfDay(subDays(now, 7));
    case 'last_30_days':
    case 'last 30 days':
      return startOfDay(subDays(now, 30));
    case 'last_24_hours':
    case 'last 24 hours':
      return subHours(now, 24);
    case 'last_hour':
    case 'last hour':
      return subHours(now, 1);
    default:
      // Try to parse as ISO date or standard date format
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      // Default to today if parsing fails
      return startOfDay(now);
  }
}

/**
 * Get date range from start and end expressions
 * @param {string} startStr - Start date expression
 * @param {string} endStr - End date expression
 * @returns {Object} Date range with start and end
 */
function getDateRange(startStr, endStr) {
  const start = parseDate(startStr);
  let end;
  
  if (!endStr || endStr === startStr) {
    // If no end date or same as start, use end of the start day
    end = endOfDay(start);
  } else {
    end = parseDate(endStr);
    // Ensure end is at end of day
    end = endOfDay(end);
  }
  
  // Ensure start is before end
  if (start > end) {
    [start, end] = [end, start];
  }
  
  return { start, end };
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format type (short, long, iso)
 * @returns {string} Formatted date
 */
function formatDate(date, format = 'long') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US');
    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'iso':
      return date.toISOString();
    case 'datetime':
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toLocaleDateString('en-US');
  }
}

/**
 * Get time difference in human-readable format
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {string} Human-readable difference
 */
function getTimeDifference(date1, date2 = new Date()) {
  const diffMs = Math.abs(date2 - date1);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`;
  }
}

module.exports = {
  parseDate,
  getDateRange,
  formatDate,
  getTimeDifference,
};

// Made with Bob
