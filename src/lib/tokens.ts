export const colors = {
  bg: '#050505',
  panel: '#111111',
  fire: '#FF4500',
  escape: '#00E676',
  text: '#FFFFFF',
  muted: '#888888',
} as const;

export const tiers = [
  { maxYears: 0,        label: '明日も出社確定（ゾンビ）',     color: '#888888' },
  { maxYears: 1,        label: '刹那的自由（来年ニート）',     color: '#FF4500' },
  { maxYears: 3,        label: '限定的モラトリアム',           color: '#FF8C00' },
  { maxYears: 10,       label: '中長期的マベリック',           color: '#FFD400' },
  { maxYears: 30,       label: '半永久的エスケープ成功',       color: '#4FA3FF' },
  { maxYears: Infinity, label: '監獄からの完全脱獄（FIRE）',   color: '#00E676' },
] as const;

export const defaults = {
  assets: 8_000_000,
  monthlyCost: 250_000,
  sideIncome: 50_000,
  annualRate: 0.04,
} as const;
