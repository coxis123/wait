export const Colors = {
  background: '#000000',
  card: '#1a1a1a',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  primary: '#8b5cf6',
  primaryGradientStart: '#8b5cf6',
  primaryGradientEnd: '#ec4899',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  white: '#ffffff',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const WaitPeriodOptions = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

export const formatCurrency = (amount: number): string => {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export const daysBetween = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const daysRemaining = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const isReady = (dueDate: string): boolean => {
  return new Date(dueDate) <= new Date();
};

export const progressPercentage = (createdAt: string, dueDate: string): number => {
  const created = new Date(createdAt).getTime();
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const total = due - created;
  const elapsed = now - created;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};
