import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/tokens';
import { pad2, secondsToComponents } from '../lib/formatTime';
import type { EscapeStatus } from '../lib/calcEscape';

interface Props {
  // null = 未起動（--:--表示）、数値 = カウントダウン中の残り秒数
  totalSeconds: number | null;
  status: EscapeStatus | null;
}

export function EscapeTimer({ totalSeconds, status }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (totalSeconds === null) return;
    setRemaining(totalSeconds);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSeconds]);

  if (totalSeconds === null || status === null) {
    return <MutedTimer />;
  }

  if (status === 'TRUE_INFINITE' || status === 'PRACTICAL_INFINITE') {
    return <InfiniteTimer status={status} />;
  }

  const t = secondsToComponents(remaining);
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
