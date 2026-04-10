// Currency and date formatting utilities

export function formatCurrency(amount, currency = '₹') {
  const num = Number(amount);
  if (isNaN(num)) return `${currency}0`;

  if (num >= 10000000) {
    return `${currency}${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 100000) {
    return `${currency}${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${currency}${num.toLocaleString('en-IN')}`;
  }
  return `${currency}${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
}

export function formatDate(dateStr, format = 'short') {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    case 'medium':
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    case 'time':
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    case 'iso':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString('en-IN');
  }
}

export function formatPercentage(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`;
}

export function getRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getDateRange(range) {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case '3months':
      start.setMonth(now.getMonth() - 3);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end: now };
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(monthIndex) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
}
