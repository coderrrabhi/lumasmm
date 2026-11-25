import { describe, expect, it } from 'vitest';
import { TELEGRAM_CHANNEL_URL, TELEGRAM_SUPPORT_URL, TELEGRAM_SUPPORT_USERNAME } from '../lib/contacts';
describe('Luma official Telegram contacts', () => {
  it('uses the official Luma channel', () => { expect(TELEGRAM_CHANNEL_URL).toBe('https://t.me/lumasmmofficial'); });
  it('uses the official Luma support', () => { expect(TELEGRAM_SUPPORT_USERNAME).toBe('lumasmmsupport'); expect(TELEGRAM_SUPPORT_URL).toBe('https://t.me/lumasmmsupport'); });
});
