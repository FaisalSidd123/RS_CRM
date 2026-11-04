import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a number with South Asian numbering system (e.g., 2,50,00,000)
 */
export function formatSouthAsianNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  
  const str = absAmount.toString();
  if (str.length <= 3) {
    return (isNegative ? '-' : '') + str;
  }
  
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return (isNegative ? '-' : '') + formattedOthers + ',' + lastThree;
}

/**
 * Full PKR format with commas: e.g. "PKR 2,50,00,000"
 */
export function formatPKRFull(amount: number): string {
  return `PKR ${formatSouthAsianNumber(amount)}`;
}

/**
 * Formats amount in Lakh and Crore.
 * >= 1 Crore (10,000,000) -> "2.5 Crore"
 * >= 1 Lakh (100,000) -> "1.5 Lakh"
 * < 1 Lakh -> "PKR 85,000"
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'PKR 0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    const croreVal = absAmount / 10000000;
    const formatted = parseFloat(croreVal.toFixed(2));
    return `${isNegative ? '-' : ''}${formatted} Crore`;
  }
  
  if (absAmount >= 100000) {
    const lakhVal = absAmount / 100000;
    const formatted = parseFloat(lakhVal.toFixed(2));
    return `${isNegative ? '-' : ''}${formatted} Lakh`;
  }

  return `${isNegative ? '-' : ''}PKR ${formatSouthAsianNumber(absAmount)}`;
}

/**
 * Formats area with Pakistani units: "500 sq yd", "10 Marla", "1 Kanal", "1,200 sq ft"
 */
export function formatArea(value: number, unit: string): string {
  return `${formatSouthAsianNumber(value)} ${unit}`;
}

/**
 * Formats Pakistani mobile number to "0300-1234567" format
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return `0${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Masks phone number based on role: "0300-12•••••"
 */
export function maskPhone(phone: string): string {
  const formatted = formatPhone(phone);
  if (formatted.length >= 7) {
    return formatted.slice(0, 7) + '•••••';
  }
  return '0300-12•••••';
}

/**
 * Formats date into standard "04 Nov 2026"
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return String(dateInput);
    return format(d, 'dd MMM yyyy');
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time into "4:30 PM"
 */
export function formatTime(timeInput: string | Date | undefined | null): string {
  if (!timeInput) return '-';
  try {
    if (typeof timeInput === 'string' && timeInput.includes(':') && !timeInput.includes('T')) {
      // standard HH:mm or HH:mm:ss string
      const [h, m] = timeInput.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    const d = typeof timeInput === 'string' ? parseISO(timeInput) : timeInput;
    if (!isValid(d)) return String(timeInput);
    return format(d, 'h:mm a');
  } catch {
    return String(timeInput);
  }
}

/**
 * Formats date and time: "04 Nov 2026, 4:30 PM"
 */
export function formatDateTime(dateTimeInput: string | Date | undefined | null): string {
  if (!dateTimeInput) return '-';
  try {
    const d = typeof dateTimeInput === 'string' ? parseISO(dateTimeInput) : dateTimeInput;
    if (!isValid(d)) return String(dateTimeInput);
    return format(d, 'dd MMM yyyy, h:mm a');
  } catch {
    return String(dateTimeInput);
  }
}

