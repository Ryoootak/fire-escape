import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors } from '../lib/tokens';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
}

export function SliderRow({ label, value, min, max, step, onChange, formatValue }: Props) {
  const prevValueRef = useRef(value);

  function handleValueChange(next: number) {
    // §4.1.1: ステップ境界をまたいだ時のみ発火（「ベター」と潰れるのを防ぐ）
    if (next !== prevValueRef.current) {
      Haptics.selectionAsync();
      prevValueRef.current = next;
    }
    onChange(next);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatValue(value)}</Text>
      </View>
      <Slider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={handleValueChange}
        minimumTrackTintColor={colors.fire}
        maximumTrackTintColor={colors.muted}
        thumbTintColor={colors.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontFamily: 'JetBrainsMono_400Regular',
    minWidth: 80,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
