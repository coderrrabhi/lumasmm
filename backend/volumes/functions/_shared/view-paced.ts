export interface PaceRun {
  scheduled_at: string
  quantity_to_send: number
}

export const VIEW_TYPES = ['views', 'impressions', 'reach', 'plays', 'story_views']
export const PACED_TYPES = ['likes', 'comments', 'shares', 'reposts', 'retweets', 'saves', 'bookmarks', 'favorites']

/** Small batches, exact totals, distinct amounts whenever mathematically possible. */
export function smallBatches(total: number, minimum: number, random = Math.random): number[] {
  const min = Math.max(1, Math.ceil(minimum))
  const quantity = Math.floor(total)
  if (quantity < min) throw new Error('Quantity below provider minimum')
  const count = Math.max(1, Math.min(1000, Math.floor(quantity / (min * 1.3))))
  const unique = count * min + count * (count - 1) / 2 <= quantity
  const amounts = Array.from({ length: count }, (_, i) => min + (unique ? i : 0))
  let spare = quantity - amounts.reduce((sum, q) => sum + q, 0)
  const even = Math.floor(spare / count)
  for (let i = 0; i < count; i++) {
    const amount = amounts[i]
    if (amount !== undefined) amounts[i] = amount + even
  }
  spare -= even * count
  while (spare > 0) {
    const index = Math.min(count - 1, Math.floor(random() * count))
    const current = amounts[index]
    if (current === undefined) continue
    // Keep all batches near the minimum instead of creating a giant final run.
    const smallest = Math.min(...amounts)
    if (current > smallest + Math.max(min, count) && count > 1) continue
    if (unique && amounts.includes(current + 1)) continue
    amounts[index] = current + 1
    spare--
  }
  if (!unique) for (let i = 0; i < count * 3; i++) {
    const from = Math.min(count - 1, Math.floor(random() * count))
    const to = Math.min(count - 1, Math.floor(random() * count))
    const a = amounts[from], b = amounts[to]
    if (from === to || a === undefined || b === undefined || a <= min || b >= quantity / count + min) continue
    amounts[from] = a - 1; amounts[to] = b + 1
  }
  for (let i = amounts.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    const a = amounts[i], b = amounts[j]
    if (a === undefined || b === undefined) continue
    amounts[i] = b; amounts[j] = a
  }
  // Avoid neighbouring repeats when distinct amounts are not feasible.
  if (!unique) for (let i = 1; i < amounts.length; i++) {
    const a = amounts[i], previous = amounts[i - 1]
    if (a === undefined || a !== previous) continue
    const j = amounts.findIndex((q, k) => k > i && q !== a)
    const b = amounts[j]
    if (j >= 0 && b !== undefined) { amounts[i] = b; amounts[j] = a }
  }
  return amounts
}

/** Follow cumulative views, not an independently randomised engagement clock. */
export function viewPacedRuns(views: PaceRun[], total: number, minimum: number, random = Math.random): PaceRun[] {
  const sorted = [...views].filter(r => r.quantity_to_send > 0)
    .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at))
  const first = sorted[0], last = sorted[sorted.length - 1]
  if (!first || !last) throw new Error('Views schedule unavailable')
  const viewTotal = sorted.reduce((sum, r) => sum + r.quantity_to_send, 0)
  const quantities = smallBatches(total, minimum, random)
  let cumulative = 0
  let previousMs = Date.parse(first.scheduled_at)
  return quantities.map(quantity => {
    cumulative += quantity
    const threshold = cumulative / total * viewTotal
    let seen = 0, anchor = last
    for (const view of sorted) {
      seen += view.quantity_to_send
      if (seen + 1e-8 >= threshold) { anchor = view; break }
    }
    // Random seconds only AFTER the corresponding views run. Actual dispatch
    // still waits for confirmed delivery in the database claim transaction.
    const anchorMs = Date.parse(anchor.scheduled_at)
    const end = Date.parse(last.scheduled_at) + 60_000
    const time = Math.min(end, Math.max(previousMs + 1000, anchorMs + 1000 + Math.floor(random() * 45_000)))
    previousMs = time
    return { scheduled_at: new Date(time).toISOString(), quantity_to_send: quantity }
  })
}

/** Catalogue selling minimum need not equal a mapped provider's run minimum. */
export async function mappedMinimum(db: any, serviceId: string, fallback: number): Promise<number> {
  const { data: mappings, error } = await db.from('service_provider_mapping')
    .select('provider_account_id, provider_service_id').eq('service_id', serviceId).eq('is_active', true)
  if (error) throw new Error(error.message)
  if (!mappings?.length) return Math.max(1, fallback)
  const { data: accounts, error: accountError } = await db.from('provider_accounts')
    .select('id, provider_id').in('id', mappings.map((m: any) => m.provider_account_id)).eq('is_active', true)
  if (accountError) throw new Error(accountError.message)
  const { data: services, error: serviceError } = await db.from('services')
    .select('provider_id, provider_service_id, min_quantity').in('provider_service_id', mappings.map((m: any) => m.provider_service_id))
  if (serviceError) throw new Error(serviceError.message)
  const minimums: number[] = []
  for (const mapping of mappings) {
    const account = accounts?.find((a: any) => a.id === mapping.provider_account_id)
    if (!account) continue
    const matches = services?.filter((s: any) => s.provider_service_id === mapping.provider_service_id
      && [account.provider_id, String(account.provider_id).replace(/just$/i, '')].includes(s.provider_id)) ?? []
    // Conflicting catalogue rows: use the conservative maximum for this mapping.
    const min = Math.max(...matches.map((s: any) => Number(s.min_quantity) || fallback), fallback && !matches.length ? fallback : 1)
    minimums.push(min)
  }
  return minimums.length ? Math.min(...minimums) : Math.max(1, fallback)
}