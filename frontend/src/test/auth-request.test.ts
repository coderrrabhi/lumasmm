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