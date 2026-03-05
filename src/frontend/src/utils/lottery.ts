/**
 * Convert bigint nanoseconds timestamp to JS Date
 */
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns / BigInt(1_000_000)));
}

/**
 * Format bigint nanoseconds timestamp to a readable date string
 */
export function formatDrawDate(ns: bigint): string {
  const date = nsToDate(ns);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format bigint nanoseconds timestamp to a short relative/absolute format
 */
export function formatVisitTime(ns: bigint): string {
  const date = nsToDate(ns);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Convert JS Date to nanoseconds bigint for backend
 */
export function dateToNs(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

/**
 * Format price (bigint tokens) for display
 */
export function formatPrice(price: bigint): string {
  return Number(price).toLocaleString();
}

/**
 * Shorten a session ID for display
 */
export function shortSession(sessionId: string): string {
  return `${sessionId.slice(0, 8)}…`;
}

/**
 * Format page name for display
 */
export function formatPageName(page: string): string {
  const map: Record<string, string> = {
    "/": "Home",
    "/my-tickets": "My Tickets",
    "/admin": "Admin",
  };
  return map[page] ?? page;
}

/**
 * Is a lottery's draw date in the past?
 */
export function isDrawDatePast(drawDate: bigint): boolean {
  return nsToDate(drawDate).getTime() < Date.now();
}

/**
 * Pad ticket number for display
 */
export function formatTicketNumber(n: bigint): string {
  return String(Number(n)).padStart(6, "0");
}
