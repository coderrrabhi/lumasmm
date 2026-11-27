import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAuthWithTimeout, withAuthDeadline } from '../lib/auth-request';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('auth waiting limits', () => {
  it('returns successful authentication unchanged', async () => {
    const result = { error: null };
    expect(await withAuthDeadline(Promise.resolve(result))).toBe(result);
  });
  it('releases a permanently pending auth operation after 30 seconds', async () => {
    vi.useFakeTimers();
    const result = withAuthDeadline(new Promise<never>(() => {}));
    const assertion = expect(result).rejects.toThrow('Connection timed out');
    await vi.advanceTimersByTimeAsync(30000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
  it('aborts a stalled HTTP auth request after 20 seconds', async () => {
    vi.useFakeTimers();
    let observedSignal: AbortSignal | null = null;
    vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init: RequestInit) => new Promise<Response>((_resolve, reject) => {
      observedSignal = init.signal ?? null;
      observedSignal?.addEventListener('abort', () => reject(new Error('aborted')));
    })));
    const result = fetchAuthWithTimeout('https://example.com/auth/v1/signup');
    const assertion = expect(result).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(20000);
    await assertion;
    expect((observedSignal as AbortSignal | null)?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves authentication failures instead of showing success', async () => {
    await expect(withAuthDeadline(Promise.reject(new Error('invalid credentials')))).rejects.toThrow('invalid credentials');
  });
});
import { fetchWithRequestTimeout, requestTimeoutFor } from '../lib/auth-request';
describe('app request waiting limits', () => {
  it('gives order functions 90 seconds and reads 30 seconds', () => {
    expect(requestTimeoutFor('https://api.x/functions/v1/place-order')).toBe(90000);
    expect(requestTimeoutFor('https://api.x/rest/v1/orders')).toBe(30000);
  });
  it('releases a stalled order request with a check-your-orders message', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', (_: unknown, init: RequestInit) => new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))));
    const result = fetchWithRequestTimeout('https://api.x/functions/v1/place-order', {}, 90000);
    const assertion = expect(result).rejects.toThrow('may still be processing');
    await vi.advanceTimersByTimeAsync(90000);
    await assertion;
  });
});
