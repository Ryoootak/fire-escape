// TRUE_INFINITE 達成に必要な追加副収入額（円/月）を返す
// 正値 = 不足、0以下 = 既に達成（呼び出し元で status チェック済みを前提）
export function calcShortage(
  assets: number,
  monthlyCost: number,
  sideIncome: number,
  annualRate: number,
): number {
  const netDraw = monthlyCost - sideIncome;
  const monthlyReturn = assets * (annualRate / 12);
  return netDraw - monthlyReturn;
}

// カウントアップ用 ease-out（速く始まって終盤で減速）
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
