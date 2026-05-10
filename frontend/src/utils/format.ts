/**
 * Formatting Utilities for Spanish (Mexico) - es-MX
 *
 * Provides consistent formatting for:
 * - Currency (Mexican Pesos)
 * - Dates and Times
 * - Numbers
 */

const LOCALE = 'es-MX';
const CURRENCY = 'MXN';
const TIMEZONE = 'America/Mexico_City';

/**
 * Formats a number as Mexican Pesos currency
 * @param amount - Amount to format
 * @param showCurrency - Whether to show currency code (default: true)
 * @returns Formatted currency string (e.g., "$1,250.00 MXN")
 */
export const formatCurrency = (amount: number, showCurrency: boolean = true): string => {
  const formatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatted = formatter.format(amount);

  // If showCurrency is false, remove the currency code
  if (!showCurrency) {
    return formatted.replace(/\s?MXN$/i, '').trim();
  }

  // Ensure MXN is always shown
  if (!formatted.includes('MXN')) {
    return `${formatted} MXN`;
  }

  return formatted;
};

/**
 * Formats a number as simple currency without symbol
 * @param amount - Amount to format
 * @returns Formatted number (e.g., "1,250.00")
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a date in Spanish (Mexico) format
 * @param date - Date string or Date object
 * @param format - Format type ('short', 'long', 'full')
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'long'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
  };

  switch (format) {
    case 'short':
      // Example: "15/05/2026"
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;

    case 'long':
      // Example: "15 de mayo de 2026"
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;

    case 'full':
      // Example: "viernes, 15 de mayo de 2026"
      options.weekday = 'long';
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
  }

  return new Intl.DateTimeFormat(LOCALE, options).format(dateObj);
};

/**
 * Formats a time in 12-hour format
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

/**
 * Formats a date and time together
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha y hora inválidas';
  }

  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

/**
 * Formats a relative time (e.g., "hace 2 días")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, 'day');
  }
  if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, 'hour');
  }
  if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(diffInMinutes, 'minute');
  }
  return rtf.format(diffInSeconds, 'second');
};

/**
 * Formats a number with thousands separator
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1,250")
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat(LOCALE).format(value);
};

/**
 * Formats a percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "75%")
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Pluralizes a word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns Appropriate form based on count
 */
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

/**
 * Formats event date for display
 * Combines date and time in a user-friendly format
 * @param date - Event date string or Date object
 * @returns Formatted event date (e.g., "Viernes, 15 de mayo de 2026 a las 10:30 AM")
 */
export const formatEventDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const datePart = formatDate(dateObj, 'full');
  const timePart = formatTime(dateObj);

  return `${datePart} a las ${timePart}`;
};
