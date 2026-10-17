// Minimal per-instance request cap so a public demo URL cannot run up the API bill.
// Not a real rate limiter: counts reset when the server instance restarts.

const WINDOW_MS = 60 * 60 * 1000;
const limit = Number(process.env.MAX_REQUESTS_PER_HOUR) || 200;

let windowStart = Date.now();
let count = 0;

export function takeRequestSlot(): boolean {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    count = 0;
  }
  if (count >= limit) return false;
  count += 1;
  return true;
}
