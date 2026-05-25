import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SliderRow } from './SliderRow';
import { colors, defaults } from '../lib/tokens';

interface Props {
  assets: number;
  monthlyCost: number;
  sideIncome: number;
  annualRate: number;
  onAssetsChange: (v: number) => void;
  onMonthlyCostChange: (v: number) => void;
  onSideIncomeChange: (v: number) => void;
  onAnnualRateChange: (v: number) => void;
}

function formatMan(yen: number): string {
  if (yen >= 100_000_000) return '1億円';
  return Math.round(yen / 10_000) + '万円';
}

function formatRate(rate: number): string {
  return (Math.round(rate * 1000) / 10).toFixed(1) + '%';
}

export function InputPanel({
  assets, monthlyCost, sideIncome, annualRate,
  onAssetsChange, onMonthlyCostChange, onSideIncomeChange, onAnnualRateChange,
}: Props) {
  return (
    <View style={styles.panel}>
      <SliderRow
        label="現在の総資産"
        value={assets}
        min={0}
        max={100_000_000}
        step={500_000}
        onChange={onAssetsChange}
        formatValue={formatMan}
      />
      <SliderRow
        label="毎月の生活費"
        value={monthlyCost}
        min={50_000}
        max={1_000_000}
        step={10_000}
        onChange={onMonthlyCostChange}
        formatValue={formatMan}
      />
      <SliderRow
        label="退職後のミニマム収入（希望枠）"
        value={sideIncome}
        min={0}
        max={500_000}
        step={10_000}
        onChange={onSideIncomeChange}
        formatValue={formatMan}
      />
      <SliderRow
        label="想定運用利回り（年利）"
        value={annualRate}
        min={0}
        max={0.1}
        step={0.001}
        onChange={onAnnualRateChange}
        formatValue={formatRate}
      />
    </View>
  );
}

// デフォルト値を外部から参照できるようエクスポート
export const sliderDefaults = defaults;

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
});
