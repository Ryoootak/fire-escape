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

---

## Day 3 — スライダー × ハプティック連動（2026-05-25）完了 ✅

### やったこと

| ファイル | 内容 |
|---|---|
| `src/components/SliderRow.tsx` | 単体スライダー。§4.1.1 のハプティックスロットリング実装 |
| `src/components/InputPanel.tsx` | 4スライダーをまとめたパネル。範囲・ステップ・表示フォーマットを集約 |
| `App.tsx` | `useMemo` で calcEscape をスライダー値に同期。SafeAreaView + ダーク背景 |
| `package.json` | `@react-native-community/slider` / `expo-haptics` 追加 |

### 設計判断・メモ

- **ハプティックスロットリング**：`onValueChange` を `prevValueRef` と比較し、値が変わった時のみ `selectionAsync()` を発火。step を slider 側に設定しているのでステップ境界以外では実質発火しないが、OS が同値で連続発火するケースも `!== チェック` でカバー。
- **annualRate スライダー**：step=0.001（0.1%刻み）。表示は `Math.round(rate * 1000) / 10` で浮動小数点誤差を吸収してから `toFixed(1)+'%'`。
- **`useState<number>(defaults.xxx)`** で型引数を明示：`defaults as const` によるリテラル型推論が `Dispatch<SetStateAction<8000000>>` になる問題を回避。
- **`useMemo` でリアルタイム計算**：スライダー値が変わるたびに `calcEscape` を再計算。`totalSeconds` も memoize し、EscapeTimer の `useEffect` がリセット・再スタートをかける。
- ダークモード基本レイアウト（`colors.bg` 背景 / `colors.panel` パネル）を実装。glow・ノイズ・テクスチャは Day 4 の仕上げスコープ。

- `tsc --noEmit` エラーなし、`npm test` 10/10 通過
- コミット：`スライダー×ハプティック連動・ダークUI実装（Day 3完了）`

---

---

## Day 4-5 — 起動演出・煽り・シェア画像（2026-05-25）完了 ✅

### やったこと

| ファイル | 内容 |
|---|---|
| `src/lib/tier.ts` | `getTier()` — months/status から称号を逆引き |
| `src/lib/hint.ts` | `calcShortage()` / `easeOutCubic()` |
| `src/components/TierTag.tsx` | 称号タグ（§4.3） |
| `src/components/EscapeButton.tsx` | 起動ボタン（idle 時に中央表示） |
| `src/components/HintText.tsx` | 「あと月◯万円稼げれば、一生自由。」（§4.4、5万円以内閾値） |
| `src/components/ShareCard.tsx` | シェア画像カード（forwardRef で captureRef 対象） |
| `src/components/EscapeTimer.tsx` | mode prop 追加（idle / countup / countdown） |
| `App.tsx` | フェーズ管理・演出シーケンス・全体オーケストレーション |
| `package.json` | `react-native-view-shot` / `expo-sharing` 追加 |

### 演出シーケンス実装（§3.2 / §7 準拠）

| タイミング | 内容 | 実装方法 |
|---|---|---|
| 0ms | Heavy haptic「ドクン」 | `Haptics.impactAsync(Heavy)` |
| 0–300ms | タイマーフェードイン | `Animated.timing` opacity 0→1 |
| 300–1500ms | 爆速カウントアップ | 16ms interval + `easeOutCubic` |
| 1500ms | Light haptic 着地 | `Haptics.impactAsync(Light)` |
| 1700ms | カウントダウン開始 | phase → 'running' |

### 設計判断・メモ

- **フェーズ状態機械**：`idle → launching → running` の3段階。launching 中はカウントアップ値を App.tsx が 16ms インターバルで駆動し、EscapeTimer は表示のみ担当。
- **INFINITE 演出の簡略化**：TRUE_INFINITE / PRACTICAL_INFINITE の場合はカウントアップなし。フェードイン後に即 Success haptic + 緑グロー → running へ。
- **INFINITE転換グロー**：`result.status` の変化を `useEffect` で監視。DEPLETE→TRUE_INFINITE で `glowAnim` を 0→1 にアニメーション（250ms）、逆方向も対称に実装。
- **アニメーション**：Reanimated ではなく RN 組み込みの `Animated` API を使用。起動演出は一発もの＋1秒インターバルなので過剰な UI スレッド処理は不要と判断。Reanimated はスライダー連動の 60fps チューニングが必要な場面（Day 3 以降の実機調整）で再検討。
- **シェア機能**：`react-native-view-shot` + `expo-sharing` で実装済み。ShareCard は画面外（left: -9999）でレンダリングして captureRef。**Expo Go では view-shot が動作しない場合があり、EAS Build（カスタム開発ビルド）が必要**。try/catch で Expo Go でもクラッシュしないように対応済み。

- `tsc --noEmit` エラーなし、`npm test` 10/10 通過
- コミット：`起動演出・称号・煽りテキスト・シェア機能実装（Day 4-5完了）`

---

## 現状のアプリ全体像（全 Day 完了）

- **Day 1**：calcEscape 純粋関数・テスト
- **Day 2**：JetBrains Mono タイマー UI
- **Day 3**：4スライダー × ハプティック連動（Tick スロットリング）
- **Day 4-5**：ESCAPE 起動演出・称号タグ・希望枠煽り・シェア画像

## 残課題（実機チューニング・リリース前）

- Tick ハプティックの実機体感チューニング（§4.1.1）
- EAS Build でシェア機能の動作確認
- グロー・ノイズ・テクスチャのビジュアル仕上げ
- App Store / Google Play へのリリース準備
