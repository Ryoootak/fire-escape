// インフレ調整は意図的に実装しない。
// リアルにすると夢がなくなりシェア価値が削がれるため、精度を犠牲にした設計判断。

export type EscapeStatus = 'TRUE_INFINITE' | 'PRACTICAL_INFINITE' | 'DEPLETE';

export interface EscapeResult {
  status: EscapeStatus;
  months: number | null; // DEPLETE のときのみ枯渇までの月数。INFINITE系は null
}

// 100年を超えて生き残ればPRACTICAL_INFINITEとみなすシミュレーション上限
const MAX_MONTHS = 1200;

export function calcEscape(
  assets: number,       // 総資産(円)
  monthlyCost: number,  // 毎月の生活費(円)
  sideIncome: number,   // 退職後ミニマム収入(円/月)
  annualRate: number,   // 年利(小数: 0.04 = 4%)
): EscapeResult {
  const netDraw = monthlyCost - sideIncome;
  const monthlyRate = annualRate / 12;

  // TRUE_INFINITE：初月運用益 >= 純減額（資産が減らない＝完全脱獄）
  if (assets * monthlyRate >= netDraw) {
    return { status: 'TRUE_INFINITE', months: null };
  }

  // 月次シミュレーション（仕様書 §4.2 の処理順序を厳守）
  let balance = assets;
  for (let i = 0; i < MAX_MONTHS; i++) {
    balance += balance * monthlyRate; // 1. 運用益加算
    balance -= netDraw;               // 2. 純減額控除
    // 3. 経過月数 = i + 1
    if (balance <= 0) {               // 4. 枯渇判定
      return { status: 'DEPLETE', months: i + 1 };
    }
  }

  // MAX_MONTHS ヶ月後も残高あり → 実質無限
  return { status: 'PRACTICAL_INFINITE', months: null };
}
