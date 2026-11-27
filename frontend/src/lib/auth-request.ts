// Bound both the UI wait and auth HTTP requests; never report a timeout as success.
export async function withAuthDeadline<T>(operation: PromiseLike<T>, timeoutMs = 30000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Connection timed out. Please check your connection and try signing in.')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function fetchAuthWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const originalSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const forwardAbort = () => controller.abort(originalSignal?.reason);
  if (originalSignal?.aborted) forwardAbort();
  else originalSignal?.addEventListener('abort', forwardAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    originalSignal?.removeEventListener('abort', forwardAbort);
  }
}
// Non-auth requests: bounded so every loading button recovers. Order/payment functions get a
// "may still be processing" message because the server may finish after the browser stops waiting.
export const REQUEST_TIMEOUT_MS = { functions: 90000, storage: 120000, default: 30000 } as const;

export function requestTimeoutFor(url: string): number {
  if (url.includes('/functions/v1/')) return REQUEST_TIMEOUT_MS.functions;
  if (url.includes('/storage/v1/')) return REQUEST_TIMEOUT_MS.storage;
  return REQUEST_TIMEOUT_MS.default;
}

export async function fetchWithRequestTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 30000): Promise<Response> {
  const url = input instanceof Request ? input.url : String(input);
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; }, timeoutMs);
  try {
    return await fetchAuthWithTimeout(input, init, timeoutMs);
  } catch (error) {
    if (timedOut) {
      throw new Error(url.includes('/functions/v1/')
        ? 'Server is taking too long. Your request may still be processing — check your orders/wallet before trying again.'
        : 'Connection timed out. Please check your connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
