const validDate = value => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value, options = {}) => {
  const date = validDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(date);
};

export const formatDateTime = value => formatDate(value, {
  hour: '2-digit',
  minute: '2-digit'
});

export const toDateInput = value => {
  const date = validDate(value);
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const toDateTimeInput = value => {
  const date = validDate(value);
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const relativeTime = value => {
  const date = validDate(value);
  if (!date) return 'Unknown time';
  const difference = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000]
  ];
  const [unit, milliseconds] = units.find(([, size]) => Math.abs(difference) >= size) || ['second', 1000];
  return formatter.format(Math.round(difference / milliseconds), unit);
};

export const isOverdue = (value, status) => {
  const date = validDate(value);
  return Boolean(date && date < new Date() && !['Completed', 'Cancelled'].includes(status));
};

export const formatCurrency = (value, options = {}) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options
  }).format(Number.isFinite(number) ? number : 0);
};

export const formatCompactNumber = value => new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1
}).format(Number(value || 0));
