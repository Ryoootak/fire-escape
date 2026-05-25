# FIRE Escape — 開発進捗ログ

仕様書の正は `FIRE-Escape_Spec.md`。このファイルは「いつ何をやったか・なぜその判断をしたか」の記録。

---

## セットアップ（2026-05-25）

- `create-expo-app@latest . --template blank-typescript` で Expo プロジェクト初期化
- `FIRE-Escape_Spec.md`（製品仕様書）・`CLAUDE.md`（常駐ルール）と同居する形で配置
- `.gitignore` は Expo デフォルト（`node_modules/`、`.expo/`、`dist/` 等を除外）
- コミット：`Expoプロジェクト初期化・仕様書・常駐ルール追加`

---

## Day 1 — 計算ロジック確立（2026-05-25）完了 ✅

### やったこと

| ファイル | 内容 |
|---|---|
| `src/lib/tokens.ts` | §9.1 のデザイントークン。色・称号 tier・デフォルト値をここに集約 |
| `src/lib/calcEscape.ts` | §4.2 の純粋関数 `calcEscape`。副作用なし・UI非依存 |
| `src/lib/calcEscape.test.ts` | 確定テスト10件。全通過 |
| `package.json` / `tsconfig.json` | Jest（ts-jest）セットアップ |

### テスト結果（10 / 10 通過）

```
✓ デフォルト値         → DEPLETE / 44ヶ月
✓ 副収入ゼロ           → DEPLETE / 34ヶ月
✓ 利回りゼロ           → DEPLETE / 40ヶ月
✓ 即破産級             → DEPLETE / 2ヶ月
✓ 高資産・無限         → TRUE_INFINITE
✓ 副収入で逃げ切り     → TRUE_INFINITE（netDraw = 0 のケース）
✓ INFINITE境界ちょうど → TRUE_INFINITE（6,000万ちょうど）
✓ 境界ぎりぎり手前     → TRUE_INFINITE でない（5,999万 → PRACTICAL_INFINITE）
✓ 長持ちだが運用益不足 → PRACTICAL_INFINITE（5,000ヶ月超）
✓ 資産1億・生活50万    → DEPLETE / 200ヶ月
```

### 設計判断・メモ

- **月次処理順序**：`運用益加算 → 純減控除 → 月数カウント → 枯渇判定` の順を厳守（仕様書 §4.2）。順序を変えると秒カウントがズレる。
- **インフレ調整は実装しない**：精度より体験・シェア価値を優先した意図的な設計判断（仕様書 §4.2 に明記）。`calcEscape.ts` にコメントで記録済み。
- **PRACTICAL_INFINITE の境界テスト**：仕様書では「5,999万 → DEPLETE（巨大な月数）」と記載があるが、3状態分類ロジック上は1200ヶ月（100年）以内に枯渇しないため `PRACTICAL_INFINITE` が正しい返り値。「DEPLETE（巨大な月数）」は実際には膨大な月数になるという注釈であり、PRACTICAL_INFINITE として扱う方針を確認済み。

- コミット：`計算ロジックcalcEscape実装・テスト全通過（Day 1完了）`

---

---

## Day 2 — 爆速タイマーUI（2026-05-25）完了 ✅

### やったこと

| ファイル | 内容 |
|---|---|
| `src/lib/formatTime.ts` | `monthsToSeconds` / `secondsToComponents` / `pad2`。月→秒換算は 30日/月 固定 |
| `src/components/EscapeTimer.tsx` | 1秒カウントダウンコンポーネント。DEPLETE / INFINITE / 未起動（--）の3状態を表示 |
| `App.tsx` | フォントロード（expo-splash-screen）＋ デフォルト値でタイマーをマウント |
| `package.json` | `@expo-google-fonts/jetbrains-mono` / `expo-font` / `expo-splash-screen` を追加 |

### 設計判断・メモ

- **月→秒換算**：30日/月（= 2,592,000秒）固定。秒→表示の分解も 30日/月・365日/年 で統一し、往復で一貫させた。仕様書に定義なし、シミュレーターとして十分な精度の判断。
- **等幅保証**：JetBrains Mono（真のモノスペースフォント）を使うことで、ゼロパディングした数字が横幅一定となり桁ガタつきゼロを達成。
- **カウントダウン実装**：`setInterval` 1秒 ＋ `useRef` でクリーンアップ管理。`totalSeconds` prop が変わるたびにリセットする設計（Day 3 のスライダー連動の前提）。
- **3状態対応**：DEPLETE → 秒カウントダウン（`--fire`）、TRUE/PRACTICAL_INFINITE → 静的ラベル（`--escape`）、null → グレーアウト `--:--:--`。

- `tsc --noEmit` エラーなし、`npm test` 10/10 通過
- コミット：`爆速タイマーUIコンポーネント実装（Day 2完了）`

---

## 次：Day 3 — スライダー × ハプティック連動（未着手）

- 4つのスライダー（資産・生活費・副収入・利回り）を追加
- スライダー操作でタイマーをリアルタイム伸縮
- `expo-haptics` で Tick ハプティック（§4.1.1 スロットリング）
- ダークモード仕上げ
- Day 3 の指示を受けてから着手すること
