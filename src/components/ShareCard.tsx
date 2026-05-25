import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/tokens';
import type { EscapeStatus } from '../lib/calcEscape';

interface Props {
  status: EscapeStatus;
  months: number | null;
  assets: number;
  monthlyCost: number;
  sideIncome: number;
  tierLabel: string;
  resultColor: string;
  resultText: string; // 例: "3年 8ヶ月 生きられます" / "INFINITE FREEDOM"
}

export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { assets, monthlyCost, sideIncome, tierLabel, resultColor, resultText },
  ref,
) {
  return (
    <View ref={ref} style={styles.card}>
      <Text style={styles.appName}>FIRE Escape 🚪</Text>
      <Text style={styles.subtitle}>私のFIRE Escape</Text>
      <Text style={[styles.result, { color: resultColor }]}>{resultText}</Text>
      <View style={[styles.tierBox, { borderColor: resultColor }]}>
        <Text style={[styles.tierLabel, { color: resultColor }]}>{tierLabel}</Text>
      </View>
      <Text style={styles.params}>
        {`資産${Math.round(assets / 10_000)}万 / 生活${Math.round(monthlyCost / 10_000)}万 / 副収入${Math.round(sideIncome / 10_000)}万`}
      </Text>
      <Text style={styles.footer}>#FIRE_Escape    fire-escape.app</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: colors.bg,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  appName: {
    color: colors.muted,
    fontSize: 14,
    letterSpacing: 2,
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
  },
  result: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 36,
  },
  tierBox: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tierLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
  },
  params: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  footer: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 8,
  },
});
