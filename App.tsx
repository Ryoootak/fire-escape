import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFonts, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { EscapeTimer, type TimerMode } from './src/components/EscapeTimer';
import { EscapeButton } from './src/components/EscapeButton';
import { InputPanel } from './src/components/InputPanel';
import { TierTag } from './src/components/TierTag';
import { HintText } from './src/components/HintText';
import { ShareCard } from './src/components/ShareCard';

import { calcEscape } from './src/lib/calcEscape';
import { monthsToSeconds, secondsToComponents, pad2 } from './src/lib/formatTime';
import { calcShortage, easeOutCubic } from './src/lib/hint';
import { getTier } from './src/lib/tier';
import { colors, defaults } from './src/lib/tokens';

SplashScreen.preventAutoHideAsync();

type Phase = 'idle' | 'launching' | 'running';

// 起動演出タイミング（ms）
const T_FADE_IN   = 300;
const T_COUNTUP   = 1200;
const T_LAND      = T_FADE_IN + T_COUNTUP;        // 1500ms
const T_RUNNING   = T_LAND + 200;                 // 1700ms

export default function App() {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  // ---- 入力パラメーター ----
  const [assets, setAssets]           = useState<number>(defaults.assets);
  const [monthlyCost, setMonthlyCost] = useState<number>(defaults.monthlyCost);
  const [sideIncome, setSideIncome]   = useState<number>(defaults.sideIncome);
  const [annualRate, setAnnualRate]   = useState<number>(defaults.annualRate);

  // ---- 計算結果 ----
  const result = useMemo(
    () => calcEscape(assets, monthlyCost, sideIncome, annualRate),
    [assets, monthlyCost, sideIncome, annualRate],
  );
  const totalSeconds = useMemo(
    () => (result.status === 'DEPLETE' && result.months !== null
      ? monthsToSeconds(result.months)
      : null),
    [result],
  );
  const tier = useMemo(() => getTier(result.months, result.status), [result]);
  const shortage = useMemo(
    () => calcShortage(assets, monthlyCost, sideIncome, annualRate),
    [assets, monthlyCost, sideIncome, annualRate],
  );

  // ---- フェーズ管理 ----
  const [phase, setPhase]             = useState<Phase>('idle');
  const [countupSeconds, setCountupSeconds] = useState(0);
  const countupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- アニメーション値 ----
  const timerFadeAnim  = useRef(new Animated.Value(0)).current; // タイマーフェードイン
  const glowAnim       = useRef(new Animated.Value(0)).current; // INFINITE転換グロー

  // ---- INFINITE転換：ステータス変化を監視 ----
  const prevStatusRef = useRef(result.status);
  useEffect(() => {
    if (phase !== 'running') { prevStatusRef.current = result.status; return; }
    const prev = prevStatusRef.current;
    const curr = result.status;
    prevStatusRef.current = curr;

    if (curr === 'TRUE_INFINITE' && prev !== 'TRUE_INFINITE') {
      // DEPLETE → INFINITE：Success haptic + 緑グロー
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(glowAnim, {
        toValue: 1, duration: 250, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
      }).start();
    } else if (curr !== 'TRUE_INFINITE' && prev === 'TRUE_INFINITE') {
      // INFINITE → DEPLETE：グロー消灯
      Animated.timing(glowAnim, {
        toValue: 0, duration: 250, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
      }).start();
    }
  }, [result.status, phase, glowAnim]);

  // ---- ESCAPE ボタン押下 ----
  function handleEscapePress() {
    if (phase !== 'idle') return;

    // ①「ドクン」Heavy haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPhase('launching');

    // ② タイマーフェードイン（0-300ms）
    timerFadeAnim.setValue(0);
    Animated.timing(timerFadeAnim, {
      toValue: 1, duration: T_FADE_IN, easing: Easing.in(Easing.ease), useNativeDriver: true,
    }).start();

    // INFINITE 系：カウントアップ不要、フェード後すぐ running へ
    if (result.status !== 'DEPLETE' || totalSeconds === null) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        glowAnim.setValue(1);
      }, T_FADE_IN);
      setTimeout(() => setPhase('running'), T_FADE_IN + 200);
      return;
    }

    // ③ カウントアップ（300ms 後に開始）
    const launchTime = Date.now();
    const finalSec   = totalSeconds;
    countupIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - launchTime - T_FADE_IN;
      if (elapsed < 0) { setCountupSeconds(0); return; }
      if (elapsed >= T_COUNTUP) {
        setCountupSeconds(finalSec);
        if (countupIntervalRef.current) clearInterval(countupIntervalRef.current);

        // ④ 着地 Light haptic
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // ⑤ running フェーズへ移行
        setTimeout(() => setPhase('running'), T_RUNNING - T_LAND);
        return;
      }
      setCountupSeconds(Math.floor(easeOutCubic(elapsed / T_COUNTUP) * finalSec));
    }, 16);
  }

  // フェーズ終了時にインターバルをクリア
  useEffect(() => {
    if (phase !== 'launching' && countupIntervalRef.current) {
      clearInterval(countupIntervalRef.current);
    }
  }, [phase]);

  // ---- タイマーモード ----
  const timerMode: TimerMode =
    phase === 'idle'      ? 'idle'     :
    phase === 'launching' ? 'countup'  : 'countdown';

  // ---- シェア ----
  const shareCardRef = useRef<View>(null);
  const resultColor = (result.status === 'DEPLETE') ? colors.fire : colors.escape;
  const resultText  = result.status === 'TRUE_INFINITE'
    ? 'INFINITE FREEDOM'
    : result.status === 'PRACTICAL_INFINITE'
      ? '99年以上 逃げ切り濃厚'
      : (() => {
          const t = secondsToComponents(totalSeconds ?? 0);
          return `あと ${t.years}年 ${pad2(t.months)}ヶ月\n生きられます`;
        })();

  async function handleShare() {
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      // Expo Go では view-shot が動かないため無視
    }
  }

  // ---- フォントロード完了 ----
  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root} onLayout={onLayout}>
      <StatusBar style="light" />

      {/* INFINITE転換グロー（全面オーバーレイ） */}
      <Animated.View
        pointerEvents="none"
        style={[styles.glowOverlay, { opacity: glowAnim }]}
      />

      {/* ロゴ */}
      <Text style={styles.logo}>FIRE Escape 🚪</Text>

      {/* タイマーエリア */}
      <Animated.View style={[styles.timerArea, { opacity: phase === 'idle' ? 1 : timerFadeAnim }]}>
        <EscapeTimer
          mode={timerMode}
          countupValue={countupSeconds}
          totalSeconds={totalSeconds}
          status={result.status}
        />
      </Animated.View>

      {/* 称号 / ESCAPEボタン */}
      <View style={styles.middleArea}>
        {phase === 'idle' ? (
          <EscapeButton onPress={handleEscapePress} />
        ) : (
          <>
            <TierTag label={tier.label} color={tier.color} />
            <HintText shortage={shortage} />
          </>
        )}
      </View>

      {/* スライダーパネル */}
      <ScrollView
        style={styles.panelScroll}
        contentContainerStyle={styles.panelContent}
        showsVerticalScrollIndicator={false}
      >
        <InputPanel
          assets={assets}
          monthlyCost={monthlyCost}
          sideIncome={sideIncome}
          annualRate={annualRate}
          onAssetsChange={setAssets}
          onMonthlyCostChange={setMonthlyCost}
          onSideIncomeChange={setSideIncome}
          onAnnualRateChange={setAnnualRate}
        />
      </ScrollView>

      {/* シェアボタン（running フェーズのみ表示） */}
      {phase === 'running' && (
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>SHARE ON X</Text>
        </Pressable>
      )}

      {/* シェアカード（画面外レンダリング、view-shot 用） */}
      <View style={styles.offscreen}>
        <ShareCard
          ref={shareCardRef}
          status={result.status}
          months={result.months}
          assets={assets}
          monthlyCost={monthlyCost}
          sideIncome={sideIncome}
          tierLabel={tier.label}
          resultColor={resultColor}
          resultText={resultText}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.escape,
    opacity: 0,
  },
  logo: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    paddingTop: 8,
  },
  timerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleArea: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  panelScroll: {
    flexShrink: 0,
  },
  panelContent: {
    padding: 16,
    paddingBottom: 8,
  },
  shareButton: {
    margin: 16,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareText: {
    color: colors.muted,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    letterSpacing: 3,
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
});
