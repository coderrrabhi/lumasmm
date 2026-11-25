import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');
describe('Luma deployment isolation', () => {
 it('uses its own API domain', () => {
  expect(read('.env')).toContain('VITE_SUPABASE_URL=https://api.lumasmm.com');
  expect(read('.env')).not.toContain('api.zolosmm.com');
 });
 it('payment returns stay on Luma', () => {
  for (const p of ['oxapay-create-invoice', 'zapupi-create-order', 'zapupi-return']) {
   const s = read('/root/lumasmm/docker/volumes/functions/' + p + '/index.ts');
   expect(s).toContain('lumasmm.com'); expect(s).not.toContain('zolosmm.com');
  }
 });
 it('scheduled orders use only the new API port', () => {
  const s = read('/root/lumasmm/run-schedule.sh');
  expect(s).toContain('127.0.0.1:8100'); expect(s).not.toContain('127.0.0.1:8000');
 });
});
