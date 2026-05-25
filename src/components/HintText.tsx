import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../lib/tokens';

interface Props {
  shortage: number; // 正値 = TRUE_INFINITE まで不足している円/月
}

const HINT_THRESHOLD = 50_000; // 5万円以内なら煽る（§4.4）

export function HintText({ shortage }: Props) {
  if (shortage <= 0 || shortage > HINT_THRESHOLD) return null;
  const manYen = Math.ceil(shortage / 10_000);
  return (
    <Text style={styles.text}>
      {'あと月'}
      <Text style={styles.amount}>{manYen}万円</Text>
      {'稼げれば、一生自由。'}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  amount: {
    color: colors.escape,
    fontFamily: 'JetBrainsMono_400Regular',
  },
});
