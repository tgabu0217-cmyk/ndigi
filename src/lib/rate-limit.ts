// 簡易レート制限（インメモリ）。
// Vercelのサーバーレス環境ではインスタンスごとにメモリが分かれるため完全な制限ではないが、
// 単純な連打・bot的アクセスを抑止する一次防御として機能する。
// 本格的な制限が必要になった場合は Upstash Redis 等の外部ストアに置き換えること。

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// 古いバケットを定期的に掃除（メモリリーク防止）
function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/**
 * key（例: `userId:save-npc`）ごとに、windowMs の間に limit 回までのアクセスを許可する。
 * 戻り値: 許可されたら null、制限に達していたらリトライまでの秒数。
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): number | null {
  const now = Date.now();
  if (buckets.size > 5000) cleanup(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    return Math.ceil((existing.resetAt - now) / 1000);
  }

  existing.count += 1;
  return null;
}
