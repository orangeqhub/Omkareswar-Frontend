export function onIdle(cb, timeoutMs = 2000) {
  if (typeof window === 'undefined') {
    return setTimeout(cb, 0);
  }
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}