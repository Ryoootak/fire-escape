import { calcEscape } from './calcEscape';

// 仕様書 §4.2 確定テストケース

describe('calcEscape', () => {
  test('デフォルト値 → DEPLETE 44ヶ月', () => {
    const result = calcEscape(8_000_000, 250_000, 50_000, 0.04);
    expect(result.status).toBe('DEPLETE');
    expect(result.months).toBe(44);
  });

  test('副収入ゼロ → DEPLETE 34ヶ月', () => {
    const result = calcEscape(8_000_000, 250_000, 0, 0.04);
    expect(result.status).toBe('DEPLETE');
    expect(result.months).toBe(34);
  });

  test('利回りゼロ → DEPLETE 40ヶ月', () => {
    const result = calcEscape(8_000_000, 250_000, 50_000, 0.0);
    expect(result.status).toBe('DEPLETE');
    expect(result.months).toBe(40);
  });

  test('即破産級 → DEPLETE 2ヶ月', () => {
    const result = calcEscape(500_000, 250_000, 0, 0.0);
    expect(result.status).toBe('DEPLETE');
    expect(result.months).toBe(2);
  });

  test('高資産・無限 → TRUE_INFINITE', () => {
    const result = calcEscape(100_000_000, 250_000, 0, 0.04);
    expect(result.status).toBe('TRUE_INFINITE');
    expect(result.months).toBeNull();
  });

  test('副収入で逃げ切り（netDraw=0） → TRUE_INFINITE', () => {
    const result = calcEscape(5_000_000, 200_000, 200_000, 0.0);
    expect(result.status).toBe('TRUE_INFINITE');
    expect(result.months).toBeNull();
  });

  // INFINITE境界：6,000万ちょうど（初月運用益 = 純減額）→ TRUE_INFINITE
  test('INFINITE境界ちょうど 6,000万 → TRUE_INFINITE', () => {
    const result = calcEscape(60_000_000, 250_000, 50_000, 0.04);
    expect(result.status).toBe('TRUE_INFINITE');
    expect(result.months).toBeNull();
  });

  // INFINITE境界の手前：5,999万（初月運用益 < 純減額、かつ1200ヶ月超で枯渇）
  // 仕様書の検算注釈で「5,999万でDEPLETE」と記載があるが、
  // 3状態分類ロジック上は1200ヶ月以内に枯渇しないためPRACTICAL_INFINITEとなる。
  // ここでは「TRUE_INFINITEでないこと」（境界テストの核心）を確認する。
  test('境界ぎりぎり手前 5,999万 → TRUE_INFINITEでない', () => {
    const result = calcEscape(59_990_000, 250_000, 50_000, 0.04);
    expect(result.status).not.toBe('TRUE_INFINITE');
    // 初月運用益: 59,990,000 × 0.04/12 ≈ 199,967 < 200,000 → 純減が上回る
    // 1200ヶ月以内には枯渇しないためPRACTICAL_INFINITEになる
    expect(result.status).toBe('PRACTICAL_INFINITE');
    expect(result.months).toBeNull();
  });

  test('長持ちだが運用益不足（netDraw=1,000円/月）→ PRACTICAL_INFINITE', () => {
    const result = calcEscape(5_000_000, 200_000, 199_000, 0.0);
    expect(result.status).toBe('PRACTICAL_INFINITE');
    // 5,000,000 / 1,000 = 5,000ヶ月（> 1,200ヶ月）
    expect(result.months).toBeNull();
  });

  test('資産1億・生活50万・利回り0 → DEPLETE 200ヶ月', () => {
    const result = calcEscape(100_000_000, 500_000, 0, 0.0);
    expect(result.status).toBe('DEPLETE');
    expect(result.months).toBe(200);
  });
});
