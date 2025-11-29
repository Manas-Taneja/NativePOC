export function formatRelativeTime(value: string | number | Date): string {
  // Guard against undefined/null and invalid dates to prevent runtime errors
  if (value === undefined || value === null) {
    return "just now";
  }

  const date =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : (value as Date);

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "just now";
  }

  const diff = date.getTime() - Date.now();
  const minutes = Math.round(Math.abs(diff) / 60000);
  if (minutes < 1) return "just now";
  if (diff > 0) {
    if (minutes < 60) return `in ${minutes}m`;
    const hoursAhead = Math.round(minutes / 60);
    if (hoursAhead < 24) return `in ${hoursAhead}h`;
    const daysAhead = Math.round(hoursAhead / 24);
    return `in ${daysAhead}d`;
  }
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function formatAsPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
