// src/lib/events-format.ts
//
// Pure formatting helpers for the Events & Media Hub. No ambient input beyond
// the explicit ISO date strings passed in; no clock reads.

import type { EcosystemEvent } from '@/types';

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export interface DateBlock {
  day: string;   // e.g. "18"
  month: string; // e.g. "Nov"
  year: string;  // e.g. "2026"
}

/** Parse an ISO date (YYYY-MM-DD) into a display date block. Pure. */
export function toDateBlock(iso: string): DateBlock {
  const [year = '', month = '', day = ''] = iso.split('-');
  const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
  return {
    day: String(Number(day) || day),
    month: MONTHS_SHORT[monthIndex] ?? '',
    year,
  };
}

/** Human date range, e.g. "Nov 18–20, 2026" or "Sep 15, 2026". Pure. */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = toDateBlock(startIso);
  const end = toDateBlock(endIso);
  if (startIso === endIso) {
    return `${start.month} ${start.day}, ${start.year}`;
  }
  if (start.month === end.month && start.year === end.year) {
    return `${start.month} ${start.day}\u2013${end.day}, ${start.year}`;
  }
  return `${start.month} ${start.day} \u2013 ${end.month} ${end.day}, ${end.year}`;
}

/** Stable chronological sort by start date (ascending). Returns a NEW array. */
export function sortEventsChronologically(events: readonly EcosystemEvent[]): EcosystemEvent[] {
  return events
    .map((event, index) => ({ event, index }))
    .sort((a, b) =>
      a.event.startDate < b.event.startDate
        ? -1
        : a.event.startDate > b.event.startDate
          ? 1
          : a.index - b.index,
    )
    .map((entry) => entry.event);
}

/** Human label for an event category. */
export function categoryLabel(category: EcosystemEvent['category']): string {
  switch (category) {
    case 'summit':
      return 'Summit';
    case 'demo-day':
      return 'Demo Day';
    case 'hackathon':
      return 'Hackathon';
    case 'convening':
      return 'Convening';
    case 'masterclass':
      return 'Masterclass';
    default:
      return category;
  }
}
