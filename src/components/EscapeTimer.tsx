import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/tokens';
import { pad2, secondsToComponents } from '../lib/formatTime';
import type { EscapeStatus } from '../lib/calcEscape';

export type TimerMode = 'idle' | 'countup' | 'countdown';

interface Props {
  mode: TimerMode;
  countupValue: number;        // mode='countup' 時に表示する秒数（App.tsx 主導）
  totalSeconds: number | null; // mode='countdown' 時のカウントダウン開始秒数
  status: EscapeStatus | null;
}

export function EscapeTimer({ mode, countupValue, totalSeconds, status }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // countdown モード時のみインターバルを管理
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mode !== 'countdown' || totalSeconds === null) return;

    setRemaining(totalSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, totalSeconds]);

  // idle: muted プレースホルダー
  if (mode === 'idle') return <MutedTimer />;

  // INFINITE 系は常に専用表示（カウントアップ中でも即表示）
  if (status === 'TRUE_INFINITE' || status === 'PRACTICAL_INFINITE') {
    return <InfiniteTimer status={status} />;
  }

  const displaySeconds = mode === 'countup' ? countupValue : remaining;
  const t = secondsToComponents(displaySeconds);
  const timerColor = colors.fire;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.num, { color: timerColor }]}>{t.years}</Text>
        <Text style={[styles.unit, { color: timerColor }]}>年 </Text>
        <Text style={[styles.num, { color: timerColor }]}>{pad2(t.months)}</Text>
        <Text style={[styles.unit, { color: timerColor }]}>ヶ月 </Text>
        <Text style={[styles.num, { color: timerColor }]}>{pad2(t.days)}</Text>
        <Text style={[styles.unit, { color: timerColor }]}>日</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.num, { color: timerColor }]}>
          {pad2(t.hours)}:{pad2(t.minutes)}:{pad2(t.seconds)}
        </Text>
      </View>
    </View>
  );
}

function MutedTimer() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.num, styles.muted]}>--</Text>
        <Text style={[styles.unit, styles.muted]}>年 </Text>
        <Text style={[styles.num, styles.muted]}>--</Text>
        <Text style={[styles.unit, styles.muted]}>ヶ月 </Text>
        <Text style={[styles.num, styles.muted]}>--</Text>
        <Text style={[styles.unit, styles.muted]}>日</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.num, styles.muted]}>--:--:--</Text>
      </View>
    </View>
  );
}

function InfiniteTimer({ status }: { status: EscapeStatus }) {
  const label = status === 'TRUE_INFINITE' ? 'INFINITE FREEDOM' : '99年+ 逃げ切り濃厚';
  return (
    <View style={styles.container}>
      <Text style={[styles.infinite, { color: colors.escape }]}>{label}</Text>
    </View>
  );
}

const FONT = 'JetBrainsMono_400Regular';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  num: {
    fontFamily: FONT,
    fontSize: 36,
    color: colors.text,
  },
  unit: {
    fontFamily: FONT,
    fontSize: 16,
    color: colors.text,
  },
  muted: {
    color: colors.muted,
  },
  infinite: {
    fontFamily: FONT,
    fontSize: 28,
    letterSpacing: 2,
  },
});
