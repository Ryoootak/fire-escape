import { tiers } from './tokens';
import type { EscapeStatus } from './calcEscape';

export type Tier = typeof tiers[number];

export function getTier(months: number | null, status: EscapeStatus): Tier {
  if (status !== 'DEPLETE' || months === null) {
    return tiers[tiers.length - 1]; // 監獄からの完全脱獄（FIRE）
  }
  const years = months / 12;
  // 最初にマッチする上限を持つ称号を返す（最後の Infinity が常に保険になる）
  return tiers.find(t => years < t.maxYears) ?? tiers[tiers.length - 1];
}
