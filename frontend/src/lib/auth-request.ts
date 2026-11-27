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