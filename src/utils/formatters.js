import { toPersianDigits } from './jalali';

// Format numbers with comma grouping and Toman unit
export function formatToman(amount, includeUnit = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return '۰ تومان';
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const persianFormatted = toPersianDigits(formatted);
  return includeUnit ? `${persianFormatted} تومان` : persianFormatted;
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '۰٪';
  return `${toPersianDigits(value)}٪`;
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  return toPersianDigits(phone);
}
